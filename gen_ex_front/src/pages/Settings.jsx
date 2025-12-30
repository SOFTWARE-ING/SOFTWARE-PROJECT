import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ThemeGallery } from '../components/ui/ThemeGallery';
import { SettingsSkeleton } from '../components/ui/Skeleton';
import { useTheme } from '../contexts/ThemeContext';
import { User, Palette, Cpu, Database, ChevronRight, Settings as SettingsIcon } from 'lucide-react';

/**
 * Settings page with Bento Box layout and advanced UX
 */
export const Settings = () => {
  const [activeSection, setActiveSection] = useState('appearance');
  const [isLoading, setIsLoading] = useState(true);
  const { currentThemeData } = useTheme();

  // Simulate loading for UX demonstration
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your account' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Themes & display' },
    { id: 'ai', label: 'AI Preferences', icon: Cpu, description: 'Generation settings' },
    { id: 'data', label: 'Data & Storage', icon: Database, description: 'Privacy & data' }
  ];

  const handleSectionChange = (sectionId) => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveSection(sectionId);
      setIsLoading(false);
    }, 300);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Profile Info Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User size={20} className="mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                      <User size={32} className="text-primary" />
                    </div>
                    <div>
                      <Button variant="outline" className="mb-2">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-muted">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Full Name
                      </label>
                      <Input
                        defaultValue="John Doe"
                        className="bg-secondary border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        defaultValue="john.doe@example.com"
                        className="bg-secondary border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Bio
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-primary rounded-xl bg-secondary text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary transition-colors"
                      rows={3}
                      placeholder="Tell us about yourself..."
                      defaultValue="Educator passionate about interactive learning."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Password Change Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      className="bg-secondary border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      className="bg-secondary border-primary"
                    />
                  </div>
                  <Button className="w-full">Update Password</Button>
                </CardContent>
              </Card>

              {/* Account Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">42</div>
                      <div className="text-sm text-muted">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">156</div>
                      <div className="text-sm text-muted">Exercises</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        );

      case 'appearance':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ThemeGallery />
            </motion.div>
          </AnimatePresence>
        );

      case 'ai':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Generation Preferences */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu size={20} className="mr-2" />
                    AI Generation Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-3">
                      Default Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Easy', 'Medium', 'Hard'].map((level) => (
                        <button
                          key={level}
                          className="p-3 border border-primary rounded-xl bg-secondary hover:bg-tertiary transition-colors text-center"
                        >
                          <span className="font-medium text-primary">{level}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-3">
                      Preferred Language
                    </label>
                    <select className="w-full px-3 py-2 border border-primary rounded-xl bg-secondary text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary">
                      <option>English</option>
                      <option>French</option>
                      <option>Spanish</option>
                      <option>German</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Exercise Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: 'Multiple Choice', desc: 'Traditional QCM' },
                    { type: 'Fill in Blank', desc: 'Complete sentences' },
                    { type: 'Open Ended', desc: 'Free responses' }
                  ].map(({ type, desc }) => (
                    <div key={type} className="flex items-center justify-between p-3 border border-primary rounded-xl bg-secondary">
                      <div>
                        <p className="font-medium text-primary">{type}</p>
                        <p className="text-sm text-muted">{desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-accent-primary bg-secondary border-primary rounded focus:ring-accent-primary"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Model Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary">Model</span>
                      <Badge>GPT-4</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary">Creativity</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="70"
                        className="w-20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        );

      case 'data':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database size={20} className="mr-2" />
                    Data Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted">
                    Export all your projects, exercises, and settings for backup or migration.
                  </p>
                  <div className="flex space-x-3">
                    <Button variant="outline">
                      <Database size={16} className="mr-2" />
                      Export JSON
                    </Button>
                    <Button variant="outline">
                      Export CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Storage Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-secondary">Used</span>
                        <span className="text-primary">2.4 GB / 10 GB</span>
                      </div>
                      <div className="w-full bg-tertiary rounded-full h-2">
                        <div className="bg-accent-primary h-2 rounded-full" style={{ width: '24%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">156</div>
                        <div className="text-sm text-muted">Files</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">42</div>
                        <div className="text-sm text-muted">Projects</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="lg:col-span-2 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <SettingsIcon size={32} className="mr-3" />
            Settings
          </h1>
          <p className="text-muted mt-1">
            Manage your account, appearance, and preferences
          </p>
          <div className="mt-2">
            <Badge className="bg-accent-primary/10 text-accent-primary border-accent-primary/20">
              Current Theme: {currentThemeData.name}
            </Badge>
          </div>
        </motion.div>

        {/* Bento Box Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="sticky top-8 glass">
                <CardHeader>
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {sections.map((section, index) => (
                      <motion.button
                        key={section.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                          activeSection === section.id
                            ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                            : 'text-secondary hover:bg-tertiary hover:text-primary border border-transparent'
                        }`}
                      >
                        <div className="flex items-center">
                          <section.icon
                            size={18}
                            className={`mr-3 transition-colors ${
                              activeSection === section.id
                                ? 'text-accent-primary'
                                : 'text-muted group-hover:text-primary'
                            }`}
                          />
                          <div>
                            <div className="font-medium">{section.label}</div>
                            <div className="text-xs text-muted">{section.description}</div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: activeSection === section.id ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight size={16} />
                        </motion.div>
                      </motion.button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SettingsSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSection()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};