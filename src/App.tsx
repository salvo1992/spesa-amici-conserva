import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { Toaster } from '@/components/ui/toaster';
import CookieBanner from '@/components/CookieBanner';

// Import pages
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
import Cookie from '@/pages/Cookie';
import NotFound from '@/pages/NotFound';
import SharedListDetail from '@/pages/SharedListDetail';

const queryClient = new QueryClient();

function LayoutWrapper() {
  return (
    <AuthGuard>
      <Layout>
        <Outlet />
      </Layout>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LayoutWrapper />}>
                <Route index element={<Dashboard />} />
                <Route path="shopping-list" element={<ShoppingList />} />
                <Route path="pantry" element={<Pantry />} />
                <Route path="recipes" element={<Recipes />} />
                <Route path="meal-planning" element={<MealPlanning />} />
                <Route path="shared" element={<Shared />} />
                <Route path="shared/:id" element={<SharedListDetail />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="settings" element={<Settings />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="cookie" element={<Cookie />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
            <CookieBanner />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
