import React from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertCircle,
  Clock,
  UserPlus,
  DollarSign,
  Wrench,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useGym();

  const getIcon = (type: string) => {
    switch (type) {
      case 'membership_expiry':
      case 'membership_expired':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'payment_pending':
        return <DollarSign className="w-5 h-5 text-rose-500" />;
      case 'new_member':
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      case 'maintenance_due':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Facility Notifications & Alerts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated alerts regarding memberships, payments, and equipment upkeep.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={markAllNotificationsAsRead}
          >
            Mark All Read
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-rose-600"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={clearNotifications}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          title="All caught up"
          description="No unread operational or facility alerts at this time."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? 'bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-50'
                  : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
            >
              <div className="p-2.5 rounded-lg bg-slate-100 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm font-bold ${
                      !n.isRead ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                    {n.date}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
