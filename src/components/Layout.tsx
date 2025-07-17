
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, ChefHat, Users, Star, Settings, Calendar } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/shopping-list', label: 'Lista Spesa', icon: ShoppingCart },
    { path: '/pantry', label: 'Dispensa', icon: Package },
    { path: '/recipes', label: 'Ricette', icon: ChefHat },
    { path: '/meal-planning', label: 'Piano Alimentare', icon: Calendar },
    { path: '/shared', label: 'Condivise', icon: Users },
    { path: '/reviews', label: 'Recensioni', icon: Star },
    { path: '/settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Food Manager
                </span>
              </Link>
              
              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                  isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export { Layout };
