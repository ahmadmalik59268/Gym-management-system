import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  AlertCircle,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Check,
  X,
  Share2,
  ChevronRight,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { FormSubmission, FormSubmissionStatus, FormSubmissionType } from '../types';

export const FormsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    formSubmissions,
    updateFormSubmission,
    deleteFormSubmission,
    convertFormSubmissionToMember,
    addFormSubmission,
    refreshData,
    isLoadingData,
  } = useGym();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal / Detail state
  const [activeSubmission, setActiveSubmission] = useState<FormSubmission | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Manual Lead Modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    phone: '',
    formType: 'Membership Inquiry' as FormSubmissionType,
    subject: '',
    message: '',
    notes: '',
  });

  // Calculate high-level stats
  const stats = useMemo(() => {
    const total = formSubmissions.length;
    const newCount = formSubmissions.filter((s) => s.status === 'New').length;
    const contacted = formSubmissions.filter((s) => s.status === 'Contacted').length;
    const converted = formSubmissions.filter((s) => s.status === 'Converted').length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return { total, newCount, contacted, converted, conversionRate };
  }, [formSubmissions]);

  // Filtered and sorted list
  const filteredSubmissions = useMemo(() => {
    return formSubmissions
      .filter((sub) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          sub.name.toLowerCase().includes(query) ||
          sub.email.toLowerCase().includes(query) ||
          sub.phone.toLowerCase().includes(query) ||
          sub.subject.toLowerCase().includes(query) ||
          sub.message.toLowerCase().includes(query);

        const matchesStatus =
          selectedStatus === 'all' || sub.status.toLowerCase() === selectedStatus.toLowerCase();
        const matchesType =
          selectedType === 'all' || sub.formType.toLowerCase() === selectedType.toLowerCase();

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [formSubmissions, searchTerm, selectedStatus, selectedType, sortOrder]);

  const handleOpenDetail = (sub: FormSubmission) => {
    setActiveSubmission(sub);
    setEditNotes(sub.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!activeSubmission) return;
    setIsSavingNotes(true);
    await updateFormSubmission(activeSubmission.id, { notes: editNotes });
    setIsSavingNotes(false);
    setActiveSubmission((prev) => (prev ? { ...prev, notes: editNotes } : null));
  };

  const handleStatusChange = async (subId: string, newStatus: FormSubmissionStatus) => {
    await updateFormSubmission(subId, { status: newStatus });
    if (activeSubmission && activeSubmission.id === subId) {
      setActiveSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleConvert = (sub: FormSubmission) => {
    const member = convertFormSubmissionToMember(sub);
    setActiveSubmission(null);
    navigate(`/members/${member.id}`);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name.trim() || !manualForm.email.trim()) return;

    await addFormSubmission({
      name: manualForm.name.trim(),
      email: manualForm.email.trim(),
      phone: manualForm.phone.trim(),
      formType: manualForm.formType,
      subject: manualForm.subject.trim() || `${manualForm.formType} Walk-in`,
      message: manualForm.message.trim(),
      status: 'New',
      notes: manualForm.notes.trim() || 'Manually entered by staff member.',
    });

    setIsManualModalOpen(false);
    setManualForm({
      name: '',
      email: '',
      phone: '',
      formType: 'Membership Inquiry',
      subject: '',
      message: '',
      notes: '',
    });
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) return;
    const headers = ['ID', 'Date', 'Full Name', 'Email', 'Phone', 'Type', 'Subject', 'Status', 'Message', 'Notes'];
    const rows = filteredSubmissions.map((s) => [
      `"${s.id}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.phone.replace(/"/g, '""')}"`,
      `"${s.formType}"`,
      `"${s.subject.replace(/"/g, '""')}"`,
      `"${s.status}"`,
      `"${s.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(s.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexfit_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: FormSubmissionStatus) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            New Lead
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3" />
            Contacted
          </span>
        );
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Converted
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: FormSubmissionType) => {
    const colors: Record<string, string> = {
      'Contact Us': 'bg-slate-100 text-slate-700 border-slate-200',
      'Demo Request': 'bg-purple-50 text-purple-700 border-purple-200',
      'Membership Inquiry': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Free Trial': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'General': 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${colors[type] || colors['General']}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forms & Inquiries</h1>
            {stats.newCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white animate-pulse">
                {stats.newCount} New
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Incoming contact messages, membership inquiries, and demo requests captured live from your public website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => window.open('/landing', '_blank')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Open Landing Page in new tab to test form submission"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span>Visit Landing Page</span>
          </button>

          <button
            onClick={() => refreshData()}
            disabled={isLoadingData}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh submissions from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Walk-in Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <span className="text-[11px] text-slate-400 font-medium">All submissions recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New / Unread</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{stats.newCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Requires initial response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.contacted}</div>
          <span className="text-[11px] text-slate-400 font-medium">Contacted & under follow-up</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Converted Members</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-600">{stats.converted}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.conversionRate}% Conv.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Added to registered roster</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, subject..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Inquiry Types</option>
            <option value="Contact Us">Contact Us</option>
            <option value="Demo Request">Demo Request</option>
            <option value="Membership Inquiry">Membership Inquiry</option>
            <option value="Free Trial">Free Trial</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Toggle Date Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>
        </div>
      </div>

      {/* Submissions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Form Submissions Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'Try clearing your search query or adjusting your filters.'
                : 'Submissions made on the public landing page will immediately show up here in real time.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => window.open('/landing#contact', '_blank')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Test Landing Page Form
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Lead / Sender</th>
                  <th className="py-3.5 px-4">Inquiry Type</th>
                  <th className="py-3.5 px-4">Subject & Message</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubmissions.map((sub) => {
                  const initials = sub.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(sub)}
                    >
                      {/* Sender Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                            {initials || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                              <span>{sub.name}</span>
                              {sub.status === 'New' && (
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{sub.email}</span>
                              {sub.phone && (
                                <>
                                  <span>•</span>
                                  <span>{sub.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getTypeBadge(sub.formType)}
                      </td>

                      {/* Subject & Preview */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-slate-800 truncate">
                          {sub.subject || 'Website Inquiry'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {sub.message || 'No additional message.'}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-700">
                          {new Date(sub.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(sub.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td
                        className="py-4 px-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={sub.status}
                          onChange={(e) =>
                            handleStatusChange(sub.id, e.target.value as FormSubmissionStatus)
                          }
                          className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:outline-hidden"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Convert Button */}
                          {sub.status !== 'Converted' ? (
                            <button
                              onClick={() => handleConvert(sub)}
                              title="Convert to Member (1-Click)"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Convert</span>
                            </button>
                          ) : (
                            <span className="px-2 py-1 rounded text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                              Member Added
                            </span>
                          )}

                          {/* Quick Phone / WhatsApp */}
                          {sub.phone && (
                            <a
                              href={`https://wa.me/${sub.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Message on WhatsApp"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Email */}
                          <a
                            href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(
                              sub.subject || 'Your Gym Inquiry'
                            )}`}
                            title="Send Email"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          {/* View Modal */}
                          <button
                            onClick={() => handleOpenDetail(sub)}
                            title="View Full Details"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete inquiry from ${sub.name}?`)) {
                                deleteFormSubmission(sub.id);
                              }
                            }}
                            title="Delete"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {activeSubmission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Inquiry Details</h3>
                  <span className="text-[11px] text-slate-500">Ref ID: {activeSubmission.id}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveSubmission(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Status:</span>
                  {getStatusBadge(activeSubmission.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Type:</span>
                  {getTypeBadge(activeSubmission.formType)}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(activeSubmission.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {activeSubmission.name}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${activeSubmission.email}`}
                    className="text-sm font-bold text-indigo-600 hover:underline mt-0.5 block truncate"
                  >
                    {activeSubmission.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {activeSubmission.phone || 'Not provided'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Subject
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                    {activeSubmission.subject || 'Website Inquiry'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Submitted Message
                </label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {activeSubmission.message || 'No message body provided.'}
                </div>
              </div>

              {/* Staff Notes / Follow-up history */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Staff Follow-up Notes
                  </label>
                  <span className="text-[11px] text-slate-400">Internal only</span>
                </div>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record call logs, scheduled visit times, or membership preferences..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 text-slate-800 resize-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>

              {/* Change Status Controls */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Update Lead Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['New', 'Contacted', 'Converted', 'Closed'] as FormSubmissionStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(activeSubmission.id, st)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          activeSubmission.status === st
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (window.confirm(`Delete this inquiry from ${activeSubmission.name}?`)) {
                    deleteFormSubmission(activeSubmission.id);
                    setActiveSubmission(null);
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Submission</span>
              </button>

              <div className="flex items-center gap-2">
                {activeSubmission.phone && (
                  <a
                    href={`https://wa.me/${activeSubmission.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  onClick={() => handleConvert(activeSubmission)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Convert to Member</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL WALK-IN LEAD MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Log Walk-in / Phone Lead</h3>
                  <p className="text-xs text-slate-400">Record an inquiry received outside the website</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="e.g. Omar Farooq"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="omar@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inquiry Type
                  </label>
                  <select
                    value={manualForm.formType}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        formType: e.target.value as FormSubmissionType,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500 bg-white"
                  >
                    <option value="Membership Inquiry">Membership Inquiry</option>
                    <option value="Demo Request">Demo Request</option>
                    <option value="Free Trial">Free Trial</option>
                    <option value="Contact Us">Contact Us</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={manualForm.subject}
                  onChange={(e) => setManualForm({ ...manualForm, subject: e.target.value })}
                  placeholder="e.g. Inquired about monthly standard package"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Details / Message
                </label>
                <textarea
                  rows={3}
                  value={manualForm.message}
                  onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })}
                  placeholder="Visitor came to reception asking about timings..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Save Lead to Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
