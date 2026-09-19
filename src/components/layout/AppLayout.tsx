import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/ToastContainer';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { user, isLoading, isConfigured, hasAccess, role } = useAuth();
  const location = useLocation();

  // Loading state while checking active Supabase session
  if (isConfigured && isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 animate-pulse">
          <Dumbbell className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">APEXFIT SYSTEM</h2>
        <p className="text-xs text-slate-400">Verifying Supabase authentication & session...</p>
        <div className="mt-4 w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if Supabase is configured and user is not authenticated
  if (isConfigured && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce dynamic RBAC path authorization
  const pathNameClean = location.pathname.replace(/^\/|\/$/g, '') || 'dashboard';
  const isAuthorized = hasAccess(pathNameClean);

  if (isConfigured && user && !isAuthorized) {
    if (role === 'Receptionist') {
      return <Navigate to="/members" replace />;
    }
    if (role === 'Trainer') {
      return <Navigate to="/workout-plans" replace />;
    }
    if (role === 'Member') {
      return <Navigate to="/workout-plans" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Persistent Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
      />

      {/* Main App Canvas */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isDesktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isDesktopCollapsed={isDesktopCollapsed}
          onToggleDesktopSidebar={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Reactive Toasts */}
      <ToastContainer />
    </div>
  );
};
