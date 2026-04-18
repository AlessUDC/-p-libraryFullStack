import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentLayout } from './layouts/StudentLayout';
import { StudentHome } from './pages/student/StudentHome';
import { LibrarianLayout } from './layouts/LibrarianLayout';
import { LibrarianDashboard } from './pages/librarian/LibrarianDashboard';
import { LoginPage } from './pages/auth/LoginPage';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole: 'student' | 'librarian' }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAllowed = user?.role === allowedRole || (allowedRole === 'librarian' && user?.role === 'administrator');
  if (!isAllowed) return <Navigate to={user?.role === 'student' ? '/student' : '/librarian'} replace />;

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentHome />} />
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