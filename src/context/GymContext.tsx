import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Member,
  MembershipPlan,
  Membership,
  Payment,
  Attendance,
  PersonType,
  AttendanceStatus,
  AttendanceSummaryStats,
  Trainer,
  TrainerAssignment,
  WorkoutPlan,
  DietPlan,
  Expense,
  Equipment,
  Notification,
  StaffUser,
  GymProfileSettings,
  GeneralSettings,
  ReceiptSettings,
  GymSettings,
} from '../types';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import {
  apiFetchMembers,
  apiInsertMember,
  apiUpdateMember,
  apiDeleteMember,
  apiFetchPlans,
  apiInsertPlan,
  apiUpdatePlan,
  apiDeletePlan,
  apiFetchMemberships,
  apiInsertMembership,
  apiUpdateMembership,
  apiDeleteMembership,
  apiFetchPayments,
  apiInsertPayment,
  apiFetchAttendance,
  apiUpsertAttendance,
  apiUpdateAttendance,
  apiDeleteAttendance,
  apiFetchTrainers,
  apiInsertTrainer,
  apiUpdateTrainer,
  apiDeleteTrainer,
  apiFetchAssignments,
  apiAssignMember,
  apiRemoveAssignment,
  apiFetchWorkoutPlans,
  apiSaveWorkoutPlan,
  apiDeleteWorkoutPlan,
  apiFetchDietPlans,
  apiSaveDietPlan,
  apiDeleteDietPlan,
  apiFetchExpenses,
  apiInsertExpense,
  apiUpdateExpense,
  apiDeleteExpense,
  apiFetchEquipment,
  apiInsertEquipment,
  apiUpdateEquipment,
  apiDeleteEquipment,
  apiAddEquipmentMaintenance,
  apiFetchStaff,
  apiInsertStaff,
  apiUpdateStaff,
  apiDeleteStaff,
  apiFetchNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiFetchGymProfile,
  apiUpdateGymProfile,
  apiFetchGymSettings,
  apiUpdateGeneralSettings,
  apiUpdateReceiptSettings,
} from '../lib/supabaseService';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee', label: 'PKR (Rs.) - Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound', label: 'GBP (£) - British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', label: 'AED (AED) - UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', label: 'SAR (SAR) - Saudi Riyal' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', label: 'INR (₹) - Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', label: 'CAD (CA$) - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', label: 'AUD (A$) - Australian Dollar' },
];

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const defaultGymProfile: GymProfileSettings = {
  gymName: 'ApexFit Commercial Club',
  logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
  phone: '+92 300 1234567',
  email: 'support@apexfit.com',
  address: 'Commercial Block 4, Sector B, City Gym Arena',
  website: 'https://apexfit.com',
};

const defaultGeneralSettings: GeneralSettings = {
  currency: 'PKR',
  currencySymbol: 'Rs.',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
};

const defaultReceiptSettings: ReceiptSettings = {
  headerText: 'APEXFIT COMMERCIAL GYM & FITNESS',
  footerNotes: 'Thank you for choosing ApexFit. Keep pushing your boundaries! Please retain this receipt for your records.',
  taxNumber: 'NTN: 8934291-7',
  termsAndConditions: '1. All payments are non-refundable.\n2. Membership cards/IDs must be presented on entry.\n3. Proper workout attire is mandatory inside facilities.',
};

interface GymContextType {
  members: Member[];
  plans: MembershipPlan[];
  memberships: Membership[];
  payments: Payment[];
  attendance: Attendance[];
  trainers: Trainer[];
  assignments: TrainerAssignment[];
  trainerAssignments: TrainerAssignment[];
  workoutPlans: WorkoutPlan[];
  dietPlans: DietPlan[];
  expenses: Expense[];
  equipment: Equipment[];
  notifications: Notification[];
  staff: StaffUser[];
  gymProfile: GymProfileSettings;
  generalSettings: GeneralSettings;
  receiptSettings: ReceiptSettings;
  toasts: ToastNotification[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Member CRUD
  addMember: (member: Omit<Member, 'id'>) => Member;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  // Plan CRUD
  addPlan: (plan: Omit<MembershipPlan, 'id'>) => MembershipPlan;
  updatePlan: (id: string, plan: Partial<MembershipPlan>) => void;
  deletePlan: (id: string) => void;
  togglePlanStatus: (id: string) => void;

  // Membership CRUD
  addMembership: (membership: Omit<Membership, 'id'>, paymentMethod?: 'Cash' | 'Card' | 'Bank Transfer' | 'Online') => Membership;
  updateMembership: (id: string, membership: Partial<Membership>) => void;
  deleteMembership: (id: string) => void;

  // Payment CRUD
  addPayment: (payment: Omit<Payment, 'receiptNumber'>) => Payment;

  // Attendance
  markCheckIn: (personId: string, personType?: PersonType, date?: string, time?: string, notes?: string) => Attendance | null;
  markCheckOut: (attendanceIdOrPersonId: string, checkOutTime?: string) => void;
  markAttendance: (data: {
    personId: string;
    personType: PersonType;
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string | null;
    notes?: string;
  }) => Attendance;
  updateAttendance: (id: string, updates: Partial<Attendance>) => void;
  deleteAttendance: (id: string) => void;
  getAttendanceForPerson: (personId: string, month?: string) => Attendance[];
  getAttendanceSummary: (personId: string, month?: string, totalWorkingDays?: number) => AttendanceSummaryStats;

  // Trainer CRUD
  addTrainer: (trainer: Omit<Trainer, 'id'>) => Trainer;
  updateTrainer: (id: string, trainer: Partial<Trainer>) => void;
  deleteTrainer: (id: string) => void;

  // Trainer Assignment
  assignMemberToTrainer: (trainerId: string, memberId: string) => void;
  assignTrainer: (assignment: { trainerId: string; memberId: string; startDate?: string; status?: string }) => void;
  removeMemberFromTrainer: (trainerId: string, memberId: string) => void;

  // Workout & Diet
  saveWorkoutPlan: (plan: Omit<WorkoutPlan, 'id'>, id?: string) => void;
  addWorkoutPlan: (plan: Omit<WorkoutPlan, 'id'>) => void;
  updateWorkoutPlan: (id: string, plan: Partial<WorkoutPlan>) => void;
  deleteWorkoutPlan: (id: string) => void;
  saveDietPlan: (plan: Omit<DietPlan, 'id'>, id?: string) => void;
  addDietPlan: (plan: Omit<DietPlan, 'id'>) => void;
  updateDietPlan: (id: string, plan: Partial<DietPlan>) => void;
  deleteDietPlan: (id: string) => void;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Equipment
  addEquipment: (eq: Omit<Equipment, 'id'>) => Equipment;
  updateEquipment: (id: string, eq: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addEquipmentMaintenance: (eqId: string, log: { date: string; cost: number; description: string }) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Staff
  addStaff: (staffUser: Omit<StaffUser, 'id'>) => StaffUser;
  updateStaff: (id: string, staffUser: Partial<StaffUser>) => void;
  deleteStaff: (id: string) => void;

  // Settings
  currency: string;
  currencySymbol: string;
  formatCurrency: (amount: number | string | undefined | null) => string;
  setCurrency: (code: string, symbol?: string) => void;
  gymSettings: GymSettings;
  updateGymSettings: (settings: Partial<GymSettings>) => void;
  resetToDefaults: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  updateGymProfile: (profile: Partial<GymProfileSettings>) => void;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;

  // Helper selectors
  getMember: (id: string) => Member | undefined;
  getTrainer: (id: string) => Trainer | undefined;
  getPlan: (id: string) => MembershipPlan | undefined;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [assignments, setAssignments] = useState<TrainerAssignment[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [gymProfile, setGymProfile] = useState<GymProfileSettings>(defaultGymProfile);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultGeneralSettings);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(defaultReceiptSettings);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all tables directly from Supabase
  const loadSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    try {
      const [
        mList,
        pList,
        msList,
        payList,
        attList,
        trnList,
        asnList,
        wpList,
        dpList,
        expList,
        eqList,
        stfList,
        notifList,
        profData,
        settData,
      ] = await Promise.allSettled([
        apiFetchMembers(),
        apiFetchPlans(),
        apiFetchMemberships(),
        apiFetchPayments(),
        apiFetchAttendance(),
        apiFetchTrainers(),
        apiFetchAssignments(),
        apiFetchWorkoutPlans(),
        apiFetchDietPlans(),
        apiFetchExpenses(),
        apiFetchEquipment(),
        apiFetchStaff(),
        apiFetchNotifications(),
        apiFetchGymProfile(),
        apiFetchGymSettings(),
      ]);

      if (mList.status === 'fulfilled') setMembers(mList.value);
      if (pList.status === 'fulfilled') setPlans(pList.value);
      if (msList.status === 'fulfilled') setMemberships(msList.value);
      if (payList.status === 'fulfilled') setPayments(payList.value);
      if (attList.status === 'fulfilled') setAttendance(attList.value);
      if (trnList.status === 'fulfilled') setTrainers(trnList.value);
      if (asnList.status === 'fulfilled') setAssignments(asnList.value);
      if (wpList.status === 'fulfilled') setWorkoutPlans(wpList.value);
      if (dpList.status === 'fulfilled') setDietPlans(dpList.value);
      if (expList.status === 'fulfilled') setExpenses(expList.value);
      if (eqList.status === 'fulfilled') setEquipment(eqList.value);
      if (stfList.status === 'fulfilled') setStaff(stfList.value);
      if (notifList.status === 'fulfilled') setNotifications(notifList.value);

      if (profData.status === 'fulfilled' && profData.value) {
        setGymProfile(profData.value);
      }
      if (settData.status === 'fulfilled' && settData.value) {
        setGeneralSettings(settData.value.general);
        setReceiptSettings(settData.value.receipt);
      }
    } catch (err: any) {
      console.error('Error fetching data from Supabase backend:', err);
      showToast('Error syncing with Supabase: ' + (err.message || 'Check database connection'), 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSupabaseData();
  }, [loadSupabaseData]);

  // ==========================================
  // MEMBER CRUD
  // ==========================================
  const addMember = (data: Omit<Member, 'id'>): Member => {
    const nextIdNum = 1000 + members.length + 1;
    const newMember: Member = {
      ...data,
      id: `MEM-${nextIdNum}`,
      profilePhoto:
        data.profilePhoto?.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      notes: data.notes?.trim() || 'Active member',
    };

    // Optimistic update
    setMembers((prev) => [newMember, ...prev]);

    if (isSupabaseConfigured) {
      apiInsertMember(newMember)
        .then(() => {
          showToast(`Member ${newMember.fullName} saved to Supabase!`, 'success');
        })
        .catch((err: any) => {
          setMembers((prev) => prev.filter((m) => m.id !== newMember.id));
          showToast(`Supabase Error adding member: ${err.message || err.details || 'Insert failed'}`, 'error');
        });
    } else {
      showToast(`Member ${newMember.fullName} added locally.`, 'info');
    }

    return newMember;
  };

  const updateMember = (id: string, data: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));

    if (isSupabaseConfigured) {
      apiUpdateMember(id, data)
        .then(() => showToast('Member updated in Supabase.', 'success'))
        .catch((err: any) => {
          showToast(`Supabase update error: ${err.message}`, 'error');
          loadSupabaseData();
        });
    }
  };

  const deleteMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setMemberships((prev) => prev.filter((ms) => ms.memberId !== id));
    setAssignments((prev) => prev.filter((a) => a.memberId !== id));
    setAttendance((prev) => prev.filter((att) => att.memberId !== id && att.personId !== id));

    if (isSupabaseConfigured) {
      apiDeleteMember(id)
        .then(() => showToast(`Member ${member?.fullName || id} deleted from Supabase.`, 'info'))
        .catch((err: any) => {
          showToast(`Supabase delete error: ${err.message}`, 'error');
          loadSupabaseData();
        });
    }
  };

  // ==========================================
  // PLAN CRUD
  // ==========================================
  const addPlan = (data: Omit<MembershipPlan, 'id'>): MembershipPlan => {
    const newPlan: MembershipPlan = {
      ...data,
      id: `PLAN-${Date.now().toString().slice(-5)}`,
    };
    setPlans((prev) => [...prev, newPlan]);

    if (isSupabaseConfigured) {
      apiInsertPlan(newPlan)
        .then(() => showToast(`Plan ${newPlan.name} created in Supabase!`, 'success'))
        .catch((err: any) => {
          setPlans((prev) => prev.filter((p) => p.id !== newPlan.id));
          showToast(`Supabase error creating plan: ${err.message}`, 'error');
        });
    }
    return newPlan;
  };

  const updatePlan = (id: string, data: Partial<MembershipPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    if (isSupabaseConfigured) {
      apiUpdatePlan(id, data)
        .then(() => showToast('Plan updated in Supabase.', 'success'))
        .catch((err: any) => showToast(`Error updating plan: ${err.message}`, 'error'));
    }
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured) {
      apiDeletePlan(id)
        .then(() => showToast('Plan removed from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error removing plan: ${err.message}`, 'error'));
    }
  };

  const togglePlanStatus = (id: string) => {
    const target = plans.find((p) => p.id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    updatePlan(id, { status: newStatus });
  };

  // ==========================================
  // MEMBERSHIP CRUD
  // ==========================================
  const addMembership = (
    data: Omit<Membership, 'id'>,
    paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Online' = 'Cash'
  ): Membership => {
    const newMembership: Membership = {
      ...data,
      id: `MS-${Date.now().toString().slice(-6)}`,
    };
    setMemberships((prev) => [newMembership, ...prev]);

    // If initial payment was made
    if (newMembership.paid > 0) {
      const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payment: Payment = {
        receiptNumber,
        memberId: newMembership.memberId,
        membershipId: newMembership.id,
        amount: newMembership.paid,
        paymentMethod: paymentMethod || 'Cash',
        date: newMembership.startDate,
        status: 'Paid',
      };
      setPayments((prev) => [payment, ...prev]);

      if (isSupabaseConfigured) {
        apiInsertPayment(payment).catch((err: any) => console.error('Error inserting initial payment:', err));
      }
    }

    // Set member active
    setMembers((prev) =>
      prev.map((m) => (m.id === data.memberId ? { ...m, status: 'Active' } : m))
    );

    if (isSupabaseConfigured) {
      apiInsertMembership(newMembership)
        .then(() => showToast('Membership registered in Supabase.', 'success'))
        .catch((err: any) => {
          showToast(`Supabase Error registering membership: ${err.message}`, 'error');
        });
    }

    return newMembership;
  };

  const updateMembership = (id: string, data: Partial<Membership>) => {
    setMemberships((prev) => prev.map((ms) => (ms.id === id ? { ...ms, ...data } : ms)));

    if (isSupabaseConfigured) {
      apiUpdateMembership(id, data)
        .then(() => showToast('Membership updated in Supabase.', 'success'))
        .catch((err: any) => showToast(`Error updating membership: ${err.message}`, 'error'));
    }
  };

  const deleteMembership = (id: string) => {
    setMemberships((prev) => prev.filter((ms) => ms.id !== id));

    if (isSupabaseConfigured) {
      apiDeleteMembership(id)
        .then(() => showToast('Membership deleted from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error deleting membership: ${err.message}`, 'error'));
    }
  };

  // ==========================================
  // PAYMENT
  // ==========================================
  const addPayment = (data: Omit<Payment, 'receiptNumber'>): Payment => {
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: Payment = {
      ...data,
      receiptNumber,
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Update membership if linked
    if (data.membershipId) {
      setMemberships((prev) =>
        prev.map((ms) => {
          if (ms.id === data.membershipId) {
            const newPaid = ms.paid + data.amount;
            const newRemaining = Math.max(0, ms.totalAmount - newPaid);
            const updatedMs = { ...ms, paid: newPaid, remaining: newRemaining };
            if (isSupabaseConfigured) {
              apiUpdateMembership(ms.id, { paid: newPaid }).catch(console.error);
            }
            return updatedMs;
          }
          return ms;
        })
      );
    }

    if (isSupabaseConfigured) {
      apiInsertPayment(newPayment)
        .then(() => showToast(`Payment receipt ${newPayment.receiptNumber} saved in Supabase!`, 'success'))
        .catch((err: any) => showToast(`Error recording payment: ${err.message}`, 'error'));
    }

    return newPayment;
  };

  // ==========================================
  // ATTENDANCE
  // ==========================================
  const markCheckIn = (
    personId: string,
    personType?: PersonType,
    date?: string,
    time?: string,
    notes?: string
  ): Attendance | null => {
    const now = new Date();
    const today = date || now.toISOString().split('T')[0];
    const timeStr = time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let resolvedType: PersonType = personType || 'Member';
    let resolvedName = 'User';

    const member = members.find((m) => m.id === personId);
    if (member) {
      resolvedType = 'Member';
      resolvedName = member.fullName;
    } else {
      const trainer = trainers.find((t) => t.id === personId);
      if (trainer) {
        resolvedType = 'Trainer';
        resolvedName = trainer.name;
      } else {
        const staffMember = staff.find((s) => s.id === personId);
        if (staffMember) {
          resolvedType = 'Staff';
          resolvedName = staffMember.name;
        }
      }
    }

    const newAttendance: Attendance = {
      id: `ATT-${Date.now()}`,
      personType: resolvedType,
      personId,
      memberId: resolvedType === 'Member' ? personId : undefined,
      personName: resolvedName,
      checkInTime: timeStr,
      checkOutTime: null,
      date: today,
      status: 'Present',
      notes: notes || '',
    };

    setAttendance((prev) => [newAttendance, ...prev]);

    if (isSupabaseConfigured) {
      apiUpsertAttendance({
        personType: resolvedType,
        personId,
        date: today,
        status: 'Present',
        checkInTime: timeStr,
        notes: notes || '',
      })
        .then((saved) => {
          setAttendance((prev) => prev.map((a) => (a.id === newAttendance.id ? saved : a)));
          showToast(`${resolvedName} checked in (Supabase synced)`, 'success');
        })
        .catch((err: any) => {
          showToast(`Supabase Check-in error: ${err.message}`, 'error');
        });
    }

    return newAttendance;
  };

  const markCheckOut = (attendanceIdOrPersonId: string, checkOutTime?: string) => {
    const now = new Date();
    const timeStr = checkOutTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];

    const record = attendance.find(
      (a) =>
        a.id === attendanceIdOrPersonId ||
        ((a.personId === attendanceIdOrPersonId || a.memberId === attendanceIdOrPersonId) &&
          a.date === today &&
          !a.checkOutTime)
    );

    if (!record) {
      showToast('No active check-in record found for check-out.', 'warning');
      return;
    }

    setAttendance((prev) =>
      prev.map((a) => (a.id === record.id ? { ...a, checkOutTime: timeStr } : a))
    );

    if (isSupabaseConfigured) {
      apiUpdateAttendance(record.id, { checkOutTime: timeStr })
        .then(() => showToast(`Check-out recorded at ${timeStr}.`, 'success'))
        .catch((err: any) => showToast(`Supabase check-out error: ${err.message}`, 'error'));
    }
  };

  const markAttendance = (data: {
    personId: string;
    personType: PersonType;
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string | null;
    notes?: string;
  }): Attendance => {
    const newRecord: Attendance = {
      id: `ATT-${Date.now()}`,
      personType: data.personType,
      personId: data.personId,
      memberId: data.personType === 'Member' ? data.personId : undefined,
      date: data.date,
      status: data.status,
      checkInTime: data.checkInTime || '09:00:00',
      checkOutTime: data.checkOutTime || null,
      notes: data.notes || '',
    };

    setAttendance((prev) => {
      const idx = prev.findIndex(
        (a) => (a.personId === data.personId || a.memberId === data.personId) && a.date === data.date
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...newRecord, id: next[idx].id };
        return next;
      }
      return [newRecord, ...prev];
    });

    if (isSupabaseConfigured) {
      apiUpsertAttendance(data)
        .then(() => showToast('Attendance recorded in Supabase.', 'success'))
        .catch((err: any) => showToast(`Supabase attendance error: ${err.message}`, 'error'));
    }

    return newRecord;
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));

    if (isSupabaseConfigured) {
      apiUpdateAttendance(id, updates)
        .then(() => showToast('Attendance updated in Supabase.', 'success'))
        .catch((err: any) => showToast(`Supabase attendance error: ${err.message}`, 'error'));
    }
  };

  const deleteAttendance = (id: string) => {
    setAttendance((prev) => prev.filter((a) => a.id !== id));

    if (isSupabaseConfigured) {
      apiDeleteAttendance(id)
        .then(() => showToast('Attendance deleted from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error deleting attendance: ${err.message}`, 'error'));
    }
  };

  const getAttendanceForPerson = (personId: string, month?: string): Attendance[] => {
    return attendance
      .filter((a) => {
        const matches = a.personId === personId || a.memberId === personId;
        if (!matches) return false;
        if (month) return a.date.startsWith(month);
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAttendanceSummary = (
    personId: string,
    month?: string,
    totalWorkingDays: number = 26
  ): AttendanceSummaryStats => {
    const records = getAttendanceForPerson(personId, month);
    const presentDays = records.filter((r) => r.status === 'Present').length;
    const lateDays = records.filter((r) => r.status === 'Late').length;
    const halfDays = records.filter((r) => r.status === 'Half Day').length;
    const leaveDays = records.filter((r) => r.status === 'Leave').length;
    const absentDays = records.filter((r) => r.status === 'Absent').length;

    const effectivePresent = presentDays + lateDays + halfDays * 0.5;
    const percentage =
      totalWorkingDays > 0
        ? Math.min(100, Math.round((effectivePresent / totalWorkingDays) * 100))
        : 0;

    return {
      presentDays,
      absentDays,
      leaveDays,
      lateDays,
      halfDays,
      totalWorkingDays,
      attendancePercentage: percentage,
    };
  };

  // ==========================================
  // TRAINER CRUD
  // ==========================================
  const addTrainer = (data: Omit<Trainer, 'id'>): Trainer => {
    const newTrainer: Trainer = {
      ...data,
      id: `TRN-${Date.now().toString().slice(-4)}`,
    };
    setTrainers((prev) => [...prev, newTrainer]);

    if (isSupabaseConfigured) {
      apiInsertTrainer(newTrainer)
        .then(() => showToast(`Trainer ${newTrainer.name} saved to Supabase.`, 'success'))
        .catch((err: any) => showToast(`Error saving trainer: ${err.message}`, 'error'));
    }
    return newTrainer;
  };

  const updateTrainer = (id: string, data: Partial<Trainer>) => {
    setTrainers((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));

    if (isSupabaseConfigured) {
      apiUpdateTrainer(id, data)
        .then(() => showToast('Trainer updated in Supabase.', 'success'))
        .catch((err: any) => showToast(`Error updating trainer: ${err.message}`, 'error'));
    }
  };

  const deleteTrainer = (id: string) => {
    setTrainers((prev) => prev.filter((t) => t.id !== id));
    setAssignments((prev) => prev.filter((a) => a.trainerId !== id));

    if (isSupabaseConfigured) {
      apiDeleteTrainer(id)
        .then(() => showToast('Trainer deleted from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error deleting trainer: ${err.message}`, 'error'));
    }
  };

  // Trainer Assignments
  const assignMemberToTrainer = (trainerId: string, memberId: string) => {
    const newAssignment: TrainerAssignment = {
      id: `TA-${Date.now()}`,
      trainerId,
      memberId,
      assignedDate: new Date().toISOString().split('T')[0],
    };
    setAssignments((prev) => [...prev.filter((a) => !(a.trainerId === trainerId && a.memberId === memberId)), newAssignment]);

    if (isSupabaseConfigured) {
      apiAssignMember(trainerId, memberId, newAssignment.assignedDate)
        .then(() => showToast('Trainer assignment saved to Supabase.', 'success'))
        .catch((err: any) => showToast(`Error assigning trainer: ${err.message}`, 'error'));
    }
  };

  const assignTrainer = (assignment: { trainerId: string; memberId: string; startDate?: string; status?: string }) => {
    assignMemberToTrainer(assignment.trainerId, assignment.memberId);
  };

  const removeMemberFromTrainer = (trainerId: string, memberId: string) => {
    setAssignments((prev) =>
      prev.filter((a) => !(a.trainerId === trainerId && a.memberId === memberId))
    );

    if (isSupabaseConfigured) {
      apiRemoveAssignment(trainerId, memberId)
        .then(() => showToast('Assignment removed from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error removing assignment: ${err.message}`, 'error'));
    }
  };

  // ==========================================
  // WORKOUT & DIET PLANS
  // ==========================================
  const saveWorkoutPlan = (plan: Omit<WorkoutPlan, 'id'>, id?: string) => {
    const targetId = id || `WP-${Date.now().toString().slice(-5)}`;
    const fullPlan = { ...plan, id: targetId };

    setWorkoutPlans((prev) => {
      const exists = prev.some((p) => p.id === targetId);
      if (exists) return prev.map((p) => (p.id === targetId ? fullPlan : p));
      return [fullPlan, ...prev];
    });

    if (isSupabaseConfigured) {
      apiSaveWorkoutPlan(fullPlan)
        .then(() => showToast('Workout plan saved to Supabase.', 'success'))
        .catch((err: any) => showToast(`Error saving workout plan: ${err.message}`, 'error'));
    }
  };

  const addWorkoutPlan = (plan: Omit<WorkoutPlan, 'id'>) => saveWorkoutPlan(plan);

  const updateWorkoutPlan = (id: string, plan: Partial<WorkoutPlan>) => {
    const existing = workoutPlans.find((p) => p.id === id);
    if (!existing) return;
    const merged = { ...existing, ...plan };
    saveWorkoutPlan(merged, id);
  };

  const deleteWorkoutPlan = (id: string) => {
    setWorkoutPlans((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured) {
      apiDeleteWorkoutPlan(id)
        .then(() => showToast('Workout plan deleted from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error deleting workout plan: ${err.message}`, 'error'));
    }
  };

  const saveDietPlan = (plan: Omit<DietPlan, 'id'>, id?: string) => {
    const targetId = id || `DP-${Date.now().toString().slice(-5)}`;
    const fullPlan = { ...plan, id: targetId };

    setDietPlans((prev) => {
      const exists = prev.some((p) => p.id === targetId);
      if (exists) return prev.map((p) => (p.id === targetId ? fullPlan : p));
      return [fullPlan, ...prev];
    });

    if (isSupabaseConfigured) {
      apiSaveDietPlan(fullPlan)
        .then(() => showToast('Diet plan saved to Supabase.', 'success'))
        .catch((err: any) => showToast(`Error saving diet plan: ${err.message}`, 'error'));
    }
  };

  const addDietPlan = (plan: Omit<DietPlan, 'id'>) => saveDietPlan(plan);

  const updateDietPlan = (id: string, plan: Partial<DietPlan>) => {
    const existing = dietPlans.find((p) => p.id === id);
    if (!existing) return;
    saveDietPlan({ ...existing, ...plan }, id);
  };

  const deleteDietPlan = (id: string) => {
    setDietPlans((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured) {
      apiDeleteDietPlan(id)
        .then(() => showToast('Diet plan deleted from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error deleting diet plan: ${err.message}`, 'error'));
    }
  };

  // ==========================================
  // EXPENSES
  // ==========================================
  const addExpense = (data: Omit<Expense, 'id'>): Expense => {
    const newExpense: Expense = {
      ...data,
      id: `EXP-${Date.now().toString().slice(-5)}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    if (isSupabaseConfigured) {
      apiInsertExpense(newExpense)
        .then(() => showToast(`Expense of ${newExpense.amount} logged in Supabase.`, 'success'))
        .catch((err: any) => showToast(`Error saving expense: ${err.message}`, 'error'));
    }
    return newExpense;
  };

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));

    if (isSupabaseConfigured) {
      apiUpdateExpense(id, data)
        .then(() => showToast('Expense updated in Supabase.', 'success'))
        .catch((err: any) => showToast(`Error updating expense: ${err.message}`, 'error'));
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (isSupabaseConfigured) {
      apiDeleteExpense(id)
        .then(() => showToast('Expense removed from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error removing expense: ${err.message}`, 'error'));
    }
  };

  // ==========================================
  // EQUIPMENT
  // ==========================================
  const addEquipment = (data: Omit<Equipment, 'id'>): Equipment => {
    const newEq: Equipment = {
      ...data,
      id: `EQ-${Date.now().toString().slice(-4)}`,
    };
    setEquipment((prev) => [newEq, ...prev]);

    if (isSupabaseConfigured) {
      apiInsertEquipment(newEq)
        .then(() => showToast(`Equipment ${newEq.name} saved to Supabase.`, 'success'))
        .catch((err: any) => showToast(`Error adding equipment: ${err.message}`, 'error'));
    }
    return newEq;
  };

  const updateEquipment = (id: string, data: Partial<Equipment>) => {
    setEquipment((prev) => prev.map((eq) => (eq.id === id ? { ...eq, ...data } : eq)));

    if (isSupabaseConfigured) {
      apiUpdateEquipment(id, data)
        .then(() => showToast('Equipment updated in Supabase.', 'success'))
        .catch((err: any) => showToast(`Error updating equipment: ${err.message}`, 'error'));
    }
  };

  const deleteEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== id));

    if (isSupabaseConfigured) {
      apiDeleteEquipment(id)
        .then(() => showToast('Equipment removed from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error deleting equipment: ${err.message}`, 'error'));
    }
  };

  const addEquipmentMaintenance = (
    eqId: string,
    log: { date: string; cost: number; description: string }
  ) => {
    setEquipment((prev) =>
      prev.map((eq) => {
        if (eq.id === eqId) {
          return {
            ...eq,
            lastMaintenance: log.date,
            maintenanceHistory: [log, ...(eq.maintenanceHistory || [])],
          };
        }
        return eq;
      })
    );

    if (isSupabaseConfigured) {
      apiAddEquipmentMaintenance(eqId, log)
        .then(() => showToast('Maintenance record saved in Supabase.', 'success'))
        .catch((err: any) => showToast(`Error saving maintenance: ${err.message}`, 'error'));
    }
  };

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    if (isSupabaseConfigured) {
      apiMarkNotificationRead(id).catch(console.error);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    if (isSupabaseConfigured) {
      apiMarkAllNotificationsRead()
        .then(() => showToast('All notifications marked read in Supabase.', 'success'))
        .catch(console.error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications cleared.', 'info');
  };

  // ==========================================
  // STAFF
  // ==========================================
  const addStaff = (data: Omit<StaffUser, 'id'>): StaffUser => {
    const newStaff: StaffUser = {
      ...data,
      id: `STF-${Date.now().toString().slice(-4)}`,
      lastActive: 'Just now',
    };
    setStaff((prev) => [...prev, newStaff]);

    if (isSupabaseConfigured) {
      apiInsertStaff(newStaff)
        .then(() => showToast(`Staff member ${newStaff.name} saved to Supabase.`, 'success'))
        .catch((err: any) => showToast(`Error adding staff: ${err.message}`, 'error'));
    }
    return newStaff;
  };

  const updateStaff = (id: string, data: Partial<StaffUser>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));

    if (isSupabaseConfigured) {
      apiUpdateStaff(id, data)
        .then(() => showToast('Staff updated in Supabase.', 'success'))
        .catch((err: any) => showToast(`Error updating staff: ${err.message}`, 'error'));
    }
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));

    if (isSupabaseConfigured) {
      apiDeleteStaff(id)
        .then(() => showToast('Staff removed from Supabase.', 'info'))
        .catch((err: any) => showToast(`Error deleting staff: ${err.message}`, 'error'));
    }
  };

  // ==========================================
  // SETTINGS & HELPERS
  // ==========================================
  const currency = generalSettings?.currency || 'PKR';
  const currencySymbol = generalSettings?.currencySymbol || (currency === 'PKR' ? 'Rs.' : '$');

  const formatCurrency = (amount: number | string | undefined | null): string => {
    const num = typeof amount === 'number' ? amount : Number(amount) || 0;
    const sym = generalSettings?.currencySymbol || (generalSettings?.currency === 'PKR' ? 'Rs.' : '$');
    return `${sym} ${num.toLocaleString()}`;
  };

  const setCurrency = (code: string, customSymbol?: string) => {
    const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    const sym = customSymbol || matched?.symbol || (code === 'PKR' ? 'Rs.' : code);
    const updated = {
      ...generalSettings,
      currency: code,
      currencySymbol: sym,
    };
    setGeneralSettings(updated);

    if (isSupabaseConfigured) {
      apiUpdateGeneralSettings(updated).catch(console.error);
    }
    showToast(`Currency set to ${code} (${sym})`, 'success');
  };

  const gymSettings: GymSettings = {
    gymName: gymProfile.gymName,
    phone: gymProfile.phone,
    email: gymProfile.email,
    address: gymProfile.address,
    openingHours: '5:00 AM - 11:00 PM Daily',
    currency: generalSettings.currency,
    currencySymbol: generalSettings.currencySymbol,
    taxRate: 5,
    receiptFooter: receiptSettings.footerNotes,
  };

  const updateGymSettings = (newSettings: Partial<GymSettings>) => {
    if (newSettings.gymName || newSettings.phone || newSettings.email || newSettings.address) {
      const updatedProfile = {
        ...gymProfile,
        gymName: newSettings.gymName ?? gymProfile.gymName,
        phone: newSettings.phone ?? gymProfile.phone,
        email: newSettings.email ?? gymProfile.email,
        address: newSettings.address ?? gymProfile.address,
      };
      setGymProfile(updatedProfile);
      if (isSupabaseConfigured) apiUpdateGymProfile(updatedProfile).catch(console.error);
    }
    if (newSettings.currency || newSettings.currencySymbol) {
      const code = newSettings.currency || generalSettings.currency;
      const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code);
      const sym = newSettings.currencySymbol || matched?.symbol || (code === 'PKR' ? 'Rs.' : '$');
      const updatedGen = {
        ...generalSettings,
        currency: code,
        currencySymbol: sym,
      };
      setGeneralSettings(updatedGen);
      if (isSupabaseConfigured) apiUpdateGeneralSettings(updatedGen).catch(console.error);
    }
    if (newSettings.receiptFooter) {
      const updatedRcp = {
        ...receiptSettings,
        footerNotes: newSettings.receiptFooter,
      };
      setReceiptSettings(updatedRcp);
      if (isSupabaseConfigured) apiUpdateReceiptSettings(updatedRcp).catch(console.error);
    }
  };

  const updateGymProfile = (profile: Partial<GymProfileSettings>) => {
    const updated = { ...gymProfile, ...profile };
    setGymProfile(updated);
    if (isSupabaseConfigured) {
      apiUpdateGymProfile(updated)
        .then(() => showToast('Gym profile saved to Supabase.', 'success'))
        .catch((err: any) => showToast(`Error saving profile: ${err.message}`, 'error'));
    }
  };

  const updateGeneralSettings = (settings: Partial<GeneralSettings>) => {
    const updated = { ...generalSettings, ...settings };
    setGeneralSettings(updated);
    if (isSupabaseConfigured) {
      apiUpdateGeneralSettings(updated)
        .then(() => showToast('General settings saved to Supabase.', 'success'))
        .catch((err: any) => showToast(`Error saving settings: ${err.message}`, 'error'));
    }
  };

  const updateReceiptSettings = (settings: Partial<ReceiptSettings>) => {
    const updated = { ...receiptSettings, ...settings };
    setReceiptSettings(updated);
    if (isSupabaseConfigured) {
      apiUpdateReceiptSettings(updated)
        .then(() => showToast('Receipt settings saved to Supabase.', 'success'))
        .catch((err: any) => showToast(`Error saving receipt settings: ${err.message}`, 'error'));
    }
  };

  const resetToDefaults = () => {
    loadSupabaseData();
    showToast('Data refreshed from Supabase.', 'info');
  };

  const addToast = (message: string, type?: 'success' | 'error' | 'info' | 'warning') => {
    showToast(message, type);
  };

  const getMember = (id: string) => members.find((m) => m.id === id);
  const getTrainer = (id: string) => trainers.find((t) => t.id === id);
  const getPlan = (id: string) => {
    if (!id) return undefined;
    if (id === 'custom') {
      return {
        id: 'custom',
        name: 'Custom Plan',
        duration: 1,
        price: 0,
        description: 'Custom Membership Package',
        status: 'Active' as const,
        features: ['Custom Package Benefits'],
      };
    }
    return (plans || []).find((p) => p.id === id);
  };

  return (
    <GymContext.Provider
      value={{
        members,
        plans,
        memberships,
        payments,
        attendance,
        trainers,
        assignments,
        trainerAssignments: assignments,
        workoutPlans,
        dietPlans,
        expenses,
        equipment,
        notifications,
        staff,
        gymProfile,
        generalSettings,
        receiptSettings,
        toasts,
        isLoadingData,
        refreshData: loadSupabaseData,
        showToast,
        removeToast,
        addMember,
        updateMember,
        deleteMember,
        addPlan,
        updatePlan,
        deletePlan,
        togglePlanStatus,
        addMembership,
        updateMembership,
        deleteMembership,
        addPayment,
        markCheckIn,
        markCheckOut,
        markAttendance,
        updateAttendance,
        deleteAttendance,
        getAttendanceForPerson,
        getAttendanceSummary,
        addTrainer,
        updateTrainer,
        deleteTrainer,
        assignMemberToTrainer,
        assignTrainer,
        removeMemberFromTrainer,
        saveWorkoutPlan,
        addWorkoutPlan,
        updateWorkoutPlan,
        deleteWorkoutPlan,
        saveDietPlan,
        addDietPlan,
        updateDietPlan,
        deleteDietPlan,
        addExpense,
        updateExpense,
        deleteExpense,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        addEquipmentMaintenance,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        addStaff,
        updateStaff,
        deleteStaff,
        currency,
        currencySymbol,
        formatCurrency,
        setCurrency,
        gymSettings,
        updateGymSettings,
        resetToDefaults,
        addToast,
        updateGymProfile,
        updateGeneralSettings,
        updateReceiptSettings,
        getMember,
        getTrainer,
        getPlan,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
