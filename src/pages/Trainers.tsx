import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Dumbbell,
  Phone,
  Mail,
  Award,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  UserCheck,
  Calendar,
  ExternalLink,
  Filter,
  ArrowUpDown,
  TrendingUp,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Trainer } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TrainerModal } from '../components/trainers/TrainerModal';
import { AssignMembersToTrainerModal } from '../components/trainers/AssignMembersToTrainerModal';

export const Trainers: React.FC = () => {
  const navigate = useNavigate();
  const { trainers, deleteTrainer, trainerAssignments, formatCurrency } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'clients' | 'salary' | 'recent'>('name');

  // Modals
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deleteTrainerId, setDeleteTrainerId] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTrainerForAssign, setSelectedTrainerForAssign] = useState<Trainer | null>(null);

  // Extract unique specializations for filter dropdown
  const uniqueSpecializations = useMemo(() => {
    const specs = new Set<string>();
    (trainers || []).forEach((t) => {
      if (t.specialization) specs.add(t.specialization);
    });
    return Array.from(specs);
  }, [trainers]);

  // Overall statistics
  const totalTrainers = (trainers || []).length;
  const activeTrainers = (trainers || []).filter((t) => t.status === 'Active').length;

  const totalAssignedAthletes = useMemo(() => {
    const activeAssignments = (trainerAssignments || []).filter(
      (a) => a.status === 'Active' || !a.status
    );
    const memberSet = new Set<string>();
    activeAssignments.forEach((a) => memberSet.add(a.memberId));
    return memberSet.size;
  }, [trainerAssignments]);

  const avgClientsPerTrainer = totalTrainers > 0
    ? (totalAssignedAthletes / totalTrainers).toFixed(1)
    : '0.0';

  // Filter & Sort
  const filteredTrainers = useMemo(() => {
    return (trainers || [])
      .filter((t) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.specialization.toLowerCase().includes(q) ||
          t.phone.includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q);

        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        const matchesSpec =
          specializationFilter === 'All' || t.specialization === specializationFilter;

        return matchesSearch && matchesStatus && matchesSpec;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'salary') {
          return (b.salary || 0) - (a.salary || 0);
        }
        if (sortBy === 'recent') {
          return new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime();
        }
        if (sortBy === 'clients') {
          const aClients = (trainerAssignments || []).filter((asgn) => asgn.trainerId === a.id).length;
          const bClients = (trainerAssignments || []).filter((asgn) => asgn.trainerId === b.id).length;
          return bClients - aClients;
        }
        return 0;
      });
  }, [trainers, searchQuery, statusFilter, specializationFilter, sortBy, trainerAssignments]);

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setIsTrainerModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTrainerId(id);
  };

  const confirmDelete = () => {
    if (deleteTrainerId) {
      deleteTrainer(deleteTrainerId);
      setDeleteTrainerId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Coaching Staff & Trainers</h1>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              {totalTrainers} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage fitness coach credentials, client rosters, athlete assignments, and monthly payroll.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/trainers/assignments">
            <Button size="md" variant="outline" icon={<Users className="w-4 h-4" />}>
              Active Assignments
            </Button>
          </Link>
          <Button
            size="md"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingTrainer(null);
              setIsTrainerModalOpen(true);
            }}
          >
            + Add Trainer
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Coaches
            </span>
            <span className="text-2xl font-black text-slate-900 leading-tight">
              {totalTrainers}
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Coaches
            </span>
            <span className="text-2xl font-black text-emerald-600 leading-tight">
              {activeTrainers}
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Assigned Athletes
            </span>
            <span className="text-2xl font-black text-amber-600 leading-tight">
              {totalAssignedAthletes}
            </span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Avg Clients / Coach
            </span>
            <span className="text-2xl font-black text-teal-600 leading-tight">
              {avgClientsPerTrainer}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coach by name, specialty, phone, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Specialization Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Specialty:</span>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="All">All Specialties</option>
              {uniqueSpecializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="clients">Sort: Most Clients</option>
              <option value="salary">Sort: Highest Salary</option>
              <option value="recent">Sort: Recently Joined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trainers Grid */}
      {filteredTrainers.length === 0 ? (
        <EmptyState
          title="No coaches found"
          description="No fitness coaches match your current filter and search parameters."
          actionLabel="Add New Trainer"
          onAction={() => {
            setEditingTrainer(null);
            setIsTrainerModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => {
            const assignedMembersList = (trainerAssignments || []).filter(
              (a) => a.trainerId === trainer.id && (a.status === 'Active' || !a.status)
            );

            return (
              <div
                key={trainer.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div className="p-5 space-y-4">
                  {/* Card Header: Clickable to Trainer Profile */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => navigate(`/trainers/${trainer.id}`)}
                      className="flex items-center gap-3.5 cursor-pointer flex-1"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 shrink-0">
                          <img
                            src={trainer.photo}
                            alt={trainer.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-base text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate">
                            {trainer.name}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 block mt-0.5 truncate">
                          {trainer.specialization}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {trainer.id} • {trainer.experience || 3} yrs exp
                        </span>
                      </div>
                    </div>

                    <Badge variant={trainer.status === 'Active' ? 'success' : 'neutral'} size="sm">
                      {trainer.status}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <a
                      href={`tel:${trainer.phone}`}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trainer.phone}</span>
                    </a>
                    <a
                      href={`mailto:${trainer.email}`}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{trainer.email}</span>
                    </a>
                  </div>

                  {/* Assigned Athletes & Compensation Metric */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Assigned Athletes
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {assignedMembersList.length}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Compensation
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 block mt-0.5 truncate" title={trainer.salaryType || 'Salary'}>
                        {trainer.salaryType === 'Percentage / Commission'
                          ? `${trainer.commissionPercentage ?? 50}% Comm.`
                          : trainer.salaryType === 'Fixed + Percentage'
                          ? `${formatCurrency(trainer.salary)} + ${trainer.commissionPercentage ?? 50}%`
                          : trainer.salaryType === 'Hourly / Daily'
                          ? (trainer.hourlyRate ? `${formatCurrency(trainer.hourlyRate)}/hr` : (trainer.dailyRate ? `${formatCurrency(trainer.dailyRate)}/day` : 'Hourly/Daily'))
                          : (trainer.salaryType === 'Attendance-Based Salary' || (trainer.salaryType as string) === 'Attendance Based')
                          ? `${formatCurrency(trainer.salary)} (Attn)`
                          : formatCurrency(trainer.salary)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs flex-1"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/trainers/${trainer.id}`)}
                  >
                    View Profile
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-indigo-600"
                    title="Assign Athlete to Coach"
                    icon={<UserPlus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setSelectedTrainerForAssign(trainer);
                      setIsAssignModalOpen(true);
                    }}
                  >
                    Assign
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs p-2 text-slate-600 hover:text-indigo-600"
                    title="Edit Coach Profile"
                    onClick={() => handleEdit(trainer)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs p-2 text-slate-400 hover:text-rose-600"
                    title="Remove Coach"
                    onClick={() => handleDelete(trainer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Trainer Modal */}
      <TrainerModal
        isOpen={isTrainerModalOpen}
        onClose={() => {
          setIsTrainerModalOpen(false);
          setEditingTrainer(null);
        }}
        trainerToEdit={editingTrainer}
      />

      {/* Assign Members to Trainer Modal */}
      {selectedTrainerForAssign && (
        <AssignMembersToTrainerModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedTrainerForAssign(null);
          }}
          trainer={selectedTrainerForAssign}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTrainerId}
        onClose={() => setDeleteTrainerId(null)}
        onConfirm={confirmDelete}
        title="Remove Fitness Coach"
        message="Are you sure you want to remove this coach from the gym roster? All assigned athlete records will be unlinked."
      />
    </div>
  );
};
