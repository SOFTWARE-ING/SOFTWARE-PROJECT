import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Settings, BarChart3, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';

/**
 * Sidebar navigation component
 */
export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/', active: location.pathname === '/' },
    { icon: FileText, label: 'Projects', path: '/projects', active: location.pathname === '/projects' },
    { icon: Plus, label: 'New Project', path: '/editor', active: location.pathname === '/editor' },
    { icon: Settings, label: 'Settings', path: '/settings', active: location.pathname === '/settings' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-primary p-6 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accent-primary">GenEx</h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              item.active
                ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                : 'text-secondary hover:bg-tertiary hover:text-primary'
            }`}
          >
            <item.icon size={20} className="mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6 space-y-4">
        <div className="flex justify-center">
          <ThemeSwitcher />
        </div>
        <Button variant="outline" className="w-full glass-card border-primary hover:bg-tertiary">
          Upgrade Plan
        </Button>
      </div>
    </aside>
  );
};;;