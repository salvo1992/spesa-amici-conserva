
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
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b dark:border-gray-700">
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
                  
                  const getNavColor = () => {
                    switch(item.path) {
                      case '/': return 'text-blue-600 dark:text-blue-400';
                      case '/shopping-list': return 'text-green-600 dark:text-green-400';
                      case '/pantry': return 'text-purple-600 dark:text-purple-400';
                      case '/recipes': return 'text-orange-600 dark:text-orange-400';
                      case '/meal-planning': return 'text-red-600 dark:text-red-400';
                      case '/shared': return 'text-teal-600 dark:text-teal-400';
                      case '/reviews': return 'text-yellow-600 dark:text-yellow-400';
                      case '/settings': return 'text-gray-600 dark:text-gray-400';
                      default: return 'text-gray-600 dark:text-gray-300';
                    }
                  };
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105'
                          : `${getNavColor()} hover:scale-105 hover:bg-white/50 dark:hover:bg-gray-700/50`
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
      <div className="md:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t dark:border-gray-700 fixed bottom-0 left-0 right-0 z-50 shadow-lg">
        <div className="grid grid-cols-4 gap-1 py-2 px-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            const getNavColor = () => {
              switch(item.path) {
                case '/': return isActive ? 'text-blue-600' : 'text-blue-500';
                case '/shopping-list': return isActive ? 'text-green-600' : 'text-green-500';
                case '/pantry': return isActive ? 'text-purple-600' : 'text-purple-500';
                case '/recipes': return isActive ? 'text-orange-600' : 'text-orange-500';
                default: return isActive ? 'text-primary' : 'text-gray-500';
              }
            };
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-3 px-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? `${getNavColor()} bg-gradient-to-t from-primary/10 to-transparent shadow-lg scale-105` 
                    : `${getNavColor()} hover:scale-110 hover:bg-white/50 dark:hover:bg-gray-700/50`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-1 text-center leading-tight font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
        {/* Second row for remaining items */}
        <div className="grid grid-cols-4 gap-1 py-1 px-2 border-t dark:border-gray-700">
          {navItems.slice(4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            const getNavColor = () => {
              switch(item.path) {
                case '/meal-planning': return isActive ? 'text-red-600' : 'text-red-500';
                case '/shared': return isActive ? 'text-teal-600' : 'text-teal-500';
                case '/reviews': return isActive ? 'text-yellow-600' : 'text-yellow-500';
                case '/settings': return isActive ? 'text-gray-600' : 'text-gray-500';
                default: return isActive ? 'text-primary' : 'text-gray-500';
              }
            };
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? `${getNavColor()} bg-gradient-to-t from-primary/10 to-transparent shadow-lg scale-105` 
                    : `${getNavColor()} hover:scale-110 hover:bg-white/50 dark:hover:bg-gray-700/50`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-1 text-center leading-tight font-medium">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-32 md:pb-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export { Layout };
