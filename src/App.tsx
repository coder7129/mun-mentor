import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectHome from "./pages/ProjectHome";
import Delegation from "./pages/Delegation";
import Toolbox from "./pages/Toolbox";
import Resolutions from "./pages/Resolutions";
import SavedOutputs from "./pages/SavedOutputs";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <ProjectHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:id/delegation"
            element={
              <ProtectedRoute>
                <Delegation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:id/toolbox"
            element={
              <ProtectedRoute>
                <Toolbox />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:id/resolutions"
            element={
              <ProtectedRoute>
                <Resolutions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/project/:id/outputs"
            element={
              <ProtectedRoute>
                <SavedOutputs />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
