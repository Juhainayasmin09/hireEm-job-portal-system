import React from 'react';
import { Logo } from './Logo';
import { useTheme } from './ThemeContext';

interface NavbarProps {
  role: 'SEEKER' | 'RECRUITER';
  setRole: (role: 'SEEKER' | 'RECRUITER') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  resetSelection: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ role, setRole, activeTab, setActiveTab, onLogout, resetSelection }) => {
  const { theme, toggleTheme } = useTheme();
  
  const handleLogoClick = () => {
    setActiveTab('jobs');
    resetSelection();
  };

  return (
    <nav className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
            <div className="bg-bg rounded-lg p-1">
               <Logo variant="icon" className="h-8 w-8" />
            </div>
            <div className="flex items-baseline">
              <span className="font-bold text-xl tracking-tight text-primary">Hire</span>
              <span className="font-bold text-xl tracking-tight text-accent">Em</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center space-x-8">
            {role === 'SEEKER' && (
              <button 
                onClick={() => { setActiveTab('jobs'); resetSelection(); }}
                className={`${activeTab === 'jobs' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
              >
                Find Jobs
              </button>
            )}
            {role === 'SEEKER' && (
               <button 
               onClick={() => { setActiveTab('profile'); resetSelection(); }}
               className={`${activeTab === 'profile' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
             >
               My Profile
             </button>
            )}
             {role === 'RECRUITER' && (
               <button 
               onClick={() => { setActiveTab('dashboard'); resetSelection(); }}
               className={`${activeTab === 'dashboard' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
             >
               Dashboard
             </button>
            )}
          </div>

          <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-bg text-text-secondary transition-colors" aria-label="Toggle Theme">
               {theme === 'dark' ? (
                 <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
               ) : (
                 <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
               )}
             </button>

             {/* Role Switcher for Demo Purposes */}
             <div className="hidden md:flex bg-bg p-1 rounded-lg">
               <button 
                 onClick={() => { setRole('SEEKER'); setActiveTab('jobs'); resetSelection(); }}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${role === 'SEEKER' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
               >
                 Seeker
               </button>
               <button 
                 onClick={() => { setRole('RECRUITER'); setActiveTab('dashboard'); resetSelection(); }}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${role === 'RECRUITER' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
               >
                 Recruiter
               </button>
             </div>
             
             <button onClick={onLogout} className="text-sm font-medium text-text-secondary hover:text-red-600 transition-colors">
               Logout
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};