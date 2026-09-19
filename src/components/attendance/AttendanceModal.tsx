import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { PersonType, AttendanceStatus } from '../../types';
import { Button } from '../common/Button';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPersonType?: PersonType;
  defaultPersonId?: string;
  defaultDate?: string;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  defaultPersonType = 'Member',
  defaultPersonId = '',
  defaultDate = '',
}) => {
  const { members, trainers, staff, markAttendance, attendance } = useGym();

  const [personType, setPersonType] = useState<PersonType>(defaultPersonType);
  const [personId, setPersonId] = useState<string>(defaultPersonId);
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [checkInTime, setCheckInTime] = useState<string>('08:00 AM');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPersonType(defaultPersonType);
      setPersonId(defaultPersonId || '');
      const d = defaultDate || new Date().toISOString().split('T')[0];
      setDate(d);
      setStatus('Present');
      setCheckInTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setCheckOutTime('');
      setNotes('');
      setError('');
    }
  }, [isOpen, defaultPersonType, defaultPersonId, defaultDate]);

  if (!isOpen) return null;

  // Person list based on selected personType
  const personList =
    personType === 'Member'
      ? members.map((m) => ({ id: m.id, name: m.fullName, sub: `ID: ${m.id} • ${m.status}` }))
      : personType === 'Trainer'
      ? trainers.map((t) => ({ id: t.id, name: t.name, sub: `ID: ${t.id} • ${t.specialization}` }))
      : staff.map((s) => ({ id: s.id, name: s.name, sub: `ID: ${s.id} • ${s.role}` }));

  // Check if attendance already exists for this person & date
  const existingRecord = personId
    ? attendance.find(
        (a) =>
          (a.personId === personId || a.memberId === personId) &&
          a.date === date
      )
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) {
      setError('Please select an individual to mark attendance for.');
      return;
    }
    if (!date) {
      setError('Please specify a date.');
      return;
    }

    markAttendance({
      personId,
      personType,
      date,
      status,
      checkInTime: status === 'Absent' || status === 'Leave' ? '' : checkInTime,
      checkOutTime: checkOutTime || null,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Mark Attendance Record</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Log facility check-in, leave, or shift status for any person.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {existingRecord && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">Existing Record Found for {date}:</span>
                <p className="text-[11px] mt-0.5">
                  Currently marked as <strong>{existingRecord.status}</strong> (In: {existingRecord.checkInTime || 'N/A'}, Out: {existingRecord.checkOutTime || 'Active'}). Submitting will update this record.
                </p>
              </div>
            </div>
          )}

          {/* Person Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Category / Entity Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Member', 'Trainer', 'Staff'] as PersonType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => {
                    setPersonType(type);
                    setPersonId('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    personType === type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {type === 'Member' ? 'Athlete' : type === 'Trainer' ? 'Coach' : 'Staff'}
                </button>
              ))}
            </div>
          </div>

          {/* Select Specific Person */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Select {personType === 'Member' ? 'Member' : personType === 'Trainer' ? 'Coach / Trainer' : 'Staff Member'} *
            </label>
            <select
              value={personId}
              onChange={(e) => {
                setPersonId(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              required
            >
              <option value="">-- Choose {personType} --</option>
              {personList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sub})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="Present">Present (Checked In)</option>
                <option value="Late">Late Arrival</option>
                <option value="Half Day">Half Day Shift</option>
                <option value="Leave">Excused / Approved Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Timing (If Present / Late / Half Day) */}
          {status !== 'Absent' && status !== 'Leave' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Check-In Time
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Check-Out Time (Optional)
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    placeholder="e.g. 05:00 PM (Leave blank if active)"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Reason (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Scheduled personal training session, duty cover, or leave reason..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {existingRecord ? 'Update Record' : 'Save Attendance'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
