import React from 'react';
import { ShieldCheck, UserCheck, Eye, Lock, Sparkles, User } from 'lucide-react';
import { usePayroll, SimRole } from '../../context/PayrollContext';
import { useGym } from '../../context/GymContext';

export const RoleSwitcherBar: React.FC = () => {
  const { activeRole, setActiveRole, simulatedTrainerId, setSimulatedTrainerId } = usePayroll();
  const { trainers } = useGym();

  const roles: { role: SimRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'Admin',
      label: 'Admin',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      desc: 'Full payroll control & settings',
    },
    {
      role: 'Manager',
      label: 'Manager',
      icon: <Eye className="w-3.5 h-3.5" />,
      desc: 'View reports & commissions',
    },
    {
      role: 'Trainer',
      label: 'Trainer',
      icon: <UserCheck className="w-3.5 h-3.5" />,
      desc: 'View personal commission & payslip',
    },
    {
      role: 'Receptionist',
      label: 'Receptionist',
      icon: <Lock className="w-3.5 h-3.5" />,
      desc: 'Restricted from financial data',
    },
    {
      role: 'Member',
      label: 'Member',
      icon: <User className="w-3.5 h-3.5" />,
      desc: 'No payroll access',
    },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-3 sm:p-4 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Role Permission Simulator
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full">
              Live Preview
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Switch simulated role to verify access control & transparent earnings visibility
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        {roles.map((r) => (
          <button
            key={r.role}
            type="button"
            onClick={() => setActiveRole(r.role)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeRole === r.role
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
            }`}
            title={r.desc}
          >
            {r.icon}
            <span>{r.label}</span>
          </button>
        ))}

        {activeRole === 'Trainer' && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium">As Coach:</span>
            <select
              value={simulatedTrainerId}
              onChange={(e) => setSimulatedTrainerId(e.target.value)}
              className="bg-slate-800 border border-indigo-500/50 text-indigo-300 text-xs font-bold rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-indigo-500 outline-hidden"
            >
              {(trainers || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.specialization.slice(0, 20)}...)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
