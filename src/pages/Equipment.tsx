import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Dumbbell,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Equipment } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EquipmentModal } from '../components/equipment/EquipmentModal';

export const EquipmentPage: React.FC = () => {
  const { equipment, deleteEquipment, updateEquipment } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteEquipmentId, setDeleteEquipmentId] = useState<string | null>(null);

  // Status stats
  const totalUnits = (equipment || []).reduce((acc, eq) => acc + eq.quantity, 0);
  const workingUnits = (equipment || [])
    .filter((eq) => eq.status === 'Working')
    .reduce((acc, eq) => acc + eq.quantity, 0);
  const maintenanceUnits = (equipment || [])
    .filter((eq) => eq.status === 'Under Maintenance' || eq.status === 'Broken')
    .reduce((acc, eq) => acc + eq.quantity, 0);

  const filteredEquipment = useMemo(() => {
    return (equipment || []).filter((eq) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        eq.name.toLowerCase().includes(q) ||
        (eq.notes && eq.notes.toLowerCase().includes(q));

      const matchesCategory = categoryFilter === 'All' || eq.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || eq.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [equipment, searchQuery, categoryFilter, statusFilter]);

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteEquipmentId(id);
  };

  const confirmDelete = () => {
    if (deleteEquipmentId) {
      deleteEquipment(deleteEquipmentId);
      setDeleteEquipmentId(null);
    }
  };

  const toggleStatusQuick = (eq: Equipment) => {
    const nextStatus: Equipment['status'] =
      eq.status === 'Working'
        ? 'Under Maintenance'
        : eq.status === 'Under Maintenance'
        ? 'Broken'
        : 'Working';
    updateEquipment(eq.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gym Equipment & Assets</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track asset health, preventive maintenance cycles, and floor inventory numbers.
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingEquipment(null);
            setIsModalOpen(true);
          }}
        >
          Add Equipment
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Machines & Gear
            </span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalUnits} Units</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Across all 4 fitness zones</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Operational Floor Ready
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{workingUnits} Units</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Active and safe for athletes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Maintenance / Issues
            </span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {maintenanceUnits} Units
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">Under service or pending repair</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search machine name or serial..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Condition:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Conditions</option>
              <option value="Working">Working</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Broken">Broken</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment List Table */}
      {filteredEquipment.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="No gym assets match your search settings."
          actionLabel="Add Equipment"
          onAction={() => {
            setEditingEquipment(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Asset Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5">Procured On</th>
                  <th className="px-4 py-3.5">Last Service</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block">{eq.name}</span>
                      {eq.notes && <span className="text-[11px] text-slate-400">{eq.notes}</span>}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{eq.category}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{eq.quantity} units</td>
                    <td className="px-4 py-3.5 text-slate-600">{eq.purchaseDate}</td>
                    <td className="px-4 py-3.5 text-slate-600">{eq.maintenanceDate || '—'}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleStatusQuick(eq)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to toggle status"
                      >
                        <Badge
                          variant={
                            eq.status === 'Working'
                              ? 'success'
                              : eq.status === 'Under Maintenance'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {eq.status}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(eq)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit Equipment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Equipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Cards View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredEquipment.map((eq) => (
              <div key={eq.id} className="p-4 space-y-3.5 hover:bg-slate-50/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">{eq.name}</h4>
                    {eq.notes && <p className="text-[11px] text-slate-400 mt-0.5">{eq.notes}</p>}
                  </div>
                  <button
                    onClick={() => toggleStatusQuick(eq)}
                    className="cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                    title="Click to toggle status"
                  >
                    <Badge
                      variant={
                        eq.status === 'Working'
                          ? 'success'
                          : eq.status === 'Under Maintenance'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {eq.status}
                    </Badge>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                    <span className="font-semibold text-slate-800">{eq.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                    <span className="font-bold text-slate-900">{eq.quantity} Units</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Procured Date</span>
                    <span className="text-slate-600 font-medium">{eq.purchaseDate}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Service</span>
                    <span className="text-slate-600 font-medium">{eq.maintenanceDate || '—'}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1 px-3"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => handleEdit(eq)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1 px-3 text-rose-600 hover:bg-rose-50 border-rose-200"
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    onClick={() => handleDelete(eq.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEquipment(null);
        }}
        equipmentToEdit={editingEquipment}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteEquipmentId}
        onClose={() => setDeleteEquipmentId(null)}
        onConfirm={confirmDelete}
        title="Remove Equipment Asset"
        message="Are you sure you want to remove this equipment item from the facility inventory registry?"
      />
    </div>
  );
};
