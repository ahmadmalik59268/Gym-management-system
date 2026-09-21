import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, SUPABASE_URL } from '../lib/supabaseClient';

export type AppRole = 'Admin' | 'Manager' | 'Receptionist' | 'Trainer' | 'Member' | 'Maintenance' | 'Cleaner';

export interface UserProfile {
  id: string;
  auth_user_id?: string;
  email: string;
  full_name: string;
  role: AppRole;
  phone?: string;
  profile_photo?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getRoleDefaultPath = (role: AppRole): string => {
  switch (role) {
    case 'Admin':
      return '/';
    case 'Manager':
      return '/';
    case 'Receptionist':
      return '/members';
    case 'Trainer':
      return '/workout-plans';
    case 'Member':
      return '/workout-plans';
    case 'Maintenance':
      return '/equipment';
    case 'Cleaner':
      return '/attendance';
    default:
      return '/';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole>('Member'); // Default state is Member for safety during auth initialization
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to load profile from public.user_profiles
  const fetchUserProfile = async (currentUser: User): Promise<UserProfile | null> => {
    try {
      // 1. Try fetching by auth_user_id
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', currentUser.id)
        .maybeSingle();

      if (data && !error) {
        const loadedProfile = data as UserProfile;
        setProfile(loadedProfile);
        setRole((loadedProfile.role as AppRole) || 'Member');
        return loadedProfile;
      }

      // 2. Fallback: try fetching by email if auth_user_id not yet linked
      if (currentUser.email) {
        const { data: emailData, error: emailErr } = await supabase
          .from('user_profiles')
          .select('*')
          .ilike('email', currentUser.email)
          .maybeSingle();

        if (emailData && !emailErr) {
          // Link auth_user_id if missing
          if (!emailData.auth_user_id) {
            await supabase
              .from('user_profiles')
              .update({ auth_user_id: currentUser.id })
              .eq('id', emailData.id);
          }
          const loadedProfile = emailData as UserProfile;
          setProfile(loadedProfile);
          setRole((loadedProfile.role as AppRole) || 'Member');
          return loadedProfile;
        }
      }

      // 3. If no profile exists yet, retry once after a short delay to allow trigger completion
      await new Promise((resolve) => setTimeout(resolve, 400));
      const { data: retryData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', currentUser.id)
        .maybeSingle();

      if (retryData) {
        const loadedProfile = retryData as UserProfile;
        setProfile(loadedProfile);
        setRole((loadedProfile.role as AppRole) || 'Member');
        return loadedProfile;
      }

      // 4. Self-healing fallback: insert member profile directly if trigger failed or didn't run
      try {
        const defaultName =
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email?.split('@')[0] ||
          'Member';
        const defaultPhone = currentUser.user_metadata?.phone || '';

        const { data: insertedData, error: insErr } = await supabase
          .from('user_profiles')
          .insert({
            auth_user_id: currentUser.id,
            email: currentUser.email,
            full_name: defaultName,
            phone: defaultPhone,
            role: 'Member',
            status: 'Active',
          })
          .select('*')
          .maybeSingle();

        if (insertedData && !insErr) {
          const loadedProfile = insertedData as UserProfile;
          setProfile(loadedProfile);
          setRole('Member');
          return loadedProfile;
        }
      } catch (selfHealErr) {
        console.warn('Self-healing profile creation note:', selfHealErr);
      }

      // Safe default role assignment in frontend state
      setRole('Member');
      return null;
    } catch (err) {
      console.error('Error fetching user profile from public.user_profiles:', err);
      setRole('Member');
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('Member');
      setIsLoading(false);
      return;
    }

    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // 1. Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Error retrieving Supabase session:', sessionError);
        }

        if (!isMounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchUserProfile(initialSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole('Member');
        }
      } catch (err) {
        console.error('App Startup Auth Initialization Error:', err);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setRole('Member');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // 2. Attach single onAuthStateChange listener for future events
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!isMounted) return;

          // Skip INITIAL_SESSION event since initializeAuth already resolved initial state
          if (event === 'INITIAL_SESSION') return;

          if (event === 'SIGNED_OUT' || !currentSession?.user) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setRole('Member');
            setIsLoading(false);
            return;
          }

          setSession(currentSession);
          setUser(currentSession.user);
          await fetchUserProfile(currentSession.user);
          setIsLoading(false);
        }
      );

      authSubscription = subscription;
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase backend is not configured. Please configure your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY or enter your keys using Configure Keys.'
        ),
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { error };

      if (data.user) {
        setSession(data.session);
        setUser(data.user);
        const userProfile = await fetchUserProfile(data.user);

        // Account status check
        if (userProfile && userProfile.status === 'Inactive') {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          setRole('Member');
          return {
            error: new Error('Your account is marked inactive. Please contact the gym administrator.'),
          };
        }
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error(
          'Supabase backend is not configured. Please configure your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY or enter your keys using Configure Keys.'
        ),
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || '',
          },
        },
      });
      if (error) return { error };

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        await fetchUserProfile(data.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new Error('Supabase backend is not configured. Please enter your Supabase keys first.'),
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/login',
      });
      if (error) return { error };
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole('Member');
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  // RBAC Access Control Matrix based strictly on user_profiles.role
  const hasAccess = (module: string): boolean => {
    if (!user && !isSupabaseConfigured) return true; // Preview mode when unconfigured
    
    // Admin has full access to every module
    if (role === 'Admin') return true;

    const normalizedModule = module.toLowerCase().trim();

    // Manager
    if (role === 'Manager') {
      const allowed = [
        'dashboard',
        'members',
        'memberships',
        'payments',
        'trainers',
        'attendance',
        'workout-plans',
        'diet-plans',
        'equipment',
        'reports',
        'notifications',
        'forms',
        'leads'
      ];
      // Explicitly reject forbidden modules
      const forbidden = ['staff', 'payroll', 'expenses', 'settings', 'users-and-roles', 'user-management'];
      if (forbidden.some(item => normalizedModule.includes(item))) {
        return false;
      }
      return allowed.some(item => normalizedModule.includes(item));
    }

    // Receptionist
    if (role === 'Receptionist') {
      const allowed = [
        'members',
        'memberships',
        'payments',
        'attendance',
        'forms',
        'leads'
      ];
      if (normalizedModule === 'dashboard' || normalizedModule === '' || normalizedModule === '/') {
        return false;
      }
      const forbidden = ['staff', 'payroll', 'expenses', 'settings', 'users-and-roles', 'user-management', 'trainers', 'reports'];
      if (forbidden.some(item => normalizedModule.includes(item))) {
        return false;
      }
      return allowed.some(item => normalizedModule.includes(item));
    }

    // Trainer
    if (role === 'Trainer') {
      const allowed = [
        'trainers/profile',
        'trainers/assignments',
        'workout-plans',
        'diet-plans',
        'attendance',
        'notifications'
      ];
      if (normalizedModule === 'dashboard' || normalizedModule === '' || normalizedModule === '/') {
        return false;
      }
      const forbidden = ['members', 'payments', 'expenses', 'payroll', 'staff', 'settings', 'equipment', 'reports', 'users-and-roles', 'user-management'];
      if (forbidden.some(item => normalizedModule.includes(item))) {
        return false;
      }
      return allowed.some(item => normalizedModule.includes(item));
    }

    // Member
    if (role === 'Member') {
      const allowed = [
        'members/profile',
        'workout-plans',
        'diet-plans',
        'attendance',
        'notifications',
        'memberships',
        'payments'
      ];
      // Cannot see the members list page
      if (normalizedModule === 'members' || normalizedModule === 'members/' || normalizedModule === 'dashboard' || normalizedModule === '' || normalizedModule === '/') {
        return false;
      }
      const forbidden = ['staff', 'payroll', 'expenses', 'settings', 'equipment', 'reports', 'trainers', 'users-and-roles', 'user-management'];
      if (forbidden.some(item => normalizedModule.includes(item))) {
        return false;
      }
      return allowed.some(item => normalizedModule.includes(item));
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        resetPassword,
        signOut,
        refreshProfile,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
