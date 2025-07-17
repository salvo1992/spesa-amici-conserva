
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ShoppingList from "./pages/ShoppingList";
import Pantry from "./pages/Pantry";
import Recipes from "./pages/Recipes";
import Shared from "./pages/Shared";
import Reviews from "./pages/Reviews";
import SettingsPage from "./pages/Settings";
import MealPlanning from "./pages/MealPlanning";
import NotFound from "./pages/NotFound";
import AuthForm from "./components/AuthForm";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/meal-planning" element={<MealPlanning />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
