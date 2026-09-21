import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  CalendarCheck,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ChevronRight,
  AlertCircle,
  Plus,
  FileText,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';

export const Dashboard: React.FC = () => {
  const {
    members,
    memberships,
    payments,
    attendance,
    expenses,
    formSubmissions,
    getPlan,
    getMember,
    formatCurrency,
    currency,
  } = useGym();

  // Metrics calculations
  const totalMembers = (members || []).length;
  const activeMembers = (members || []).filter((m) => m.status === 'Active').length;
  const expiredMembers = (members || []).filter((m) => m.status === 'Expired').length;
  const expiringMembers = (members || []).filter((m) => m.status === 'Expiring Soon').length;

  const todayStr = '2025-03-17'; // current simulation date
  const todayAttendance = (attendance || []).filter((a) => a.date === todayStr);
  const todayPresentCount = todayAttendance.length;

  const todayPayments = (payments || []).filter((p) => p.date === todayStr || p.date.startsWith('2025-03-15') || p.date.startsWith('2025-03-16'));
  const todayCollection = todayPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyRevenue = (payments || []).reduce((acc, curr) => acc + curr.amount, 0);
  const monthlyExpenses = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
  const netIncome = monthlyRevenue - monthlyExpenses;

  // Monthly Revenue Data for Chart
  const revenueData = [
    { month: 'Oct', revenue: 9800, expenses: 7200 },
    { month: 'Nov', revenue: 11400, expenses: 7600 },
    { month: 'Dec', revenue: 13900, expenses: 8400 },
    { month: 'Jan', revenue: 18200, expenses: 8900 },
    { month: 'Feb', revenue: 21500, expenses: 9100 },
    { month: 'Mar', revenue: 24800, expenses: 9800 },
  ];

  // Attendance Trend Data (Last 7 days)
  const attendanceTrend = [
    { day: 'Mon', count: 142 },
    { day: 'Tue', count: 158 },
    { day: 'Wed', count: 165 },
    { day: 'Thu', count: 149 },
    { day: 'Fri', count: 172 },
    { day: 'Sat', count: 195 },
    { day: 'Sun', count: 124 },
  ];

  // Expiring memberships
  const expiringMembersList = (members || []).filter((m) => m.status === 'Expiring Soon').slice(0, 5);

  // Recent members
  const recentMembers = [...(members || [])]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);

  // Recent payments
  const recentPayments = [...(payments || [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const newInquiriesCount = (formSubmissions || []).filter((s) => s.status === 'New').length;
  const recentInquiries = (formSubmissions || []).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Club Overview & Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, membership retention, and daily facility floor activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/forms">
            <Button
              size="sm"
              variant="outline"
              icon={<FileText className="w-4 h-4 text-indigo-600" />}
              className="relative"
            >
              Forms & Leads
              {newInquiriesCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                  {newInquiriesCount}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/members/new">
            <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Member
            </Button>
          </Link>
          <Link to="/attendance">
            <Button size="sm" variant="outline" icon={<CalendarCheck className="w-4 h-4" />}>
              Mark Check-In
            </Button>
          </Link>
          <Link to="/payments">
            <Button size="sm" variant="secondary" icon={<CreditCard className="w-4 h-4" />}>
              Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600"
          trend={{ value: '12% this month', isPositive: true }}
          subtitle="All registered clients"
        />
        <StatCard
          title="Active Members"
          value={activeMembers}
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          trend={{ value: '89.4% retention', isPositive: true }}
          subtitle="Valid memberships"
        />
        <StatCard
          title="Expired Members"
          value={expiredMembers}
          icon={<UserX className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
          subtitle={`${expiringMembers} expiring this week`}
        />
        <StatCard
          title="Today's Attendance"
          value={todayPresentCount}
          icon={<CalendarCheck className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
          trend={{ value: '+8% vs yesterday', isPositive: true }}
          subtitle="Checked in today"
        />
        <StatCard
          title="Today's Collection"
          value={formatCurrency(todayCollection)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
          subtitle="Receipts processed"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          icon={<CreditCard className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
          trend={{ value: '+18.5%', isPositive: true }}
          subtitle="Gross receipts"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-700"
          subtitle="Facility & payroll"
        />
        <StatCard
          title="Net Income"
          value={formatCurrency(netIncome)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor={netIncome >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
          trend={{ value: 'Profitable margin', isPositive: true }}
          subtitle="Revenue minus expenses"
        />
      </div>

      {/* Middle Row: Charts & Membership Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview (SVG Interactive Bar/Line Chart) */}
        <Card
          title="Revenue & Expense Overview"
          subtitle={`Monthly financial progression (${currency})`}
          className="lg:col-span-2"
          action={
            <Link to="/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Full Report <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-indigo-600" />
                <span className="text-slate-600 font-medium">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-slate-300" />
                <span className="text-slate-600 font-medium">Expenses</span>
              </div>
            </div>

            {/* Custom SVG Responsive Chart */}
            <div className="h-56 w-full pt-4">
              <div className="h-full flex items-end justify-between gap-2 sm:gap-6 px-2 border-b border-slate-200 pb-2">
                {revenueData.map((item) => {
                  const maxVal = 26000;
                  const revHeight = (item.revenue / maxVal) * 100;
                  const expHeight = (item.expenses / maxVal) * 100;

                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                        {/* Revenue Bar */}
                        <div
                          style={{ height: `${revHeight}%` }}
                          className="w-full max-w-[20px] sm:max-w-[28px] bg-indigo-600 hover:bg-indigo-700 rounded-t-md transition-all relative"
                          title={`Revenue: ${formatCurrency(item.revenue)}`}
                        />
                        {/* Expense Bar */}
                        <div
                          style={{ height: `${expHeight}%` }}
                          className="w-full max-w-[20px] sm:max-w-[28px] bg-slate-300 hover:bg-slate-400 rounded-t-md transition-all relative"
                          title={`Expenses: ${formatCurrency(item.expenses)}`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Membership Overview Breakdown */}
        <Card
          title="Membership Distribution"
          subtitle="Status proportion of current roster"
          action={
            <Link to="/memberships" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          }
        >
          <div className="space-y-5">
            {/* Progress breakdown */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Members
                  </span>
                  <span className="text-slate-900 font-bold">
                    {activeMembers} ({Math.round((activeMembers / totalMembers) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(activeMembers / totalMembers) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Expiring Soon
                  </span>
                  <span className="text-slate-900 font-bold">
                    {expiringMembers} ({Math.round((expiringMembers / totalMembers) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(expiringMembers / totalMembers) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Expired Members
                  </span>
                  <span className="text-slate-900 font-bold">
                    {expiredMembers} ({Math.round((expiredMembers / totalMembers) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(expiredMembers / totalMembers) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick alert box for renewal follow up */}
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Action Required
              </div>
              <p className="text-amber-800">
                {expiringMembers} member(s) expiring within the next 7 days. Send reminder alerts to reduce churn.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Trend Chart Card */}
      <Card
        title="Weekly Attendance Flow"
        subtitle="Average daily check-ins recorded at front gate"
        action={
          <Link to="/attendance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            Attendance Logs →
          </Link>
        }
      >
        <div className="grid grid-cols-7 gap-1 sm:gap-3 pt-2">
          {attendanceTrend.map((item) => (
            <div key={item.day} className="flex flex-col items-center gap-1.5">
              <div className="h-28 w-full bg-slate-50 rounded-lg flex flex-col justify-end p-0.5 sm:p-1">
                <div
                  style={{ height: `${(item.count / 200) * 100}%` }}
                  className="w-full bg-violet-500 hover:bg-violet-600 rounded-md transition-all flex items-center justify-center text-[9px] sm:text-[10px] text-white font-bold"
                  title={`${item.count} check-ins`}
                >
                  <span className="hidden sm:inline">{item.count}</span>
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-600">{item.day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom Grid: Recent Payments, Recent Members & Expiring Memberships */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <Card
          title="Recent Payments"
          subtitle="Latest client invoice transactions"
          action={
            <Link to="/payments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          }
        >
          <div className="divide-y divide-slate-100 -mx-5 -my-2">
            {recentPayments.map((p) => {
              const member = getMember(p.memberId);
              return (
                <div key={p.receiptNumber} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar src={member?.profilePhoto} name={member?.fullName || p.memberId} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{member?.fullName || p.memberId}</p>
                      <p className="text-[11px] text-slate-400">{p.date} • {p.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 block">{formatCurrency(p.amount)}</span>
                    <Badge variant={p.status === 'Paid' ? 'success' : 'warning'} size="sm">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Members */}
        <Card
          title="Recent Members"
          subtitle="Newly registered athlete profiles"
          action={
            <Link to="/members" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          }
        >
          <div className="divide-y divide-slate-100 -mx-5 -my-2">
            {recentMembers.map((m) => {
              const membership = memberships.find((ms) => ms.memberId === m.id);
              const plan = membership ? getPlan(membership.planId) : undefined;
              return (
                <Link
                  key={m.id}
                  to={`/members/${m.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={m.profilePhoto} name={m.fullName} size="sm" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.fullName}</p>
                      <p className="text-[11px] text-slate-400">
                        {plan ? plan.name : 'Standard'} • Joined {m.joinDate}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      m.status === 'Active' ? 'success' : m.status === 'Expiring Soon' ? 'warning' : 'danger'
                    }
                    size="sm"
                  >
                    {m.status}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Expiring Memberships */}
        <Card
          title="Expiring Memberships"
          subtitle="Priority renewals due shortly"
          action={
            <Link to="/memberships" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          }
        >
          <div className="divide-y divide-slate-100 -mx-5 -my-2">
            {expiringMembersList.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-slate-400">No expiring memberships</p>
            ) : (
              expiringMembersList.map((m) => {
                const ms = memberships.find((item) => item.memberId === m.id);
                return (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar src={m.profilePhoto} name={m.fullName} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{m.fullName}</p>
                        <p className="text-[11px] text-slate-400">
                          Expires: {ms ? ms.endDate : 'Within 7 days'}
                        </p>
                      </div>
                    </div>
                    <Link to={`/members/${m.id}`}>
                      <Button size="sm" variant="outline" className="text-[11px] py-1 px-2.5">
                        Renew
                      </Button>
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Website Leads & Forms Submissions (Captured from Landing Page) */}
      <Card
        title="Website Leads & Forms"
        subtitle="Recent inquiries and membership requests submitted via public landing page"
        action={
          <div className="flex items-center gap-3">
            <Link
              to="/landing"
              target="_blank"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Page</span>
            </Link>
            <Link
              to="/forms"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage All ({formSubmissions?.length || 0})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        }
      >
        {(!formSubmissions || formSubmissions.length === 0) ? (
          <div className="py-8 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No website leads received yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inquiries submitted through your landing page contact form will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 -my-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-5">Lead / Sender</th>
                  <th className="py-2.5 px-4">Inquiry Type</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Submitted</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-bold text-slate-900">{inq.name}</div>
                      <div className="text-[11px] text-slate-400">{inq.email} {inq.phone ? `• ${inq.phone}` : ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {inq.formType}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                      {inq.subject}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          inq.status === 'Converted'
                            ? 'success'
                            : inq.status === 'Contacted'
                            ? 'warning'
                            : inq.status === 'New'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {inq.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <Link
                        to="/forms"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <span>Open Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
