import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { PayrollProvider } from './context/PayrollContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/Login';

// Page Imports
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { AddMemberPage } from './pages/AddMemberPage';
import { MemberProfile } from './pages/MemberProfile';
import { Memberships } from './pages/Memberships';
import { MembershipPlans } from './pages/MembershipPlans';
import { Payments } from './pages/Payments';
import { Attendance } from './pages/Attendance';
import { Trainers } from './pages/Trainers';
import { TrainerProfile } from './pages/TrainerProfile';
import { TrainerAssignments } from './pages/TrainerAssignments';
import { WorkoutPlans } from './pages/WorkoutPlans';
import { DietPlans } from './pages/DietPlans';
import { Expenses } from './pages/Expenses';
import { EquipmentPage } from './pages/Equipment';
import { Reports } from './pages/Reports';
import { StaffPage } from './pages/Staff';
import { Settings } from './pages/Settings';
import { NotificationsPage } from './pages/Notifications';
import { PayrollLayout } from './pages/payroll/PayrollLayout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GymProvider>
          <PayrollProvider>
            <Routes>
              {/* Authentication route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Main App Layout and protected routes */}
              <Route path="/" element={<AppLayout />}>
                {/* Dashboard */}
                <Route index element={<Dashboard />} />

                {/* Members Section */}
                <Route path="members" element={<Members />} />
                <Route path="members/add" element={<AddMemberPage />} />
                <Route path="members/new" element={<AddMemberPage />} />
                <Route path="members/:id" element={<MemberProfile />} />

                {/* Memberships & Plans */}
                <Route path="memberships" element={<Memberships />} />
                <Route path="memberships/plans" element={<MembershipPlans />} />

                {/* Financial Ledger & Receipts */}
                <Route path="payments" element={<Payments />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="finance/expenses" element={<Expenses />} />

                {/* Turnstile Attendance */}
                <Route path="attendance" element={<Attendance />} />

                {/* Payroll & Salary Management */}
                <Route path="payroll/*" element={<PayrollLayout />} />

                {/* Coaching & Trainers */}
                <Route path="trainers" element={<Trainers />} />
                <Route path="trainers/:id" element={<TrainerProfile />} />
                <Route path="trainers/profile/:id" element={<TrainerProfile />} />
                <Route path="trainers/assignments" element={<TrainerAssignments />} />

                {/* Fitness & Nutrition */}
                <Route path="workout-plans" element={<WorkoutPlans />} />
                <Route path="fitness/workout-plans" element={<WorkoutPlans />} />
                <Route path="diet-plans" element={<DietPlans />} />
                <Route path="fitness/diet-plans" element={<DietPlans />} />

                {/* Facility Operations */}
                <Route path="equipment" element={<EquipmentPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="notifications" element={<NotificationsPage />} />

                {/* Analytics & Configuration */}
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </PayrollProvider>
        </GymProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
