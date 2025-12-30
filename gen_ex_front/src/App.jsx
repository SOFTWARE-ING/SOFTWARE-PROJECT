import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { Settings } from './pages/Settings';
import { ToastContainer } from './components/ui/ToastContainer';
import './index.css';

/**
 * Main App component with routing and theme provider
 */
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </ThemeProvider>
  );
}