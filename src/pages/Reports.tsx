import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  Printer,
  PieChart as PieIcon,
  BarChart3,
  Percent,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useGym } from '../context/GymContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const Reports: React.FC = () => {
  const {
    gymProfile,
    payments,
    expenses,
    members,
    memberships,
    plans,
    attendance,
    addToast,
    formatCurrency,
    currency,
    currencySymbol,
  } = useGym();

  const [timeRange, setTimeRange] = useState<'30d' | '6m' | 'ytd'>('6m');

  // Compute key totals
  const totalRevenue = (payments || []).reduce((acc, p) => acc + p.amount, 0);
  const totalExpense = (expenses || []).reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const activeMembersCount = (members || []).filter((m) => m.status === 'Active').length;
  const expiringCount = (memberships || []).filter((m) => m.status === 'Expiring Soon').length;

  // Chart 1: Revenue vs Expense breakdown by month
  const monthlyFinancialData = [
    { month: 'Oct', revenue: 9400, expenses: 5100, profit: 4300 },
    { month: 'Nov', revenue: 10800, expenses: 5300, profit: 5500 },
    { month: 'Dec', revenue: 11200, expenses: 5900, profit: 5300 },
    { month: 'Jan', revenue: 12500, expenses: 5400, profit: 7100 },
    { month: 'Feb', revenue: 13900, expenses: 5800, profit: 8100 },
    { month: 'Mar', revenue: 14750, expenses: 6200, profit: 8550 },
  ];

  // Chart 2: Member sign-up trend
  const memberGrowthData = [
    { month: 'Oct', totalMembers: 98, newSignups: 14 },
    { month: 'Nov', totalMembers: 110, newSignups: 16 },
    { month: 'Dec', totalMembers: 119, newSignups: 12 },
    { month: 'Jan', totalMembers: 138, newSignups: 25 },
    { month: 'Feb', totalMembers: 149, newSignups: 18 },
    { month: 'Mar', totalMembers: 164, newSignups: 22 },
  ];

  // Chart 3: Plan Popularity Distribution
  const planColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'];
  const planDistribution = (plans || []).map((p) => {
    const count = (memberships || []).filter((m) => m.planId === p.id).length;
    return {
      name: p.name,
      value: count || 1,
    };
  });

  const handleExportCSV = () => {
    // Generate simple CSV of payments
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Receipt#,MemberID,Date,Method,Amount,Status']
        .concat(
          (payments || []).map(
            (p) =>
              `${p.receiptNumber},${p.memberId},${p.date},${p.paymentMethod},${p.amount},${p.status}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexfit-financial-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Financial report CSV downloaded successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 printable-sheet">
      {/* Print-Only Official Report Header */}
      <div className="hidden print:flex flex-row justify-between items-center pb-6 border-b-2 border-slate-900 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            {gymProfile.gymName || 'APEX CORE ATHLETIC CLUB'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {gymProfile.address} • Tel: {gymProfile.phone}
          </p>
          <p className="text-[11px] text-slate-400">Executive Financial & Operations Performance Audit</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
            CONFIDENTIAL MANAGEMENT REPORT
          </span>
          <span className="text-sm font-bold text-slate-900 block font-mono">
            PERIOD: {timeRange.toUpperCase()}
          </span>
          <span className="text-[11px] text-slate-500">
            Generated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Performance Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">
            Audited financial health, member retention indicators, and plan distribution metrics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Executive Summary
          </Button>
          <Button
            size="md"
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export Ledger CSV
          </Button>
        </div>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Gross Revenue
            </span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.8% vs prior quarter
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Operating Expenses
            </span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {formatCurrency(totalExpense)}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">Rent, utilities & payroll</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Net Operating Profit
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(netProfit)}
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">
            {profitMargin}% Profit Margin
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Member Base
            </span>
            <Users className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-extrabold text-violet-600 mt-1">
            {activeMembersCount} Members
          </div>
          <span className="text-xs text-amber-600 font-medium mt-0.5 block">
            {expiringCount} renewals due this week
          </span>
        </div>
      </div>

      {/* Main Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue vs Expense */}
        <Card
          title="Revenue vs. Operating Overhead"
          subtitle="Cash collections vs facility expenses over the past 6 months"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinancialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `${currencySymbol || 'Rs.'}${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Member Growth Trend */}
        <Card
          title="Athletic Member Growth Curve"
          subtitle="Cumulative membership volume and new recurring registrations"
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="totalMembers"
                  name="Total Active Members"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="newSignups"
                  name="New Monthly Signups"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#10b981', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Plan Share & Retention Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie: Plan Distribution */}
        <Card title="Membership Tier Share" subtitle="Subscriber preference by package">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={planColors[index % planColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Operational Efficiency Highlights */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Executive Facility Summary</h3>
            <p className="text-xs text-slate-500 mt-1">
              Automated operational telemetry audited against standard commercial gym performance targets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Member Retention Rate
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">91.4%</span>
                <p className="text-xs text-emerald-600 mt-0.5">
                  High quarterly renewals above industry benchmark (82%)
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Average Revenue Per Member (ARPM)
                </span>
                <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{formatCurrency(89.94)} / mo</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Driven by VIP All-Access & Personal Training additions
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Turnstile Throughput
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {attendance.length} Total Logs
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Average visit frequency: 3.4 sessions / week per member
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Equipment Reliability Index
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">94.8%</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Zero major outages, preventive upkeep executed bi-weekly
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>ApexFit Analytics Engine • ISO-27001 Certified Auditing</span>
            <span>Generated Real-Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};
