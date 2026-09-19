import React from 'react';
import { Printer, Download, Dumbbell, CalendarCheck, Users, Clock, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Attendance, PersonType } from '../../types';
import { useGym } from '../../context/GymContext';

interface PrintAttendanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateFilter: string;
  typeFilter: string;
  records: Attendance[];
}

export const PrintAttendanceReportModal: React.FC<PrintAttendanceReportModalProps> = ({
  isOpen,
  onClose,
  dateFilter,
  typeFilter,
  records,
}) => {
  const { gymProfile, getMember, getTrainer, staff, showToast } = useGym();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Person Type,Person Name,ID,Check In,Check Out,Status,Notes']
        .concat(
          records.map((r) => {
            const pName =
              r.personType === 'Trainer'
                ? getTrainer(r.personId)?.fullName
                : r.personType === 'Staff'
                ? staff.find((s) => s.id === r.personId)?.name
                : getMember(r.personId || r.memberId || '')?.fullName || 'Athlete';
            return `"${r.date}","${r.personType || 'Member'}","${pName || ''}","${r.personId || r.memberId || ''}","${r.checkInTime || ''}","${r.checkOutTime || ''}","${r.status}","${r.notes || ''}"`;
          })
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance-report-${dateFilter || 'all-dates'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Attendance report exported as CSV', 'success');
  };

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const leaveCount = records.filter((r) => r.status === 'Leave').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Facility Attendance Audit Report"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Generating printable audit ledger for {records.length} logs
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print Report
            </Button>
          </div>
        </div>

        {/* PRINTABLE REPORT */}
        <div
          id="printable-attendance-report"
          className="printable-sheet bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6 text-slate-800"
        >
          {/* Gym Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold shadow-sm">
                <Dumbbell className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                  {gymProfile.gymName || 'APEX CORE ATHLETIC CLUB'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {gymProfile.address || 'Facility Turnstile Operations'} • Tel: {gymProfile.phone || '+1 555-0199'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Official Facility Attendance & Turnstile Verification Report
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block">
                AUDITED ATTENDANCE LOGS
              </span>
              <span className="text-sm font-extrabold text-slate-900 block">
                Filter: {dateFilter ? `Date: ${dateFilter}` : 'All Recorded Dates'}
              </span>
              <span className="text-[11px] text-slate-500">
                Segment: {typeFilter.toUpperCase()} • Generated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="text-center p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Logs</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">{records.length}</span>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Present</span>
              <span className="text-lg font-black text-emerald-600 mt-0.5 block">{presentCount}</span>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-orange-200">
              <span className="text-[10px] font-bold text-orange-700 uppercase block">Late</span>
              <span className="text-lg font-black text-orange-600 mt-0.5 block">{lateCount}</span>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Leave</span>
              <span className="text-lg font-black text-amber-600 mt-0.5 block">{leaveCount}</span>
            </div>
            <div className="text-center p-2 bg-white rounded-lg border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase block">Absent</span>
              <span className="text-lg font-black text-rose-600 mt-0.5 block">{absentCount}</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {records.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No attendance logs found matching this filter criteria.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Person Name & ID</th>
                    <th className="py-2.5 px-3">Role / Type</th>
                    <th className="py-2.5 px-3">Check-In</th>
                    <th className="py-2.5 px-3">Check-Out</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {records.map((r) => {
                    const personType = r.personType || 'Member';
                    const pName =
                      personType === 'Trainer'
                        ? getTrainer(r.personId)?.fullName
                        : personType === 'Staff'
                        ? staff.find((s) => s.id === r.personId)?.name
                        : getMember(r.personId || r.memberId || '')?.fullName || 'Athlete';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{r.date}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{pName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{r.personId || r.memberId}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {personType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-indigo-600">{r.checkInTime || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.checkOutTime || (r.status === 'Present' ? 'In Session' : '-')}</td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={
                              r.status === 'Present'
                                ? 'success'
                                : r.status === 'Late'
                                ? 'warning'
                                : r.status === 'Leave'
                                ? 'info'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">{r.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Supervisor Sign-Off */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs avoid-break">
            <div>
              <div className="border-b border-slate-400 w-44 mb-1.5 h-8"></div>
              <span className="text-[11px] font-bold text-slate-700 block">Duty Supervisor Signature</span>
              <span className="text-[10px] text-slate-400">Verified Turnstile Logs</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="border-b border-slate-400 w-44 mb-1.5 h-8"></div>
              <span className="text-[11px] font-bold text-slate-700 block">General Manager Stamp</span>
              <span className="text-[10px] text-slate-400">{gymProfile.gymName} Operations</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Audit Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};
