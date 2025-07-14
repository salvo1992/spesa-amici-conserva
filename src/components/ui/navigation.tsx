
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, BookOpen, Users, Settings, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/shopping-list', icon: ShoppingCart, label: 'Lista Spesa' },
  { path: '/pantry', icon: BookOpen, label: 'Conserve' },
  { path: '/recipes', icon: BookOpen, label: 'Ricette' },
  { path: '/shared', icon: Users, label: 'Condivisioni' },
  { path: '/reviews', icon: Star, label: 'Valutazioni' },
  { path: '/settings', icon: Settings, label: 'Impostazioni' },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
