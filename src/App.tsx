
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ShoppingList from "./pages/ShoppingList";
import Pantry from "./pages/Pantry";
import Recipes from "./pages/Recipes";
import Shared from "./pages/Shared";
import Reviews from "./pages/Reviews";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Importiamo le API mock per lo sviluppo
import "./lib/mockApi";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/shared" element={<Shared />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
