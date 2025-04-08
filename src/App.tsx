
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import AppointmentSuccess from "./pages/AppointmentSuccess";
import NotFound from "./pages/NotFound";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Component to track route changes
const RouteTracker = ({ children }: { children: React.ReactNode }) => {
  useGoogleAnalytics();
  return <>{children}</>;
};

// Define App as a function component
const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouteTracker>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/appointment-success" element={<AppointmentSuccess />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteTracker>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
