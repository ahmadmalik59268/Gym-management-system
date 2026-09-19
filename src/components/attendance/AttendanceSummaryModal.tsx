import React, { useState } from 'react';
import { X, Calendar, User, CheckCircle2, XCircle, Clock, AlertTriangle, Briefcase, ChevronRight } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { PersonType } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface AttendanceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  personType: PersonType;
  personName: string;
  onOpenMarkModal?: () => void;
}

export const AttendanceSummaryModal: React.FC<AttendanceSummaryModalProps> = ({
  isOpen,
  onClose,
  personId,
  personType,
  personName,
  onOpenMarkModal,
}) => {
  const { getAttendanceForPerson, getAttendanceSummary } = useGym();
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  if (!isOpen) return null;

  const summary = getAttendanceSummary(personId, selectedMonth, 26);
  const logs = getAttendanceForPerson(personId, selectedMonth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{personName}</h3>
                <Badge variant="indigo" size="sm">
                  {personType}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">ID: {personId} • Official Attendance Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenMarkModal && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  onClose();
                  onOpenMarkModal();
                }}
              >
                + Mark Today
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between my-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Cycle / Month:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2025-03">March 2025</option>
          </select>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Present Days</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.presentDays}</div>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">Full sessions on floor</span>
          </div>

          <div className="bg-rose-50/60 border border-rose-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Absent Days</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-extrabold text-rose-700 mt-1">{summary.absentDays}</div>
            <span className="text-[11px] text-rose-600 mt-0.5 block">Unexcused missed shifts</span>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Leave Days</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{summary.leaveDays}</div>
            <span className="text-[11px] text-amber-600 mt-0.5 block">Approved leaves</span>
          </div>

          <div className="bg-orange-50/60 border border-orange-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Late Days</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-extrabold text-orange-700 mt-1">{summary.lateDays}</div>
            <span className="text-[11px] text-orange-600 mt-0.5 block">Checked in late</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Working Days</span>
              <Briefcase className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{summary.totalWorkingDays}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Standard monthly cycle</span>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-200/80 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Attendance %</span>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1">{summary.attendancePercentage}%</div>
            <span className="text-[11px] text-indigo-600 mt-0.5 block">Overall compliance rate</span>
          </div>
        </div>

        {/* Detailed Logs for Month */}
        <div className="mt-5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Detailed Log Entries ({logs.length})
          </h4>
          {logs.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              No attendance records found for {selectedMonth}.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-3.5 py-2.5">Date</th>
                    <th className="px-3.5 py-2.5">Check-In</th>
                    <th className="px-3.5 py-2.5">Check-Out</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">{log.date}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{log.checkInTime || '-'}</td>
                      <td className="px-3.5 py-2.5 text-slate-600">{log.checkOutTime || '-'}</td>
                      <td className="px-3.5 py-2.5">
                        <Badge
                          variant={
                            log.status === 'Present'
                              ? 'success'
                              : log.status === 'Late'
                              ? 'warning'
                              : log.status === 'Leave'
                              ? 'info'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-500 italic max-w-xs truncate">
                        {log.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
