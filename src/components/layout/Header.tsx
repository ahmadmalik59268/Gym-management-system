import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useGym, SUPPORTED_CURRENCIES } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';
import { GlobalSearchModal } from './GlobalSearchModal';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isDesktopCollapsed: boolean;
  onToggleDesktopSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  isDesktopCollapsed,
  onToggleDesktopSidebar,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    currency,
    currencySymbol,
    setCurrency,
  } = useGym();

  const { user, profile, role, signOut, isConfigured } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Gym Staff');
  const displayEmail = user?.email || 'Authenticated User';
  const displayRole = role || 'Member';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'AF';

  // Determine active title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/members') return 'Members';
    if (path === '/members/new') return 'Add Member';
    if (path.startsWith('/members/')) return 'Member Profile';
    if (path === '/memberships') return 'Active Memberships';
    if (path === '/memberships/plans') return 'Membership Plans';
    if (path === '/payments') return 'Payments & Receipts';
    if (path === '/attendance') return 'Attendance Tracker';
    if (path === '/trainers') return 'Trainers';
    if (path === '/trainers/assignments') return 'Trainer Assignments';
    if (path === '/fitness/workout-plans') return 'Workout Plans';
    if (path === '/fitness/diet-plans') return 'Diet Plans';
    if (path === '/finance/expenses') return 'Expense Management';
    if (path === '/equipment') return 'Gym Equipment';
    if (path === '/reports') return 'Analytics & Reports';
    if (path === '/notifications') return 'Notification Center';
    if (path === '/staff') return 'Staff & Users';
    if (path === '/settings') return 'System Settings';
    return 'Gym Management';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 shadow-xs">
        {/* Left Side: Toggle & Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger */}
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Trigger */}
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isDesktopCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Current Page Title */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
              {getPageTitle()}
            </h1>
            <span className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
              Commercial Club Operations
            </span>
          </div>
        </div>

        {/* Right Side: Search, Currency, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
              title="Change Currency (PKR / USD / etc.)"
            >
              <span className="text-emerald-700 font-extrabold">{currencySymbol || 'Rs.'}</span>
              <span>{currency || 'PKR'}</span>
              <ChevronDown className="w-3 h-3 text-emerald-600" />
            </button>

            {isCurrencyOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCurrencyOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 p-1.5">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70 -mx-1.5 -mt-1.5 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Active Currency
                    </span>
                    <span className="text-[11px] text-slate-600">Select display currency</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-0.5">
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr.code, curr.symbol);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                          currency === curr.code
                            ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center font-extrabold text-emerald-700">{curr.symbol}</span>
                          <div>
                            <div className="font-semibold">{curr.code}</div>
                            <div className="text-[10px] text-slate-400">{curr.name}</div>
                          </div>
                        </div>
                        {currency === curr.code && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/70 text-slate-500 text-xs border border-slate-200 transition-colors"
            title="Search members or payments"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-medium">Quick search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200">
              /
            </kbd>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {!notifications || notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications
                      </div>
                    ) : (
                      (notifications || []).slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                            !n.isRead ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                    <Link
                      to="/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 block py-1"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-500 block capitalize font-medium">{displayRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in-50 zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 capitalize">
                      {displayRole} Role (Supabase RLS)
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Gym Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/staff');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Staff Access</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/reports');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Financial Reports</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={async () => {
                        setIsProfileOpen(false);
                        await signOut();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
