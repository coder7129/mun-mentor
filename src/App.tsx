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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewProject />} />
          <Route path="/project/:id" element={<ProjectHome />} />
          <Route path="/project/:id/delegation" element={<Delegation />} />
          <Route path="/project/:id/toolbox" element={<Toolbox />} />
          <Route path="/project/:id/resolutions" element={<Resolutions />} />
          <Route path="/project/:id/outputs" element={<SavedOutputs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
