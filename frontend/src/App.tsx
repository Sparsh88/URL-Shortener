import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/common/Toast';
import { PageLoaderSkeleton } from './components/common/LoadingSkeleton';
import { useAuthStore } from './stores/authStore';

// Code-split routes with dynamic imports to minimize initial bundle size and enable sub-second initial load
const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordForm = React.lazy(() => import('./components/auth/ForgotPasswordForm').then(m => ({ default: m.ForgotPasswordForm })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const DeveloperPage = React.lazy(() => import('./pages/DeveloperPage').then(m => ({ default: m.DeveloperPage })));
const RedirectPage = React.lazy(() => import('./pages/RedirectPage').then(m => ({ default: m.RedirectPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const AbuseReportPage = React.lazy(() => import('./pages/AbuseReportPage').then(m => ({ default: m.AbuseReportPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes client cache freshness
      gcTime: 1000 * 60 * 10,   // 10 minutes cache preservation
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && (user?.role !== 'admin' || user?.email?.toLowerCase() !== 'sparshchauhan050@gmail.com')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <Suspense fallback={<PageLoaderSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/report-abuse" element={<AbuseReportPage />} />
              <Route
                path="/forgot-password"
                element={
                  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
                    <ForgotPasswordForm />
                  </div>
                }
              />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer"
                element={
                  <ProtectedRoute>
                    <DeveloperPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Short link redirection challenge page */}
              <Route path="/r/:shortCode" element={<RedirectPage />} />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
