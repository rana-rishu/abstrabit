import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { MarketingLayout } from '../layouts/MarketingLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LandingPage } from '../pages/marketing/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { DashboardHome } from '../pages/dashboard/DashboardHome';
import { DocumentsPage } from '../pages/dashboard/DocumentsPage';
import { ChatPage } from '../pages/dashboard/ChatPage';
import { TasksPage } from '../pages/dashboard/TasksPage';
import { DebuggerPage } from '../pages/dashboard/DebuggerPage';
import { ToolLogsPage } from '../pages/dashboard/ToolLogsPage';
import { SettingsPage } from '../pages/dashboard/SettingsPage';

const RouteFallback = () => (
  <div className="p-8 text-txt-muted text-sm flex items-center justify-center gap-2 h-screen bg-bg-app">
    <span className="w-4 h-4 border-2 border-txt-muted border-t-transparent animate-spin rounded-full" />
    Loading view...
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Marketing Routes */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Guest Auth Routes */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>
          </Route>

          {/* Protected Onboarding & Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/home" element={<DashboardHome />} />
              <Route path="/dashboard/documents" element={<DocumentsPage />} />
              <Route path="/dashboard/chat" element={<ChatPage />} />
              <Route path="/dashboard/tasks" element={<TasksPage />} />
              <Route path="/dashboard/debugger" element={<DebuggerPage />} />
              <Route path="/dashboard/tool-logs" element={<ToolLogsPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="h-screen bg-bg-app text-txt-muted flex flex-col items-center justify-center gap-4">
                <span className="text-xl font-semibold text-txt-primary">404 - Page Not Found</span>
                <a href="/" className="text-xs text-accent-primary underline">Return to Home</a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
