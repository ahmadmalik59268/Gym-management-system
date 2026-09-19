import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  Apple,
  DollarSign,
  Wrench,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  PlusCircle,
  Award,
  Layers,
  UserCheck,
  Banknote,
} from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isDesktopCollapsed,
}) => {
  const location = useLocation();
  const { notifications, members, payments } = useGym();
  const { role, isConfigured, hasAccess } = useAuth();

  // Submenu toggle states
  const [membersExpanded, setMembersExpanded] = useState(
    location.pathname.startsWith('/members')
  );
  const [membershipsExpanded, setMembershipsExpanded] = useState(
    location.pathname.startsWith('/memberships')
  );
  const [trainersExpanded, setTrainersExpanded] = useState(
    location.pathname.startsWith('/trainers')
  );
  const [fitnessExpanded, setFitnessExpanded] = useState(
    location.pathname.startsWith('/fitness')
  );

  const unreadNotifsCount = (notifications || []).filter((n) => !n.isRead).length;
  const expiringMembersCount = (members || []).filter((m) => m.status === 'Expiring Soon').length;

  const closeMobile = () => setIsMobileOpen(false);

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
    }`;

  const subNavItemClass = (isActive: boolean) =>
    `flex items-center gap-2 pl-9 pr-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'text-indigo-400 bg-slate-800/90 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/30 shrink-0">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            {!isDesktopCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-white text-base tracking-tight block leading-tight">
                  APEX<span className="text-indigo-400">FIT</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                  Gym Management
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Dashboard */}
          {hasAccess('dashboard') && (
            <NavLink
              to="/"
              end
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Dashboard</span>}
            </NavLink>
          )}

          {/* Members dropdown */}
          {hasAccess('members') && (
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isDesktopCollapsed) return;
                  setMembersExpanded(!membersExpanded);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/members')
                    ? 'text-white bg-slate-800/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Members"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 shrink-0 text-slate-300" />
                  {!isDesktopCollapsed && <span>Members</span>}
                </div>
                {!isDesktopCollapsed && (
                  <div className="flex items-center gap-1.5">
                    {expiringMembersCount > 0 && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {expiringMembersCount}
                      </span>
                    )}
                    {membersExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>
              {(!isDesktopCollapsed && membersExpanded) && (
                <div className="space-y-1 mt-1">
                  <NavLink
                    to="/members"
                    end
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Members</span>
                  </NavLink>
                  <NavLink
                    to="/members/add"
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Memberships dropdown */}
          {hasAccess('memberships') && (
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isDesktopCollapsed) return;
                  setMembershipsExpanded(!membershipsExpanded);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/memberships')
                    ? 'text-white bg-slate-800/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Memberships"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 shrink-0 text-slate-300" />
                  {!isDesktopCollapsed && <span>Memberships</span>}
                </div>
                {!isDesktopCollapsed && (
                  <div>
                    {membershipsExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>
              {(!isDesktopCollapsed && membershipsExpanded) && (
                <div className="space-y-1 mt-1">
                  <NavLink
                    to="/memberships/plans"
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Plans</span>
                  </NavLink>
                  <NavLink
                    to="/memberships"
                    end
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Active Memberships</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Payments */}
          {hasAccess('payments') && (
            <NavLink
              to="/payments"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Payments"
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Payments</span>}
            </NavLink>
          )}

          {/* Attendance */}
          {hasAccess('attendance') && (
            <NavLink
              to="/attendance"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Attendance"
            >
              <CalendarCheck className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Attendance</span>}
            </NavLink>
          )}

          {/* Payroll & Salary */}
          {hasAccess('payroll') && (
            <NavLink
              to="/payroll"
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive || location.pathname.startsWith('/payroll')
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`
              }
              title="Payroll & Salaries"
            >
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 shrink-0 text-emerald-400" />
                {!isDesktopCollapsed && <span>Payroll</span>}
              </div>
              {!isDesktopCollapsed && (
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-sm border border-emerald-500/30">
                  PRO
                </span>
              )}
            </NavLink>
          )}

          {/* Trainers dropdown */}
          {hasAccess('trainers') && (
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isDesktopCollapsed) return;
                  setTrainersExpanded(!trainersExpanded);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/trainers')
                    ? 'text-white bg-slate-800/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Trainers"
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 shrink-0 text-slate-300" />
                  {!isDesktopCollapsed && <span>Trainers</span>}
                </div>
                {!isDesktopCollapsed && (
                  <div>
                    {trainersExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>
              {(!isDesktopCollapsed && trainersExpanded) && (
                <div className="space-y-1 mt-1">
                  <NavLink
                    to="/trainers"
                    end
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <span>Trainers List</span>
                  </NavLink>
                  <NavLink
                    to="/trainers/assignments"
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <span>Assignments</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Fitness (Workout & Diet) */}
          {hasAccess('workout-plans') && (
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isDesktopCollapsed) return;
                  setFitnessExpanded(!fitnessExpanded);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/fitness')
                    ? 'text-white bg-slate-800/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Fitness"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 text-slate-300" />
                  {!isDesktopCollapsed && <span>Fitness Plans</span>}
                </div>
                {!isDesktopCollapsed && (
                  <div>
                    {fitnessExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>
              {(!isDesktopCollapsed && fitnessExpanded) && (
                <div className="space-y-1 mt-1">
                  <NavLink
                    to="/workout-plans"
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Workout Plans</span>
                  </NavLink>
                  <NavLink
                    to="/diet-plans"
                    onClick={closeMobile}
                    className={({ isActive }) => subNavItemClass(isActive)}
                  >
                    <Apple className="w-3.5 h-3.5" />
                    <span>Diet Plans</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Expenses */}
          {hasAccess('expenses') && (
            <NavLink
              to="/expenses"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Expenses"
            >
              <DollarSign className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Expenses</span>}
            </NavLink>
          )}

          {/* Equipment */}
          {hasAccess('equipment') && (
            <NavLink
              to="/equipment"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Equipment"
            >
              <Wrench className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Equipment</span>}
            </NavLink>
          )}

          {/* Reports */}
          {hasAccess('reports') && (
            <NavLink
              to="/reports"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Reports"
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Reports</span>}
            </NavLink>
          )}

          {/* Notifications */}
          {hasAccess('notifications') && (
            <NavLink
              to="/notifications"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Notifications"
            >
              <div className="relative shrink-0">
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </div>
              {!isDesktopCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Notifications</span>
                  {unreadNotifsCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadNotifsCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          )}

          {/* Staff */}
          {hasAccess('staff') && (
            <NavLink
              to="/staff"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Staff"
            >
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Staff</span>}
            </NavLink>
          )}

          {/* Settings */}
          {hasAccess('settings') && (
            <NavLink
              to="/settings"
              onClick={closeMobile}
              className={({ isActive }) => navItemClass(isActive)}
              title="Settings"
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!isDesktopCollapsed && <span>Settings</span>}
            </NavLink>
          )}
        </div>

        {/* Footer info in sidebar */}
        {!isDesktopCollapsed && (
          <div className="p-3 border-t border-slate-800 bg-slate-900/50">
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs font-semibold text-slate-200">
                  {isConfigured ? 'Supabase Backend' : 'Local Standalone'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                Role: <span className="text-indigo-400 font-semibold">{role || 'Admin'}</span>
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
