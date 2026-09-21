import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useAuth, getRoleDefaultPath } from '../context/AuthContext';
import { isSupabaseConfigured, saveCustomCredentials } from '../lib/supabaseClient';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, isLoading, signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'config'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick config state if user needs to enter their Supabase keys directly in browser
  const [configUrl, setConfigUrl] = useState('');
  const [configKey, setConfigKey] = useState('');

  // If already authenticated and done loading, redirect directly to user's authorized path
  useEffect(() => {
    if (!isLoading && user) {
      navigate(getRoleDefaultPath(role), { replace: true });
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 animate-pulse">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">APEXFIT SYSTEM</h2>
        <p className="text-xs text-slate-400">Verifying session & permissions...</p>
        <div className="mt-4 w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(cleanEmail, password);
    setIsSubmitting(false);

    if (error) {
      const err = error.message?.toLowerCase() || '';
      if (err.includes('invalid login credentials') || err.includes('invalid_grant')) {
        setErrorMsg('Incorrect email or password. Please verify your credentials and try again.');
      } else if (err.includes('email not confirmed')) {
        setErrorMsg('Your email is not confirmed yet. Please verify your email inbox or check your Supabase Auth settings.');
      } else if (err.includes('inactive')) {
        setErrorMsg('Your account is marked inactive. Please contact the gym administrator.');
      } else {
        setErrorMsg(error.message || 'Login failed. Please check your network and credentials.');
      }
    } else {
      navigate(getRoleDefaultPath(role), { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!cleanEmail) {
      setErrorMsg('Valid email address is required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(cleanEmail, password, cleanName, cleanPhone);
    setIsSubmitting(false);

    if (error) {
      const err = error.message?.toLowerCase() || '';
      if (err.includes('already registered') || err.includes('unique constraint') || err.includes('user already exists')) {
        setErrorMsg('An account with this email already exists. Please Sign In.');
      } else if (err.includes('database error saving new user') || err.includes('saving new user')) {
        setErrorMsg(
          'Supabase Database Error: Database trigger failed while provisioning your profile in public.user_profiles. To fix this, run the quick SQL script "fix-user-signup-trigger.sql" in your Supabase SQL Editor.'
        );
      } else {
        setErrorMsg(error.message || 'Failed to create account. Please try again.');
      }
    } else {
      setSuccessMsg(
        'Account registered successfully! A Member profile has been provisioned. If email confirmation is enabled on your Supabase project, check your inbox; otherwise you can log in directly.'
      );
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(cleanEmail);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Could not send reset email. Please try again later.');
    } else {
      setSuccessMsg(
        `If an account exists for ${cleanEmail}, a password reset link has been dispatched to your email address.`
      );
      setResetEmail('');
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configUrl.trim() || !configKey.trim()) {
      setErrorMsg('Both Supabase Project URL and Anon/Publishable Key are required.');
      return;
    }
    saveCustomCredentials(configUrl.trim(), configKey.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Navigation to Landing Page */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/landing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            APEX<span className="text-indigo-400">FIT</span> SYSTEM
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            Commercial Club Management Portal
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Supabase Connection Status Bar */}
          <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-semibold text-slate-300">
                {isSupabaseConfigured ? 'Supabase Backend Connected' : 'Supabase Credentials Needed'}
              </span>
            </div>
            {!isSupabaseConfigured && (
              <button
                type="button"
                onClick={() => {
                  setMode('config');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                Configure Keys
              </button>
            )}
          </div>

          {/* Mode Switcher Tabs (Sign In / Register) */}
          {mode !== 'config' && mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Forgot Password Header */}
          {mode === 'forgot' && (
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-indigo-400" /> Reset Password
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          )}

          {/* Config Header */}
          {mode === 'config' && (
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-400" /> Enter Supabase Keys
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          )}

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Error</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs animate-in fade-in-50">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Success</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@apexfit.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setResetEmail(email);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-3 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Hunter"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-800/50 p-3 rounded-lg flex items-start gap-2 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  New registrations are created with the safe default <strong>Member</strong> role. Staff/Trainer/Admin elevation is managed strictly through backend database controls.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter your registered email address below. We will send you a secure password reset link via Supabase Auth.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 4. CONFIG FORM */}
          {mode === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                Save your frontend-safe Supabase credentials here for this browser session, or define <code className="text-white">VITE_SUPABASE_URL</code> and <code className="text-white">VITE_SUPABASE_PUBLISHABLE_KEY</code> in your environment file.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supabase Anon / Publishable Key
                </label>
                <input
                  type="text"
                  required
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="text-[10px] text-amber-400/90 font-medium">
                ⚠️ Never enter your secret or service_role key here. Use only the public anon key.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Save & Connect
              </button>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>PostgreSQL Row Level Security (RLS) Enforced</span>
        </div>
      </div>
    </div>
  );
};
