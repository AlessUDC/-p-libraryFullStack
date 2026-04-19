import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentLayout } from './layouts/StudentLayout';
import { StudentHome } from './pages/student/StudentHome';
import { TeacherHome } from './pages/teacher/TeacherHome';
import { LibrarianLayout } from './layouts/LibrarianLayout';
import { LibrarianDashboard } from './pages/librarian/LibrarianDashboard';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ConfirmAccountPage } from './pages/auth/ConfirmAccountPage';
import { ResendTokenPage } from './pages/auth/ResendTokenPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyResetTokenPage } from './pages/auth/VerifyResetTokenPage';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'student' | 'teacher' | 'librarian' }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const isAllowed = user?.role === allowedRole || (allowedRole === 'librarian' && user?.role === 'administrator');
  
  if (!isAllowed) {
    if (user?.role === 'student') return <Navigate to="/student" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/librarian" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/confirm" element={<ConfirmAccountPage />} />
          <Route path="/auth/resend-confirmation" element={<ResendTokenPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/verify-reset-token" element={<VerifyResetTokenPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />


          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentHome />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRole="teacher">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherHome />} />
          </Route>

          {/* Librarian Routes */}
          <Route path="/librarian" element={
            <ProtectedRoute allowedRole="librarian">
              <LibrarianLayout />
            </ProtectedRoute>
          }>
            <Route index element={<LibrarianDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
