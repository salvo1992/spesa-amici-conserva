
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import ShoppingList from '@/pages/ShoppingList';
import Pantry from '@/pages/Pantry';
import Recipes from '@/pages/Recipes';
import MealPlanning from '@/pages/MealPlanning';
import Shared from '@/pages/Shared';
import Reviews from '@/pages/Reviews';
import Settings from '@/pages/Settings';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
import CookieBanner from '@/components/CookieBanner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/pantry" element={<Pantry />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/meal-planning" element={<MealPlanning />} />
                <Route path="/shared" element={<Shared />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <CookieBanner />
            <Toaster />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
