import React, { useState } from 'react';
import { Plus, Check, Edit2, Trash2, Layers, Clock, ShieldCheck } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { MembershipPlan } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PlanModal } from '../components/memberships/PlanModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';

export const MembershipPlans: React.FC = () => {
  const { plans, deletePlan, memberships, formatCurrency } = useGym();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletePlanId(id);
  };

  const confirmDelete = () => {
    if (deletePlanId) {
      deletePlan(deletePlanId);
      setDeletePlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Membership Plans</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure subscription tiers, recurring billing cycles, and package privileges.
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingPlan(null);
            setIsPlanModalOpen(true);
          }}
        >
          Create New Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <EmptyState
          title="No Membership Plans"
          description="Create your first membership plan to start enrolling gym athletes."
          actionLabel="Create Plan"
          onAction={() => {
            setEditingPlan(null);
            setIsPlanModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(plans || []).map((plan) => {
            const activeCount = (memberships || []).filter(
              (m) => m.planId === plan.id && m.status === 'Active'
            ).length;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative"
              >
                {/* Status chip */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                      {plan.duration === 1
                        ? 'Monthly Tier'
                        : plan.duration === 3
                        ? 'Quarterly Tier'
                        : plan.duration === 6
                        ? 'Half-Yearly Tier'
                        : 'Annual Pass'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  </div>
                  <Badge variant={plan.status === 'Active' ? 'success' : 'neutral'} size="sm">
                    {plan.status}
                  </Badge>
                </div>

                {/* Price & Description */}
                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(plan.price)}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        / {plan.duration} {plan.duration === 1 ? 'Month' : 'Months'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {plan.description || 'All-inclusive gym floor and equipment access package.'}
                    </p>
                  </div>

                  {/* Active Subscriptions Metric */}
                  <div className="py-2 px-3 bg-slate-50 rounded-lg text-xs flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Active Enrollees:
                    </span>
                    <strong className="text-slate-900">{activeCount}</strong>
                  </div>

                  {/* Features checklist */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Plan Inclusions:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {(plan.features || [
                        'Cardio & Strength Machines',
                        'Locker Room Access',
                        'Free High-Speed Wi-Fi',
                      ]).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-rose-600 hover:bg-rose-50"
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    onClick={() => handleDelete(plan.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Modal */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setEditingPlan(null);
        }}
        planToEdit={editingPlan}
      />

      {/* Delete Plan Confirm */}
      <ConfirmDialog
        isOpen={!!deletePlanId}
        onClose={() => setDeletePlanId(null)}
        onConfirm={confirmDelete}
        title="Delete Membership Plan"
        message="Are you sure you want to delete this membership plan? Current subscribers will remain active, but new assignments to this plan will be halted."
      />
    </div>
  );
};
