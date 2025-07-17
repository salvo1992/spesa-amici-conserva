
import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './ui/navigation';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with logo and title */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/7c75a14f-99a4-4250-a4c1-00b33d7be67b.png" 
                alt="Il Vikingo del Web" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Food Manager
                </h1>
                <p className="text-xs text-muted-foreground">Il Vikingo del Web</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <BottomNavigation />
      <main className="pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
