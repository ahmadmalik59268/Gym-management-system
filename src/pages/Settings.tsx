import React, { useState, useEffect } from 'react';
import {
  Save,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  ShieldCheck,
  RotateCcw,
  Download,
  CheckCircle2,
  Coins,
  Database,
  ExternalLink,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { useGym, SUPPORTED_CURRENCIES } from '../context/GymContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  SUPABASE_URL,
  SUPABASE_KEY,
  isSupabaseConfigured,
  saveCustomCredentials,
  clearCustomCredentials,
} from '../lib/supabaseClient';

export const Settings: React.FC = () => {
  const { gymSettings, updateGymSettings, setCurrency, formatCurrency, resetToDefaults, addToast } = useGym();

  const [formData, setFormData] = useState({ ...gymSettings });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Supabase keys management state
  const [dbUrl, setDbUrl] = useState(SUPABASE_URL);
  const [dbKey, setDbKey] = useState(SUPABASE_KEY);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setFormData({ ...gymSettings });
  }, [gymSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGymSettings(formData);
    addToast('Facility configuration and currency settings updated successfully', 'success');
  };

  const handleQuickSetCurrency = (code: string, symbol: string) => {
    setFormData((prev) => ({ ...prev, currency: code, currencySymbol: symbol }));
    setCurrency(code, symbol);
  };

  const handleExportBackup = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            settings: gymSettings,
            exportDate: new Date().toISOString(),
          },
          null,
          2
        )
      );

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apexfit-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('System backup JSON downloaded', 'info');
  };

  const confirmReset = () => {
    resetToDefaults();
    setIsResetConfirmOpen(false);
    setFormData({ ...gymSettings });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System & Facility Settings</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure club location details, invoice headers, operating hours, and administrative options.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="md"
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportBackup}
          >
            Export Backup
          </Button>
          <Button
            size="md"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save All Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Facility Identity & Contact */}
        <Card
          title="Facility Identity & Location"
          subtitle="Displayed on official invoices, client receipts, and turnstile portals"
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Gym / Club Brand Name"
                required
                value={formData.gymName}
                onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
              />
              <Input
                label="Business Phone Number"
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Official Contact Email"
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Street Address & Suite"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Operating Hours & Tax Defaults */}
        <Card
          title="Hours, Currency & Fiscal Settings"
          subtitle="Taxation rates and financial parameters applied during invoice calculation"
        >
          <div className="space-y-5 pt-2">
            {/* Quick Currency Selector Pills */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  Quick Currency Preset (1-Click Switch)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Current: <strong className="text-indigo-600 font-bold">{formData.currency} ({formData.currencySymbol || 'Rs.'})</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSetCurrency('PKR', 'Rs.')}
                  className={`px-3 py-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                    formData.currency === 'PKR'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">PKR (Rs.)</span>
                    {formData.currency === 'PKR' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5">Pakistani Rupee</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSetCurrency('USD', '$')}
                  className={`px-3 py-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                    formData.currency === 'USD'
                      ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 font-bold'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">USD ($)</span>
                    {formData.currency === 'USD' && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5">US Dollar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSetCurrency('AED', 'AED')}
                  className={`px-3 py-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                    formData.currency === 'AED'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-bold'
                      : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">AED</span>
                    {formData.currency === 'AED' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5">UAE Dirham</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSetCurrency('EUR', '€')}
                  className={`px-3 py-2 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                    formData.currency === 'EUR'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 hover:border-blue-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">EUR (€)</span>
                    {formData.currency === 'EUR' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5">Euro</span>
                </button>
              </div>

              {/* Price Preview */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Live Price Format Preview:</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {formatCurrency(5000)} / month
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Operating Hours"
                  placeholder="e.g. 5:00 AM - 11:00 PM Daily"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                />
              </div>
              <div>
                <Select
                  label="Base Currency"
                  value={formData.currency}
                  onChange={(e) => {
                    const code = e.target.value;
                    const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code);
                    const sym = matched ? matched.symbol : '$';
                    handleQuickSetCurrency(code, sym);
                  }}
                  options={SUPPORTED_CURRENCIES.map((c) => ({
                    value: c.code,
                    label: c.label,
                  }))}
                />
              </div>
              <div>
                <Input
                  label="Currency Symbol"
                  placeholder="e.g. Rs. or PKR"
                  value={formData.currencySymbol || ''}
                  onChange={(e) => {
                    const sym = e.target.value;
                    setFormData({ ...formData, currencySymbol: sym });
                    setCurrency(formData.currency, sym);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Sales Tax / VAT Rate (%)"
                type="number"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
              />
              <Input
                label="Currency Display Name"
                disabled
                value={SUPPORTED_CURRENCIES.find((c) => c.code === formData.currency)?.name || formData.currency}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Receipt Legal Disclaimer & Footer
              </label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* Supabase Cloud Database Connection */}
        <Card
          title="Supabase Cloud Database & Auth Connection"
          subtitle="Real-time synchronization, Row Level Security (RLS), and unified cloud accounts"
        >
          <div className="space-y-4 pt-1">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Connection Status:</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isSupabaseConfigured ? 'Connected to Supabase' : 'Credentials Not Configured'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isSupabaseConfigured
                      ? `Active URL: ${SUPABASE_URL}`
                      : 'Running in standalone local fallback mode. Enter credentials below to connect to your live project.'}
                  </p>
                </div>
              </div>

              {isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear custom Supabase keys from this browser and reload?')) {
                      clearCustomCredentials();
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline self-start sm:self-center"
                >
                  Disconnect / Clear Keys
                </button>
              )}
            </div>

            {/* Inputs for Supabase Keys */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon / Publishable Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={dbKey}
                    onChange={(e) => setDbKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-14 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-2 text-[10px] font-semibold text-slate-400 hover:text-slate-600 px-1"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-slate-500">
                💡 Keys can also be saved in <code className="text-indigo-600 font-semibold">.env</code> as <code className="font-semibold">VITE_SUPABASE_URL</code> & <code className="font-semibold">VITE_SUPABASE_PUBLISHABLE_KEY</code>.
              </p>

              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Key className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (!dbUrl.trim() || !dbKey.trim()) {
                    alert('Please enter both Supabase URL and Anon Key.');
                    return;
                  }
                  saveCustomCredentials(dbUrl.trim(), dbKey.trim());
                }}
              >
                Save & Connect Supabase
              </Button>
            </div>
          </div>
        </Card>

        {/* System Diagnostics & Demo Data Reset */}
        <Card
          title="Data Engine & System Reset"
          subtitle="Reset state back to initial pristine seed records or purge custom browser entries"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Reset Demo Data</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Restores the complete dataset (Members, Plans, Invoices, Attendance, Trainers) back to
                default demo figures.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Reset to Demo Seed
            </Button>
          </div>
        </Card>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" variant="primary" size="lg" icon={<Save className="w-4 h-4" />}>
            Save All System Changes
          </Button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={confirmReset}
        title="Reset All Gym Data to Demo Baseline?"
        message="This will reset all members, payments, workouts, and attendance records back to the original demo data. Are you sure?"
      />
    </div>
  );
};
