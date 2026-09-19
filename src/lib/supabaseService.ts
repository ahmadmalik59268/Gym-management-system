import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Member,
  MembershipPlan,
  Membership,
  Payment,
  Attendance,
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
  PayrollSettings,
  EmployeeSalaryConfig,
  SalaryAdvance,
  PayrollDeduction,
  PayrollBonus,
  PayrollRecord,
  MemberCommissionBreakdown,
} from '../types';

// ==========================================
// 1. MEMBERS
// ==========================================
export async function apiFetchMembers(): Promise<Member[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('join_date', { ascending: false });

  if (error) {
    console.error('Error fetching members from Supabase:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    fullName: row.full_name || '',
    guardianName: row.guardian_name || '',
    profilePhoto: row.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: row.phone || '',
    email: row.email || '',
    dob: row.dob || '',
    gender: row.gender || 'Male',
    address: row.address || '',
    emergencyContact: {
      name: row.emergency_contact_name || '',
      relation: row.emergency_contact_relation || '',
      phone: row.emergency_contact_phone || '',
    },
    joinDate: row.join_date || new Date().toISOString().split('T')[0],
    status: row.status || 'Active',
    notes: row.notes || 'Member profile initialized',
  }));
}

export async function apiInsertMember(member: Omit<Member, 'id'> & { id?: string }): Promise<Member> {
  const memberId = member.id || `MEM-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id: memberId,
    full_name: member.fullName,
    guardian_name: member.guardianName || '',
    profile_photo: member.profilePhoto?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: member.phone,
    email: member.email || '',
    dob: member.dob || '2000-01-01',
    gender: member.gender || 'Male',
    address: member.address || '',
    emergency_contact_name: member.emergencyContact?.name || '',
    emergency_contact_relation: member.emergencyContact?.relation || '',
    emergency_contact_phone: member.emergencyContact?.phone || '',
    join_date: member.joinDate || new Date().toISOString().split('T')[0],
    status: member.status || 'Active',
    notes: member.notes?.trim() || 'Member joined',
  };

  const { data, error } = await supabase.from('members').insert([payload]).select().single();
  if (error) {
    console.error('Error inserting member into Supabase:', error);
    throw error;
  }

  return {
    id: data.id,
    fullName: data.full_name,
    guardianName: data.guardian_name,
    profilePhoto: data.profile_photo,
    phone: data.phone,
    email: data.email,
    dob: data.dob,
    gender: data.gender,
    address: data.address,
    emergencyContact: {
      name: data.emergency_contact_name,
      relation: data.emergency_contact_relation,
      phone: data.emergency_contact_phone,
    },
    joinDate: data.join_date,
    status: data.status,
    notes: data.notes,
  };
}

export async function apiUpdateMember(id: string, updates: Partial<Member>): Promise<void> {
  const payload: any = {};
  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.guardianName !== undefined) payload.guardian_name = updates.guardianName;
  if (updates.profilePhoto !== undefined && updates.profilePhoto.trim()) payload.profile_photo = updates.profilePhoto;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.dob !== undefined) payload.dob = updates.dob;
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.joinDate !== undefined) payload.join_date = updates.joinDate;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined && updates.notes.trim()) payload.notes = updates.notes;

  if (updates.emergencyContact) {
    if (updates.emergencyContact.name !== undefined) payload.emergency_contact_name = updates.emergencyContact.name;
    if (updates.emergencyContact.relation !== undefined) payload.emergency_contact_relation = updates.emergencyContact.relation;
    if (updates.emergencyContact.phone !== undefined) payload.emergency_contact_phone = updates.emergencyContact.phone;
  }

  const { error } = await supabase.from('members').update(payload).eq('id', id);
  if (error) {
    console.error('Error updating member in Supabase:', error);
    throw error;
  }
}

export async function apiDeleteMember(id: string): Promise<void> {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) {
    console.error('Error deleting member from Supabase:', error);
    throw error;
  }
}

// ==========================================
// 2. MEMBERSHIP PLANS
// ==========================================
export async function apiFetchPlans(): Promise<MembershipPlan[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('membership_plans').select('*').order('price', { ascending: true });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    duration: Number(row.duration_months) || 1,
    price: Number(row.price) || 0,
    description: row.description || '',
    status: row.status || 'Active',
    features: Array.isArray(row.features) ? row.features : [],
  }));
}

export async function apiInsertPlan(plan: Omit<MembershipPlan, 'id'> & { id?: string }): Promise<MembershipPlan> {
  const planId = plan.id || `PLAN-${Math.floor(100 + Math.random() * 900)}`;
  const payload = {
    id: planId,
    name: plan.name,
    duration_months: plan.duration,
    price: plan.price,
    description: plan.description || '',
    status: plan.status || 'Active',
    features: plan.features || [],
  };

  const { data, error } = await supabase.from('membership_plans').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    duration: data.duration_months,
    price: Number(data.price),
    description: data.description,
    status: data.status,
    features: data.features,
  };
}

export async function apiUpdatePlan(id: string, updates: Partial<MembershipPlan>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.duration !== undefined) payload.duration_months = updates.duration;
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.features !== undefined) payload.features = updates.features;

  const { error } = await supabase.from('membership_plans').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeletePlan(id: string): Promise<void> {
  const { error } = await supabase.from('membership_plans').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 3. MEMBERSHIPS
// ==========================================
export async function apiFetchMemberships(): Promise<Membership[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('memberships').select('*').order('start_date', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    memberId: row.member_id,
    planId: row.plan_id,
    customPlanName: row.custom_plan_name,
    startDate: row.start_date,
    endDate: row.end_date,
    totalAmount: Number(row.total_amount) || 0,
    paid: Number(row.paid) || 0,
    remaining: Number(row.remaining) || Math.max(0, (Number(row.total_amount) || 0) - (Number(row.paid) || 0)),
    status: row.status || 'Active',
  }));
}

export async function apiInsertMembership(membership: Omit<Membership, 'id'> & { id?: string }): Promise<Membership> {
  const id = membership.id || `MS-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id,
    member_id: membership.memberId,
    plan_id: membership.planId,
    custom_plan_name: membership.customPlanName || null,
    start_date: membership.startDate,
    end_date: membership.endDate,
    total_amount: membership.totalAmount,
    paid: membership.paid,
    status: membership.status || 'Active',
  };

  const { data, error } = await supabase.from('memberships').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    memberId: data.member_id,
    planId: data.plan_id,
    customPlanName: data.custom_plan_name,
    startDate: data.start_date,
    endDate: data.end_date,
    totalAmount: Number(data.total_amount),
    paid: Number(data.paid),
    remaining: Number(data.remaining) || (Number(data.total_amount) - Number(data.paid)),
    status: data.status,
  };
}

export async function apiUpdateMembership(id: string, updates: Partial<Membership>): Promise<void> {
  const payload: any = {};
  if (updates.planId !== undefined) payload.plan_id = updates.planId;
  if (updates.customPlanName !== undefined) payload.custom_plan_name = updates.customPlanName;
  if (updates.startDate !== undefined) payload.start_date = updates.startDate;
  if (updates.endDate !== undefined) payload.end_date = updates.endDate;
  if (updates.totalAmount !== undefined) payload.total_amount = updates.totalAmount;
  if (updates.paid !== undefined) payload.paid = updates.paid;
  if (updates.status !== undefined) payload.status = updates.status;

  const { error } = await supabase.from('memberships').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteMembership(id: string): Promise<void> {
  const { error } = await supabase.from('memberships').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 4. PAYMENTS
// ==========================================
export async function apiFetchPayments(): Promise<Payment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    receiptNumber: row.receipt_number,
    memberId: row.member_id,
    membershipId: row.membership_id,
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method || 'Cash',
    date: row.payment_date,
    status: row.status || 'Paid',
  }));
}

export async function apiInsertPayment(payment: Omit<Payment, 'receiptNumber'> & { receiptNumber?: string }): Promise<Payment> {
  const receiptNumber = payment.receiptNumber || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    receipt_number: receiptNumber,
    member_id: payment.memberId,
    membership_id: payment.membershipId || null,
    amount: payment.amount,
    payment_method: payment.paymentMethod || 'Cash',
    payment_date: payment.date || new Date().toISOString().split('T')[0],
    status: payment.status || 'Paid',
  };

  const { data, error } = await supabase.from('payments').insert([payload]).select().single();
  if (error) throw error;

  return {
    receiptNumber: data.receipt_number,
    memberId: data.member_id,
    membershipId: data.membership_id,
    amount: Number(data.amount),
    paymentMethod: data.payment_method,
    date: data.payment_date,
    status: data.status,
  };
}

// ==========================================
// 5. ATTENDANCE
// ==========================================
export async function apiFetchAttendance(): Promise<Attendance[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    personType: row.person_type || 'Member',
    personId: row.person_id,
    memberId: row.person_type === 'Member' ? row.person_id : undefined,
    checkInTime: row.check_in_time || '09:00',
    checkOutTime: row.check_out_time || null,
    date: row.date,
    status: row.status || 'Present',
    notes: row.notes || '',
  }));
}

export async function apiUpsertAttendance(record: {
  id?: string;
  personType: string;
  personId: string;
  date: string;
  status: string;
  checkInTime?: string;
  checkOutTime?: string | null;
  notes?: string;
}): Promise<Attendance> {
  const payload: any = {
    person_type: record.personType,
    person_id: record.personId,
    date: record.date,
    status: record.status,
    check_in_time: record.checkInTime || '09:00:00',
    check_out_time: record.checkOutTime || null,
    notes: record.notes || '',
  };

  if (record.id) {
    payload.id = record.id;
  }

  const { data, error } = await supabase
    .from('attendance')
    .upsert([payload], { onConflict: 'person_type,person_id,date' })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    personType: data.person_type,
    personId: data.person_id,
    memberId: data.person_type === 'Member' ? data.person_id : undefined,
    checkInTime: data.check_in_time,
    checkOutTime: data.check_out_time,
    date: data.date,
    status: data.status,
    notes: data.notes,
  };
}

export async function apiUpdateAttendance(id: string, updates: Partial<Attendance>): Promise<void> {
  const payload: any = {};
  if (updates.checkInTime !== undefined) payload.check_in_time = updates.checkInTime;
  if (updates.checkOutTime !== undefined) payload.check_out_time = updates.checkOutTime;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase.from('attendance').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteAttendance(id: string): Promise<void> {
  const { error } = await supabase.from('attendance').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 6. TRAINERS & ASSIGNMENTS
// ==========================================
export async function apiFetchTrainers(): Promise<Trainer[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('trainers').select('*').order('name', { ascending: true });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    photo: row.photo || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150',
    phone: row.phone || '',
    email: row.email || '',
    specialization: row.specialization || 'General Fitness',
    joiningDate: row.joining_date || new Date().toISOString().split('T')[0],
    salary: Number(row.salary) || 0,
    salaryType: row.salary_type || 'Fixed Salary',
    commissionPercentage: Number(row.commission_percentage) || 0,
    commissionBasis: row.commission_basis || 'Assigned Member Fees',
    commissionRevenueTreatment: row.commission_revenue_treatment || 'Paid amount',
    hourlyRate: Number(row.hourly_rate) || 0,
    dailyRate: Number(row.daily_rate) || 0,
    workingDaysPerMonth: Number(row.working_days_per_month) || 26,
    bankDetails: {
      bankName: row.bank_name || '',
      accountTitle: row.account_title || '',
      accountNumber: row.account_number || '',
      ibanOrRouting: row.iban_or_routing || '',
    },
    status: row.status || 'Active',
    bio: row.bio || '',
    experience: Number(row.experience_years) || 1,
  }));
}

export async function apiInsertTrainer(trainer: Omit<Trainer, 'id'> & { id?: string }): Promise<Trainer> {
  const id = trainer.id || `TR-${Math.floor(100 + Math.random() * 900)}`;
  const payload = {
    id,
    name: trainer.name,
    photo: trainer.photo || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150',
    phone: trainer.phone,
    email: trainer.email,
    specialization: trainer.specialization || 'Strength & Conditioning',
    joining_date: trainer.joiningDate || new Date().toISOString().split('T')[0],
    salary: trainer.salary || 0,
    salary_type: trainer.salaryType || 'Fixed Salary',
    commission_percentage: trainer.commissionPercentage || 0,
    commission_basis: trainer.commissionBasis || 'Assigned Member Fees',
    commission_revenue_treatment: trainer.commissionRevenueTreatment || 'Paid amount',
    hourly_rate: trainer.hourlyRate || 0,
    daily_rate: trainer.dailyRate || 0,
    working_days_per_month: trainer.workingDaysPerMonth || 26,
    bank_name: trainer.bankDetails?.bankName || '',
    account_title: trainer.bankDetails?.accountTitle || '',
    account_number: trainer.bankDetails?.accountNumber || '',
    iban_or_routing: trainer.bankDetails?.ibanOrRouting || '',
    status: trainer.status || 'Active',
    bio: trainer.bio || '',
    experience_years: trainer.experience || 1,
  };

  const { data, error } = await supabase.from('trainers').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    photo: data.photo,
    phone: data.phone,
    email: data.email,
    specialization: data.specialization,
    joiningDate: data.joining_date,
    salary: Number(data.salary),
    salaryType: data.salary_type,
    commissionPercentage: Number(data.commission_percentage),
    status: data.status,
    bio: data.bio,
    experience: Number(data.experience_years),
  };
}

export async function apiUpdateTrainer(id: string, updates: Partial<Trainer>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.photo !== undefined) payload.photo = updates.photo;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.specialization !== undefined) payload.specialization = updates.specialization;
  if (updates.joiningDate !== undefined) payload.joining_date = updates.joiningDate;
  if (updates.salary !== undefined) payload.salary = updates.salary;
  if (updates.salaryType !== undefined) payload.salary_type = updates.salaryType;
  if (updates.commissionPercentage !== undefined) payload.commission_percentage = updates.commissionPercentage;
  if (updates.commissionBasis !== undefined) payload.commission_basis = updates.commissionBasis;
  if (updates.commissionRevenueTreatment !== undefined) payload.commission_revenue_treatment = updates.commissionRevenueTreatment;
  if (updates.hourlyRate !== undefined) payload.hourly_rate = updates.hourlyRate;
  if (updates.dailyRate !== undefined) payload.daily_rate = updates.dailyRate;
  if (updates.workingDaysPerMonth !== undefined) payload.working_days_per_month = updates.workingDaysPerMonth;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.experience !== undefined) payload.experience_years = updates.experience;

  if (updates.bankDetails) {
    if (updates.bankDetails.bankName !== undefined) payload.bank_name = updates.bankDetails.bankName;
    if (updates.bankDetails.accountTitle !== undefined) payload.account_title = updates.bankDetails.accountTitle;
    if (updates.bankDetails.accountNumber !== undefined) payload.account_number = updates.bankDetails.accountNumber;
    if (updates.bankDetails.ibanOrRouting !== undefined) payload.iban_or_routing = updates.bankDetails.ibanOrRouting;
  }

  const { error } = await supabase.from('trainers').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteTrainer(id: string): Promise<void> {
  const { error } = await supabase.from('trainers').delete().eq('id', id);
  if (error) throw error;
}

export async function apiFetchAssignments(): Promise<TrainerAssignment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('trainer_assignments').select('*');
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    trainerId: row.trainer_id,
    memberId: row.member_id,
    assignedDate: row.assigned_date,
  }));
}

export async function apiAssignMember(trainerId: string, memberId: string, assignedDate?: string): Promise<void> {
  const id = `ASN-${trainerId}-${memberId}`;
  const payload = {
    id,
    trainer_id: trainerId,
    member_id: memberId,
    assigned_date: assignedDate || new Date().toISOString().split('T')[0],
    status: 'Active',
  };

  const { error } = await supabase.from('trainer_assignments').upsert([payload], { onConflict: 'trainer_id,member_id' });
  if (error) throw error;
}

export async function apiRemoveAssignment(trainerId: string, memberId: string): Promise<void> {
  const { error } = await supabase
    .from('trainer_assignments')
    .delete()
    .eq('trainer_id', trainerId)
    .eq('member_id', memberId);
  if (error) throw error;
}

// ==========================================
// 7. WORKOUT & DIET PLANS
// ==========================================
export async function apiFetchWorkoutPlans(): Promise<WorkoutPlan[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('workout_plans').select('*');
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || 'Personalized Workout Plan',
    memberId: row.member_id,
    trainerId: row.trainer_id,
    goal: row.goal || '',
    workoutDays: Array.isArray(row.workout_days) ? row.workout_days : [],
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
    notes: row.notes || '',
  }));
}

export async function apiSaveWorkoutPlan(plan: Omit<WorkoutPlan, 'id'> & { id?: string }): Promise<void> {
  const id = plan.id || `WP-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id,
    title: plan.title || 'Workout Schedule',
    member_id: plan.memberId,
    trainer_id: plan.trainerId || null,
    goal: plan.goal || '',
    workout_days: plan.workoutDays || [],
    exercises: plan.exercises || [],
    notes: plan.notes || '',
  };

  const { error } = await supabase.from('workout_plans').upsert([payload]);
  if (error) throw error;
}

export async function apiDeleteWorkoutPlan(id: string): Promise<void> {
  const { error } = await supabase.from('workout_plans').delete().eq('id', id);
  if (error) throw error;
}

export async function apiFetchDietPlans(): Promise<DietPlan[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('diet_plans').select('*');
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || 'Dietary Nutrition Plan',
    memberId: row.member_id,
    trainerId: row.trainer_id,
    goal: row.goal || '',
    calories: Number(row.calories) || 2000,
    breakfast: row.breakfast || '',
    lunch: row.lunch || '',
    dinner: row.dinner || '',
    snacks: row.snacks || '',
    waterTarget: Number(row.water_target_liters) || 3,
    notes: row.notes || '',
  }));
}

export async function apiSaveDietPlan(plan: Omit<DietPlan, 'id'> & { id?: string }): Promise<void> {
  const id = plan.id || `DP-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id,
    title: plan.title || 'Nutrition Plan',
    member_id: plan.memberId,
    trainer_id: plan.trainerId || null,
    goal: plan.goal || '',
    calories: plan.calories || 2000,
    breakfast: plan.breakfast || '',
    lunch: plan.lunch || '',
    dinner: plan.dinner || '',
    snacks: plan.snacks || '',
    water_target_liters: plan.waterTarget || 3,
    notes: plan.notes || '',
  };

  const { error } = await supabase.from('diet_plans').upsert([payload]);
  if (error) throw error;
}

export async function apiDeleteDietPlan(id: string): Promise<void> {
  const { error } = await supabase.from('diet_plans').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 8. EXPENSES
// ==========================================
export async function apiFetchExpenses(): Promise<Expense[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title || row.category,
    category: row.category,
    amount: Number(row.amount) || 0,
    date: row.expense_date,
    description: row.description || '',
    paymentMethod: row.payment_method || 'Cash',
    notes: row.notes || '',
  }));
}

export async function apiInsertExpense(expense: Omit<Expense, 'id'> & { id?: string }): Promise<Expense> {
  const id = expense.id || `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id,
    title: expense.title || expense.category,
    category: expense.category,
    amount: expense.amount,
    expense_date: expense.date || new Date().toISOString().split('T')[0],
    description: expense.description || '',
    payment_method: expense.paymentMethod || 'Cash',
    notes: expense.notes || '',
  };

  const { data, error } = await supabase.from('expenses').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    category: data.category,
    amount: Number(data.amount),
    date: data.expense_date,
    description: data.description,
    paymentMethod: data.payment_method,
    notes: data.notes,
  };
}

export async function apiUpdateExpense(id: string, updates: Partial<Expense>): Promise<void> {
  const payload: any = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.date !== undefined) payload.expense_date = updates.date;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase.from('expenses').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 9. EQUIPMENT & MAINTENANCE
// ==========================================
export async function apiFetchEquipment(): Promise<Equipment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('equipment').select('*').order('name', { ascending: true });
  if (error) throw error;

  // Also fetch maintenance logs
  const { data: logs } = await supabase.from('equipment_maintenance_logs').select('*');

  return (data || []).map((row: any) => {
    const eqLogs = (logs || [])
      .filter((l: any) => l.equipment_id === row.id)
      .map((l: any) => ({
        date: l.log_date,
        cost: Number(l.cost) || 0,
        description: l.description || '',
      }));

    return {
      id: row.id,
      name: row.name,
      category: row.category || 'General',
      quantity: Number(row.quantity) || 1,
      purchaseDate: row.purchase_date || '',
      purchasePrice: Number(row.purchase_price) || 0,
      condition: row.condition || 'Good',
      status: row.status || 'Active',
      lastMaintenance: row.last_maintenance || '',
      nextMaintenance: row.next_maintenance || '',
      notes: row.notes || '',
      maintenanceHistory: eqLogs,
    };
  });
}

export async function apiInsertEquipment(eq: Omit<Equipment, 'id'> & { id?: string }): Promise<Equipment> {
  const id = eq.id || `EQ-${Math.floor(100 + Math.random() * 900)}`;
  const payload = {
    id,
    name: eq.name,
    category: eq.category,
    quantity: eq.quantity,
    purchase_date: eq.purchaseDate || new Date().toISOString().split('T')[0],
    purchase_price: eq.purchasePrice || 0,
    condition: eq.condition || 'Good',
    status: eq.status || 'Active',
    last_maintenance: eq.lastMaintenance || null,
    next_maintenance: eq.nextMaintenance || null,
    notes: eq.notes || '',
  };

  const { data, error } = await supabase.from('equipment').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    quantity: Number(data.quantity),
    purchaseDate: data.purchase_date,
    purchasePrice: Number(data.purchase_price),
    condition: data.condition,
    status: data.status,
    lastMaintenance: data.last_maintenance,
    nextMaintenance: data.next_maintenance,
    notes: data.notes,
  };
}

export async function apiUpdateEquipment(id: string, updates: Partial<Equipment>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.quantity !== undefined) payload.quantity = updates.quantity;
  if (updates.purchaseDate !== undefined) payload.purchase_date = updates.purchaseDate;
  if (updates.purchasePrice !== undefined) payload.purchase_price = updates.purchasePrice;
  if (updates.condition !== undefined) payload.condition = updates.condition;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.lastMaintenance !== undefined) payload.last_maintenance = updates.lastMaintenance;
  if (updates.nextMaintenance !== undefined) payload.next_maintenance = updates.nextMaintenance;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  const { error } = await supabase.from('equipment').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteEquipment(id: string): Promise<void> {
  const { error } = await supabase.from('equipment').delete().eq('id', id);
  if (error) throw error;
}

export async function apiAddEquipmentMaintenance(equipmentId: string, log: { date: string; cost: number; description: string }): Promise<void> {
  const { error } = await supabase.from('equipment_maintenance_logs').insert([
    {
      equipment_id: equipmentId,
      log_date: log.date,
      cost: log.cost,
      description: log.description,
    },
  ]);
  if (error) throw error;

  // Also update last_maintenance on equipment
  await supabase
    .from('equipment')
    .update({ last_maintenance: log.date })
    .eq('id', equipmentId);
}

// ==========================================
// 10. STAFF
// ==========================================
export async function apiFetchStaff(): Promise<StaffUser[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('staff').select('*').order('name', { ascending: true });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || 'Receptionist',
    phone: row.phone || '',
    salary: Number(row.salary) || 0,
    salaryType: row.salary_type || 'Fixed Salary',
    status: row.status || 'Active',
    lastActive: row.last_active || '',
    joiningDate: row.joining_date || '',
    commissionPercentage: Number(row.commission_percentage) || 0,
    commissionBasis: row.commission_basis || 'Assigned Member Fees',
  }));
}

export async function apiInsertStaff(staffUser: Omit<StaffUser, 'id'> & { id?: string }): Promise<StaffUser> {
  const id = staffUser.id || `STF-${Math.floor(100 + Math.random() * 900)}`;
  const payload = {
    id,
    name: staffUser.name,
    email: staffUser.email,
    role: staffUser.role,
    phone: staffUser.phone || '',
    salary: staffUser.salary || 0,
    salary_type: staffUser.salaryType || 'Fixed Salary',
    status: staffUser.status || 'Active',
    joining_date: staffUser.joiningDate || new Date().toISOString().split('T')[0],
    commission_percentage: staffUser.commissionPercentage || 0,
    commission_basis: staffUser.commissionBasis || 'Assigned Member Fees',
  };

  const { data, error } = await supabase.from('staff').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone,
    salary: Number(data.salary),
    salaryType: data.salary_type,
    status: data.status,
    joiningDate: data.joining_date,
    commissionPercentage: Number(data.commission_percentage),
  };
}

export async function apiUpdateStaff(id: string, updates: Partial<StaffUser>): Promise<void> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.salary !== undefined) payload.salary = updates.salary;
  if (updates.salaryType !== undefined) payload.salary_type = updates.salaryType;
  if (updates.status !== undefined) payload.status = updates.status;

  const { error } = await supabase.from('staff').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteStaff(id: string): Promise<void> {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  if (error) throw error;
}

// ==========================================
// 11. NOTIFICATIONS
// ==========================================
export async function apiFetchNotifications(): Promise<Notification[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    type: row.type || 'new_member',
    title: row.title,
    message: row.message,
    date: row.notification_date || new Date().toISOString().split('T')[0],
    isRead: Boolean(row.is_read),
  }));
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).neq('id', '00000000-0000-0000-0000-000000000000');
}

// ==========================================
// 12. SETTINGS
// ==========================================
export async function apiFetchGymProfile(): Promise<GymProfileSettings | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from('gym_profiles').select('*').limit(1).maybeSingle();
  if (error || !data) return null;

  return {
    gymName: data.gym_name || 'ApexFit Commercial Club',
    logo: data.logo_url || '',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    website: data.website || '',
  };
}

export async function apiUpdateGymProfile(profile: Partial<GymProfileSettings>): Promise<void> {
  const { data: existing } = await supabase.from('gym_profiles').select('id').limit(1).maybeSingle();
  const payload = {
    gym_name: profile.gymName,
    logo_url: profile.logo,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    website: profile.website,
  };

  if (existing) {
    await supabase.from('gym_profiles').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('gym_profiles').insert([payload]);
  }
}

export async function apiFetchGymSettings(): Promise<{ general: GeneralSettings; receipt: ReceiptSettings } | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from('gym_settings').select('*').limit(1).maybeSingle();
  if (error || !data) return null;

  return {
    general: {
      currency: data.currency || 'PKR',
      currencySymbol: data.currency_symbol || 'Rs.',
      dateFormat: data.date_format || 'DD/MM/YYYY',
      timeFormat: data.time_format || '12h',
    },
    receipt: {
      headerText: data.receipt_header || '',
      footerNotes: data.receipt_footer || '',
      taxNumber: data.tax_number || '',
      termsAndConditions: data.terms_and_conditions || '',
    },
  };
}

export async function apiUpdateGeneralSettings(settings: Partial<GeneralSettings>): Promise<void> {
  const { data: existing } = await supabase.from('gym_settings').select('id').limit(1).maybeSingle();
  const payload: any = {};
  if (settings.currency) payload.currency = settings.currency;
  if (settings.currencySymbol) payload.currency_symbol = settings.currencySymbol;
  if (settings.dateFormat) payload.date_format = settings.dateFormat;
  if (settings.timeFormat) payload.time_format = settings.timeFormat;

  if (existing) {
    await supabase.from('gym_settings').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('gym_settings').insert([payload]);
  }
}

export async function apiUpdateReceiptSettings(settings: Partial<ReceiptSettings>): Promise<void> {
  const { data: existing } = await supabase.from('gym_settings').select('id').limit(1).maybeSingle();
  const payload: any = {};
  if (settings.headerText !== undefined) payload.receipt_header = settings.headerText;
  if (settings.footerNotes !== undefined) payload.receipt_footer = settings.footerNotes;
  if (settings.taxNumber !== undefined) payload.tax_number = settings.taxNumber;
  if (settings.termsAndConditions !== undefined) payload.terms_and_conditions = settings.termsAndConditions;

  if (existing) {
    await supabase.from('gym_settings').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('gym_settings').insert([payload]);
  }
}

// ==========================================
// 13. PAYROLL TABLES
// ==========================================
export async function apiFetchSalaryConfigs(): Promise<EmployeeSalaryConfig[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('employee_salary_configs').select('*');
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    employeeType: row.employee_type,
    employeeName: row.employee_name,
    employeeRole: row.employee_role,
    photo: row.photo,
    email: row.email,
    phone: row.phone,
    salaryType: row.salary_type,
    baseSalary: Number(row.base_salary) || 0,
    hourlyRate: Number(row.hourly_rate) || 0,
    dailyRate: Number(row.daily_rate) || 0,
    workingDaysPerMonth: Number(row.working_days_per_month) || 26,
    dailyHours: Number(row.daily_hours) || 8,
    commissionPercentage: Number(row.commission_percentage) || 0,
    commissionBasis: row.commission_basis || 'Assigned Member Fees',
    commissionRevenueTreatment: row.commission_revenue_treatment || 'Paid amount',
    joiningDate: row.joining_date || '',
    salaryEffectiveDate: row.salary_effective_date || '',
    paymentMethod: row.payment_method || 'Bank Transfer',
    bankDetails: {
      bankName: row.bank_name || '',
      accountTitle: row.account_title || '',
      accountNumber: row.account_number || '',
      ibanOrRouting: row.iban_or_routing || '',
    },
    status: row.status || 'Active',
    notes: row.notes || '',
  }));
}

export async function apiUpsertSalaryConfig(config: EmployeeSalaryConfig): Promise<void> {
  const payload = {
    id: config.id,
    employee_id: config.employeeId,
    employee_type: config.employeeType,
    employee_name: config.employeeName,
    employee_role: config.employeeRole,
    photo: config.photo || null,
    email: config.email || null,
    phone: config.phone || null,
    salary_type: config.salaryType,
    base_salary: config.baseSalary,
    hourly_rate: config.hourlyRate || 0,
    daily_rate: config.dailyRate || 0,
    working_days_per_month: config.workingDaysPerMonth,
    daily_hours: config.dailyHours || 8,
    commission_percentage: config.commissionPercentage || 0,
    commission_basis: config.commissionBasis,
    commission_revenue_treatment: config.commissionRevenueTreatment,
    joining_date: config.joiningDate || new Date().toISOString().split('T')[0],
    salary_effective_date: config.salaryEffectiveDate || new Date().toISOString().split('T')[0],
    payment_method: config.paymentMethod,
    bank_name: config.bankDetails?.bankName || null,
    account_title: config.bankDetails?.accountTitle || null,
    account_number: config.bankDetails?.accountNumber || null,
    iban_or_routing: config.bankDetails?.ibanOrRouting || null,
    status: config.status,
    notes: config.notes || null,
  };

  const { error } = await supabase.from('employee_salary_configs').upsert([payload]);
  if (error) throw error;
}

export async function apiFetchAdvances(): Promise<SalaryAdvance[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('salary_advances').select('*').order('request_date', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    employeeRole: row.employee_role,
    photo: row.photo,
    amount: Number(row.amount) || 0,
    requestDate: row.request_date,
    disbursedDate: row.disbursed_date,
    reason: row.reason || '',
    payrollMonth: row.payroll_month,
    recoveredAmount: Number(row.recovered_amount) || 0,
    remainingAmount: Math.max(0, (Number(row.amount) || 0) - (Number(row.recovered_amount) || 0)),
    status: row.status,
    paymentMethod: row.payment_method,
    approvedBy: row.approved_by,
    notes: row.notes,
  }));
}

export async function apiInsertAdvance(adv: Omit<SalaryAdvance, 'id'> & { id?: string }): Promise<SalaryAdvance> {
  const id = adv.id || `ADV-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id,
    employee_id: adv.employeeId,
    employee_name: adv.employeeName,
    employee_role: adv.employeeRole,
    photo: adv.photo || null,
    amount: adv.amount,
    request_date: adv.requestDate || new Date().toISOString().split('T')[0],
    disbursed_date: adv.disbursedDate || null,
    reason: adv.reason || '',
    payroll_month: adv.payrollMonth,
    recovered_amount: adv.recoveredAmount || 0,
    status: adv.status || 'Pending',
    payment_method: adv.paymentMethod || 'Cash',
    approved_by: adv.approvedBy || null,
    notes: adv.notes || null,
  };

  const { data, error } = await supabase.from('salary_advances').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.employee_name,
    employeeRole: data.employee_role,
    photo: data.photo,
    amount: Number(data.amount),
    requestDate: data.request_date,
    disbursedDate: data.disbursed_date,
    reason: data.reason,
    payrollMonth: data.payroll_month,
    recoveredAmount: Number(data.recovered_amount),
    remainingAmount: Math.max(0, Number(data.amount) - Number(data.recovered_amount)),
    status: data.status,
  };
}

export async function apiUpdateAdvance(id: string, updates: Partial<SalaryAdvance>): Promise<void> {
  const payload: any = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.recoveredAmount !== undefined) payload.recovered_amount = updates.recoveredAmount;
  if (updates.disbursedDate !== undefined) payload.disbursed_date = updates.disbursedDate;
  if (updates.approvedBy !== undefined) payload.approved_by = updates.approvedBy;

  const { error } = await supabase.from('salary_advances').update(payload).eq('id', id);
  if (error) throw error;
}

export async function apiDeleteAdvance(id: string): Promise<void> {
  const { error } = await supabase.from('salary_advances').delete().eq('id', id);
  if (error) throw error;
}

export async function apiFetchDeductions(): Promise<PayrollDeduction[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('payroll_deductions').select('*').order('deduction_date', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    employeeRole: row.employee_role,
    type: row.deduction_type,
    amount: Number(row.amount) || 0,
    date: row.deduction_date,
    reason: row.reason || '',
    payrollMonth: row.payroll_month,
    notes: row.notes,
  }));
}

export async function apiInsertDeduction(ded: Omit<PayrollDeduction, 'id'> & { id?: string }): Promise<PayrollDeduction> {
  const id = ded.id || `DED-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id,
    employee_id: ded.employeeId,
    employee_name: ded.employeeName,
    employee_role: ded.employeeRole,
    deduction_type: ded.type,
    amount: ded.amount,
    deduction_date: ded.date || new Date().toISOString().split('T')[0],
    reason: ded.reason || '',
    payroll_month: ded.payrollMonth,
    notes: ded.notes || null,
  };

  const { data, error } = await supabase.from('payroll_deductions').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.employee_name,
    employeeRole: data.employee_role,
    type: data.deduction_type,
    amount: Number(data.amount),
    date: data.deduction_date,
    reason: data.reason,
    payrollMonth: data.payroll_month,
  };
}

export async function apiDeleteDeduction(id: string): Promise<void> {
  const { error } = await supabase.from('payroll_deductions').delete().eq('id', id);
  if (error) throw error;
}

export async function apiFetchBonuses(): Promise<PayrollBonus[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('payroll_bonuses').select('*').order('bonus_date', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    employeeRole: row.employee_role,
    type: row.bonus_type,
    amount: Number(row.amount) || 0,
    date: row.bonus_date,
    reason: row.reason || '',
    payrollMonth: row.payroll_month,
    notes: row.notes,
  }));
}

export async function apiInsertBonus(bon: Omit<PayrollBonus, 'id'> & { id?: string }): Promise<PayrollBonus> {
  const id = bon.id || `BON-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    id,
    employee_id: bon.employeeId,
    employee_name: bon.employeeName,
    employee_role: bon.employeeRole,
    bonus_type: bon.type,
    amount: bon.amount,
    bonus_date: bon.date || new Date().toISOString().split('T')[0],
    reason: bon.reason || '',
    payroll_month: bon.payrollMonth,
    notes: bon.notes || null,
  };

  const { data, error } = await supabase.from('payroll_bonuses').insert([payload]).select().single();
  if (error) throw error;

  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.employee_name,
    employeeRole: data.employee_role,
    type: data.bonus_type,
    amount: Number(data.amount),
    date: data.bonus_date,
    reason: data.reason,
    payrollMonth: data.payroll_month,
  };
}

export async function apiDeleteBonus(id: string): Promise<void> {
  const { error } = await supabase.from('payroll_bonuses').delete().eq('id', id);
  if (error) throw error;
}

export async function apiFetchPayrollRecords(): Promise<PayrollRecord[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('payroll_records').select('*').order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    employeePhoto: row.employee_photo,
    employeeRole: row.employee_role,
    employeeEmail: row.employee_email,
    employeePhone: row.employee_phone,
    salaryType: row.salary_type,
    payrollMonth: row.payroll_month,
    periodStartDate: row.period_start_date,
    periodEndDate: row.period_end_date,
    totalWorkingDays: Number(row.total_working_days) || 26,
    presentDays: Number(row.present_days) || 0,
    absentDays: Number(row.absent_days) || 0,
    paidLeaves: Number(row.paid_leaves) || 0,
    unpaidLeaves: Number(row.unpaid_leaves) || 0,
    halfDays: Number(row.half_days) || 0,
    perDaySalary: Number(row.per_day_salary) || 0,
    attendancePay: Number(row.attendance_pay) || 0,
    hourlyRate: Number(row.hourly_rate) || 0,
    hoursWorked: Number(row.hours_worked) || 0,
    dailyRate: Number(row.daily_rate) || 0,
    daysWorked: Number(row.days_worked) || 0,
    hourlyDailyPay: Number(row.hourly_daily_pay) || 0,
    baseSalary: Number(row.base_salary) || 0,
    commissionPercentage: Number(row.commission_percentage) || 0,
    commissionBasis: row.commission_basis || 'Assigned Member Fees',
    commissionRevenueTreatment: row.commission_revenue_treatment || 'Paid amount',
    eligibleRevenue: Number(row.eligible_revenue) || 0,
    commissionAmount: Number(row.commission_amount) || 0,
    gymShareAmount: Number(row.gym_share_amount) || 0,
    assignedMembersCount: Number(row.assigned_members_count) || 0,
    bonusAmount: Number(row.bonus_amount) || 0,
    overtimeHours: Number(row.overtime_hours) || 0,
    overtimeRatePerHour: Number(row.overtime_rate_per_hour) || 0,
    overtimeAmount: Number(row.overtime_amount) || 0,
    advanceDeduction: Number(row.advance_deduction) || 0,
    otherDeductions: Number(row.other_deductions) || 0,
    grossPay: Number(row.gross_pay) || 0,
    totalDeductions: Number(row.total_deductions) || 0,
    netSalary: Number(row.net_salary) || 0,
    status: row.status || 'Draft',
    paymentMethod: row.payment_method || 'Bank Transfer',
    bankDetails: {
      bankName: row.bank_name || '',
      accountTitle: row.account_title || '',
      accountNumber: row.account_number || '',
      ibanOrRouting: row.iban_or_routing || '',
    },
    paidDate: row.paid_date,
    approvedDate: row.approved_date,
    approvedBy: row.approved_by,
    transactionReference: row.transaction_reference,
    notes: row.notes,
    generatedAt: row.created_at || new Date().toISOString(),
  }));
}

export async function apiUpsertPayrollRecord(rec: PayrollRecord): Promise<void> {
  const payload = {
    id: rec.id,
    employee_id: rec.employeeId,
    employee_name: rec.employeeName,
    employee_photo: rec.employeePhoto || null,
    employee_role: rec.employeeRole,
    employee_email: rec.employeeEmail || null,
    employee_phone: rec.employeePhone || null,
    salary_type: rec.salaryType,
    payroll_month: rec.payrollMonth,
    period_start_date: rec.periodStartDate,
    period_end_date: rec.periodEndDate,
    total_working_days: rec.totalWorkingDays,
    present_days: rec.presentDays,
    absent_days: rec.absentDays,
    paid_leaves: rec.paidLeaves,
    unpaid_leaves: rec.unpaidLeaves,
    half_days: rec.halfDays || 0,
    per_day_salary: rec.perDaySalary,
    attendance_pay: rec.attendancePay,
    hourly_rate: rec.hourlyRate || 0,
    hours_worked: rec.hoursWorked || 0,
    daily_rate: rec.dailyRate || 0,
    days_worked: rec.daysWorked || 0,
    hourly_daily_pay: rec.hourlyDailyPay || 0,
    base_salary: rec.baseSalary,
    commission_percentage: rec.commissionPercentage || 0,
    commission_basis: rec.commissionBasis,
    commission_revenue_treatment: rec.commissionRevenueTreatment,
    eligible_revenue: rec.eligibleRevenue,
    commission_amount: rec.commissionAmount,
    gym_share_amount: rec.gymShareAmount,
    assigned_members_count: rec.assignedMembersCount,
    bonus_amount: rec.bonusAmount,
    overtime_hours: rec.overtimeHours || 0,
    overtime_rate_per_hour: rec.overtimeRatePerHour || 0,
    overtime_amount: rec.overtimeAmount || 0,
    advance_deduction: rec.advanceDeduction,
    other_deductions: rec.otherDeductions,
    gross_pay: rec.grossPay,
    total_deductions: rec.totalDeductions,
    net_salary: rec.netSalary,
    status: rec.status,
    payment_method: rec.paymentMethod,
    bank_name: rec.bankDetails?.bankName || null,
    account_title: rec.bankDetails?.accountTitle || null,
    account_number: rec.bankDetails?.accountNumber || null,
    iban_or_routing: rec.bankDetails?.ibanOrRouting || null,
    paid_date: rec.paidDate || null,
    approved_date: rec.approvedDate || null,
    approved_by: rec.approvedBy || null,
    transaction_reference: rec.transactionReference || null,
    notes: rec.notes || null,
  };

  const { error } = await supabase.from('payroll_records').upsert([payload]);
  if (error) throw error;
}

export async function apiDeletePayrollRecord(id: string): Promise<void> {
  const { error } = await supabase.from('payroll_records').delete().eq('id', id);
  if (error) throw error;
}
