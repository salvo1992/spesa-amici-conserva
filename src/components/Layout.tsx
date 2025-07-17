
import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './ui/navigation';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <BottomNavigation />
      <main className="pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
