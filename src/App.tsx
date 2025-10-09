import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layouts/DashboardLayout";

import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import EditInvoice from "./pages/EditInvoice";
import ViewInvoice from "./pages/ViewInvoice";
import Invoices from "./pages/Invoices";
import Clients from "./pages/Clients";
import Templates from "./pages/Templates";
import Profile from "./pages/Profile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="create-invoice" element={<CreateInvoice />} />
              <Route path="edit-invoice/:id" element={<EditInvoice />} />
              <Route path="view-invoice/:id" element={<ViewInvoice />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="clients" element={<Clients />} />
              <Route path="templates" element={<Templates />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Legacy Routes - Redirect to new /app/* */}
            {["/dashboard", "/create-invoice", "/invoices", "/clients", "/templates", "/profile"].map((path) => (
              <Route
                key={path}
                path={path}
                element={<Navigate to={`/app${path}`} replace />}
              />
            ))}

            {/* Optional legacy landing */}
            <Route path="/legacy" element={<Index />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
