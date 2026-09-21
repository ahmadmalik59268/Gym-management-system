export interface Member {
  id: string;
  fullName: string;
  guardianName: string;
  profilePhoto: string;
  phone: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  joinDate: string;
  status: 'Active' | 'Expired' | 'Expiring Soon';
  notes: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  duration: number; // in months
  price: number;
  description: string;
  status: 'Active' | 'Inactive';
  features?: string[];
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  customPlanName?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paid: number;
  remaining: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export interface Payment {
  receiptNumber: string;
  memberId: string;
  membershipId?: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Online';
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export type PersonType = 'Member' | 'Trainer' | 'Staff';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half Day';

export interface Attendance {
  id: string;
  personType: PersonType;
  personId: string;
  memberId?: string; // Backwards-compatible alias for memberId
  personName?: string;
  checkInTime: string;
  checkOutTime: string | null;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSummaryStats {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  halfDays: number;
  totalWorkingDays: number;
  attendancePercentage: number;
}

export interface Trainer {
  id: string;
  name: string;
  photo: string;
  phone: string;
  email: string;
  specialization: string;
  joiningDate: string;
  salary: number; // base salary
  salaryType?: SalaryType;
  commissionPercentage?: number; // e.g. 70 for 70%
  commissionBasis?: CommissionBasis;
  commissionRevenueTreatment?: CommissionRevenueTreatment;
  hourlyRate?: number;
  dailyRate?: number;
  workingDaysPerMonth?: number;
  bankDetails?: BankDetails;
  status: 'Active' | 'Inactive';
  bio?: string;
  experience?: number;
}

export interface TrainerAssignment {
  id: string;
  trainerId: string;
  memberId: string;
  assignedDate: string;
}

export type ExerciseCategory = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Cardio' | 'Core';

export interface Exercise {
  category: ExerciseCategory;
  name: string;
  sets: number;
  reps: string;
  restTime: string;
  notes?: string;
}

export type ExerciseItem = Exercise;

export interface WorkoutPlan {
  id: string;
  title?: string;
  memberId: string;
  trainerId?: string;
  goal: string;
  workoutDays: string[];
  exercises: Exercise[];
  notes?: string;
}

export interface DietPlan {
  id: string;
  title?: string;
  memberId: string;
  trainerId?: string;
  goal: string;
  calories?: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  waterTarget: number; // in liters
  notes?: string;
}

export type ExpenseCategory = 
  | 'Rent' 
  | 'Electricity' 
  | 'Equipment' 
  | 'Maintenance' 
  | 'Salaries' 
  | 'Cleaning' 
  | 'Marketing' 
  | 'Other';

export interface Expense {
  id: string;
  title?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description?: string;
  paymentMethod?: 'Cash' | 'Card' | 'Bank Transfer';
  notes?: string;
}

export interface EquipmentMaintenance {
  date: string;
  cost: number;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  purchaseDate: string;
  purchasePrice?: number;
  condition?: 'Excellent' | 'Good' | 'Needs Service' | 'Out of Order';
  status: 'Active' | 'In Maintenance' | 'Stored' | 'Working' | 'Under Maintenance' | 'Broken';
  maintenanceDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  notes?: string;
  maintenanceHistory?: EquipmentMaintenance[];
}

export interface Notification {
  id: string;
  type: 'membership_expiry' | 'membership_expired' | 'payment_pending' | 'new_member' | 'maintenance_due';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export type SalaryType =
  | 'Fixed Salary'
  | 'Attendance-Based Salary'
  | 'Percentage / Commission'
  | 'Fixed + Percentage'
  | 'Hourly / Daily';

export type CommissionBasis =
  | 'Membership Fees'
  | 'Assigned Member Fees'
  | 'Personal Training Fees'
  | 'Selected Revenue'
  | 'Custom Eligible Revenue';

export type CommissionRevenueTreatment =
  | 'Paid amount'
  | 'Final membership amount'
  | 'Personal training revenue'
  | 'Custom revenue';

export type PayrollStatus = 'Draft' | 'Pending' | 'Approved' | 'Paid' | 'Cancelled';

export type AdvanceStatus = 'Pending' | 'Approved' | 'Partially Recovered' | 'Fully Recovered' | 'Rejected';

export type DeductionType =
  | 'Late deduction'
  | 'Unpaid leave'
  | 'Advance recovery'
  | 'Tax'
  | 'Damage / Penalty'
  | 'Other deduction';

export type BonusType =
  | 'Performance bonus'
  | 'Target bonus'
  | 'Special bonus'
  | 'Holiday bonus'
  | 'Other bonus';

export type StaffRole = 'Admin' | 'Manager' | 'Receptionist' | 'Trainer' | 'Maintenance' | 'Cleaner';

export interface BankDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  ibanOrRouting?: string;
}

export interface EmployeeSalaryConfig {
  id: string; // matches staffId or trainerId
  employeeId: string;
  employeeType: 'Staff' | 'Trainer';
  employeeName: string;
  employeeRole: StaffRole | 'Trainer';
  photo?: string;
  email?: string;
  phone?: string;
  salaryType: SalaryType;
  baseSalary: number; // monthly fixed or monthly base
  hourlyRate?: number;
  dailyRate?: number;
  workingDaysPerMonth: number; // default 26
  dailyHours?: number; // default 8
  
  // Commission settings (for trainers and commission staff)
  commissionPercentage: number; // e.g. 70 for 70%
  commissionBasis: CommissionBasis;
  commissionRevenueTreatment: CommissionRevenueTreatment;
  
  // Effective & payment
  joiningDate: string;
  salaryEffectiveDate: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Cheque' | 'Online Wallet';
  bankDetails?: BankDetails;
  status: 'Active' | 'Inactive';
  notes?: string;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: StaffRole | 'Trainer';
  photo?: string;
  amount: number;
  requestDate: string;
  disbursedDate?: string;
  reason: string;
  payrollMonth: string; // e.g. "2026-09"
  recoveredAmount: number;
  remainingAmount: number;
  status: AdvanceStatus;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque';
  approvedBy?: string;
  notes?: string;
}

export interface PayrollDeduction {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: StaffRole | 'Trainer';
  type: DeductionType;
  amount: number;
  date: string;
  reason: string;
  payrollMonth: string; // e.g. "2026-09"
  notes?: string;
}

export interface PayrollBonus {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: StaffRole | 'Trainer';
  type: BonusType;
  amount: number;
  date: string;
  reason: string;
  payrollMonth: string; // e.g. "2026-09"
  notes?: string;
}

export interface MemberCommissionBreakdown {
  paymentId: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  memberPhoto?: string;
  planName?: string;
  paymentDate: string;
  invoiceAmount: number;
  paymentAmount: number;
  discountAmount?: number;
  isRefunded?: boolean;
  isCancelled?: boolean;
  eligibleAmount: number;
  commissionPercentage: number;
  trainerShare: number;
  gymShare: number;
  status: 'Eligible' | 'Excluded' | 'Refunded' | 'Cancelled';
  exclusionReason?: string;
}

export interface PayrollRecord {
  id: string; // e.g. "PR-202609-01"
  employeeId: string;
  employeeName: string;
  employeePhoto?: string;
  employeeRole: StaffRole | 'Trainer';
  employeeEmail?: string;
  employeePhone?: string;
  salaryType: SalaryType;
  payrollMonth: string; // e.g. "2026-09"
  periodStartDate: string;
  periodEndDate: string;
  
  // Attendance components
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
  halfDays?: number;
  perDaySalary: number;
  attendancePay: number; // (Monthly Salary / Working Days) * (Present + Paid Leaves)
  
  // Hourly / Daily components
  hourlyRate?: number;
  hoursWorked?: number;
  dailyRate?: number;
  daysWorked?: number;
  hourlyDailyPay?: number;

  // Base Pay
  baseSalary: number;

  // Commission details
  commissionPercentage: number;
  commissionBasis: CommissionBasis;
  commissionRevenueTreatment: CommissionRevenueTreatment;
  eligibleRevenue: number;
  commissionAmount: number;
  gymShareAmount: number;
  assignedMembersCount: number;
  memberCommissions?: MemberCommissionBreakdown[];

  // Adjustments
  bonusAmount: number;
  bonusesList?: PayrollBonus[];
  overtimeHours?: number;
  overtimeRatePerHour?: number;
  overtimeAmount: number;
  
  advanceDeduction: number;
  advancesList?: SalaryAdvance[];
  otherDeductions: number;
  deductionsList?: PayrollDeduction[];

  // Totals
  grossPay: number; // base/attendance/hourly + commission + bonus + overtime
  totalDeductions: number; // advanceDeduction + otherDeductions
  netSalary: number; // grossPay - totalDeductions

  // Status & Transaction
  status: PayrollStatus;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Cheque' | 'Online Wallet';
  bankDetails?: BankDetails;
  paidDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  transactionReference?: string;
  notes?: string;
  generatedAt: string;
}

export interface PayrollSettings {
  defaultWorkingDaysPerMonth: number;
  defaultDailyHours: number;
  overtimeMultiplier: number;
  lateGraceMinutes: number;
  lateDeductionAmountPerIncident: number;
  unpaidLeaveDeductionRule: 'Full Day Base' | 'Custom Rate';
  defaultCommissionBasis: CommissionBasis;
  commissionRevenueTreatment: CommissionRevenueTreatment;
  includeDiscountsInEligibleRevenue: boolean;
  excludeRefundedPayments: boolean;
  excludeCancelledPayments: boolean;
  defaultPaymentMethod: 'Bank Transfer' | 'Cash' | 'Cheque' | 'Online Wallet';
  autoApplyAdvances: boolean;
  taxNumber?: string;
  authorizedSignatoryName?: string;
  authorizedSignatoryTitle?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Receptionist' | 'Trainer' | 'Maintenance' | 'Cleaner';
  phone?: string;
  salary?: number;
  salaryType?: SalaryType;
  status: 'Active' | 'Inactive';
  lastActive?: string;
  joiningDate?: string;
  commissionPercentage?: number;
  commissionBasis?: CommissionBasis;
}

export type Staff = StaffUser;

export interface GymProfileSettings {
  gymName: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

export interface GeneralSettings {
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface ReceiptSettings {
  headerText: string;
  footerNotes: string;
  taxNumber: string;
  termsAndConditions: string;
}

export interface GymSettings {
  gymName: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  receiptFooter: string;
}

// Landing Page Form Submissions / Leads
export type FormSubmissionType = 'Contact Us' | 'Demo Request' | 'Membership Inquiry' | 'Free Trial' | 'Free Trial Request' | 'Custom Quote' | 'General';
export type FormSubmissionStatus = 'New' | 'Contacted' | 'Converted' | 'Closed';

export interface FormSubmission {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  formType: FormSubmissionType;
  subject: string;
  message: string;
  status: FormSubmissionStatus;
  notes?: string;
}

