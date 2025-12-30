import React from 'react';
import { Sidebar } from './Sidebar';
import { ThemeDemo } from '../components/ui/ThemeDemo';

/**
 * Main layout component with sidebar
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content
 */
export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-primary">
      <Sidebar />
      <main className="ml-64 p-8">
        {children}
      </main>
      {/* Theme demo for development - remove in production */}
      <ThemeDemo />
    </div>
  );
};