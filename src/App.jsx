import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import Borrowers from './pages/admin/Borrowers'
import BorrowerDetail from './pages/admin/BorrowerDetail'
import NewLoan from './pages/admin/NewLoan'
import LoansList from './pages/admin/LoansList'
import LoanDetail from './pages/admin/LoanDetail'
import PendingApprovals from './pages/admin/PendingApprovals'
import CollateralList from './pages/admin/CollateralList'
import NewCollateral from './pages/admin/NewCollateral'
import SavingsHistory from './pages/admin/SavingsHistory'
import SavingsTargets from './pages/admin/SavingsTargets'
import Payments from './pages/admin/Payments'
import Employees from './pages/admin/Employees'
import ActivityLogs from './pages/admin/ActivityLogs'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeLoans from './pages/employee/EmployeeLoans'

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, borderRadius: 10, border: '1px solid #E2D9CE' },
          success: { iconTheme: { primary: '#6F8F72', secondary: '#fff' } },
          error: { iconTheme: { primary: '#B85C5C', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="borrowers" element={<Borrowers />} />
          <Route path="borrowers/:id" element={<BorrowerDetail />} />
          <Route path="loans/new" element={<NewLoan />} />
          <Route path="loans/active" element={<LoansList status="active" />} />
          <Route path="loans/overdue" element={<LoansList status="overdue" />} />
          <Route path="loans/completed" element={<LoansList status="completed" />} />
          <Route path="loans/:id" element={<LoanDetail />} />
          <Route path="payments" element={<Payments />} />
          <Route path="collateral/held" element={<CollateralList status="held" />} />
          <Route path="collateral/ready" element={<CollateralList status="ready" />} />
          <Route path="collateral/returned" element={<CollateralList status="returned" />} />
          <Route path="collateral/new" element={<NewCollateral />} />
          <Route path="savings" element={<SavingsHistory />} />
          <Route path="savings/add" element={<SavingsHistory />} />
          <Route path="savings/targets" element={<SavingsTargets />} />
          <Route path="reports" element={<Reports />} />
          <Route path="approvals" element={<PendingApprovals />} />
          <Route path="employees" element={<Employees />} />
          <Route path="logs" element={<ActivityLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute role="employee"><AppLayout /></ProtectedRoute>
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="loans" element={<EmployeeLoans />} />
          <Route path="loans/new" element={<NewLoan />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
