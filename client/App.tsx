import "./global.css";

// Silence noisy Recharts warnings about defaultProps on function components
// These warnings come from a third-party library (recharts) and are safe for now.
// We filter only the specific message to avoid hiding other useful warnings.
const _origWarn = console.warn.bind(console);
const _origError = console.error.bind(console);
const _filterRegex = /Support for defaultProps will be removed from function components/;
console.warn = (...args: any[]) => {
  try {
    const msg = args[0] && (typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]));
    if (msg && _filterRegex.test(msg) && /(XAxis|YAxis)/.test(msg)) return;
  } catch (e) {
    // ignore
  }
  return _origWarn(...args);
};
console.error = (...args: any[]) => {
  try {
    const msg = args[0] && (typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]));
    if (msg && _filterRegex.test(msg) && /(XAxis|YAxis)/.test(msg)) return;
  } catch (e) {
    // ignore
  }
  return _origError(...args);
};

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Login } from "./pages/Login";
import { Gyms } from "./pages/Gyms";
import { Dashboard } from "./pages/Dashboard";
import { GymSetup } from "./pages/GymSetup";
import { Members } from "./pages/Members";
import { MemberPortal } from "./pages/MemberPortal";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to gyms if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return !user ? <>{children}</> : <Navigate to="/gyms" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/gyms" element={
        <ProtectedRoute>
          <Gyms />
        </ProtectedRoute>
      } />
      
      {/* Dashboard Route */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/setup" element={
        <ProtectedRoute>
          <GymSetup />
        </ProtectedRoute>
      } />

      <Route path="/members" element={
        <ProtectedRoute>
          <Members />
        </ProtectedRoute>
      } />

      <Route path="/member-portal" element={<MemberPortal />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/gyms" replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root");
if (container) {
  // Reuse the root across HMR reloads to avoid calling createRoot multiple times
  const globalAny = window as any;
  if (!globalAny.__REACT_ROOT__) {
    globalAny.__REACT_ROOT__ = createRoot(container);
  }
  globalAny.__REACT_ROOT__.render(<App />);
}
