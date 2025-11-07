import "./global.css";

// Filter out the specific Recharts defaultProps warnings early (both warn and error)
const _origWarn = console.warn.bind(console);
const _origError = console.error.bind(console);
const _filterText = 'Support for defaultProps will be removed from function components';

function _argsToString(args: any[]) {
  try {
    return args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  } catch (e) {
    return String(args[0]);
  }
}

console.warn = (...args: any[]) => {
  try {
    const combined = _argsToString(args);
    if (combined.includes(_filterText) && /(XAxis|YAxis|Bar)/.test(combined)) return;
  } catch (e) {
    // ignore
  }
  return _origWarn(...args);
};

console.error = (...args: any[]) => {
  try {
    const combined = _argsToString(args);
    if (combined.includes(_filterText) && /(XAxis|YAxis|Bar)/.test(combined)) return;
  } catch (e) {
    // ignore
  }
  return _origError(...args);
};

// Additionally attempt to delete defaultProps on the recharts exports if available
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Recharts = require('recharts');
  if (Recharts) {
    try { delete (Recharts as any).XAxis?.defaultProps; } catch (e) {}
    try { delete (Recharts as any).YAxis?.defaultProps; } catch (e) {}
    try { delete (Recharts as any).Bar?.defaultProps; } catch (e) {}
  }
} catch (e) {
  // ignore if recharts not available or require fails
}

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
import Staff from "./pages/Staff";
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
