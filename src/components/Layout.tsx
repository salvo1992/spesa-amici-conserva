
import React from 'react';
import { BottomNavigation } from './ui/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};
