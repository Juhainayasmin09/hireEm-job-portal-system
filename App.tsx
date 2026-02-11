import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Job, JobType, UserProfile, Recommendation, Application, ResumeAnalysisResult } from './types';
import { JobCard } from './components/JobCard';
import { JobDetail } from './components/JobDetail';
import { Button } from './components/Button';
import { Auth } from './components/Auth';
import { Logo } from './components/Logo';
import { getJobRecommendations, chatWithAi } from './services/geminiService';
import { storage } from './services/storage';
import { useTheme } from './components/ThemeContext';
import { Navbar } from './components/Navbar';

// Lazy load heavy components
const ProfileSection = React.lazy(() => import('./components/ProfileSection'));
const RecruiterDashboard = React.lazy(() => import('./components/RecruiterDashboard'));

// Permanent high-quality hero image representing professional growth
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000";

// Loading Fallback Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="relative w-16 h-16">
       <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
       <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
    </div>
  </div>
);

function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'SEEKER' | 'RECRUITER'>('SEEKER');
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { setTheme } = useTheme(); // Use Theme Hook

  // Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    {role: 'ai', text: 'Hi! I can help you with career advice or job search tips. Ask me anything!'}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load user and jobs on mount
  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setRole(user.role);
    }
    setJobs(storage.getJobs());
  }, []);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Update jobs state when storage changes (simplified, usually need a listener)
  const refreshJobs = () => {
    setJobs(storage.getJobs());
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setRole(user.role);
    // Redirect based on role
    setActiveTab(user.role === 'RECRUITER' ? 'dashboard' : 'jobs');
    
    // Sync theme preference from user profile
    if (user.themePreference) {
      setTheme(user.themePreference);
    }
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setRecommendations([]);
    setIsChatOpen(false);
    setSelectedJob(null);
    // Optionally revert theme to light on logout, or keep last preference
    // Keeping last preference is standard UX for browser sessions
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    window.scrollTo(0, 0);
  };

  const handlePostJob = (newJob: Job) => {
    storage.addJob(newJob);
    refreshJobs();
    // Dashboard handles view switching internally via callback or state update if needed, 
    // but here we just ensure data is fresh.
  };

  const fetchRecommendations = async () => {
    if (!currentUser) return;
    setIsAiLoading(true);
    const result = await getJobRecommendations(currentUser, jobs);
    if (result && result.recommendations) {
      setRecommendations(result.recommendations);
    }
    setIsAiLoading(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
  
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setChatInput('');
    setIsChatLoading(true);
  
    const response = await chatWithAi(userMsg);
    
    setChatMessages(prev => [...prev, {role: 'ai', text: response}]);
    setIsChatLoading(false);
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  // If a job is selected, render the detail view independent of tabs
  if (selectedJob && activeTab === 'jobs') {
    return (
      <div className="min-h-screen bg-bg pb-20 font-inter transition-colors duration-500 relative">
        <Navbar 
          role={role} 
          setRole={setRole} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
          resetSelection={() => setSelectedJob(null)}
        />
        <JobDetail 
          job={selectedJob} 
          currentUser={currentUser} 
          onBack={() => setSelectedJob(null)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-20 font-inter transition-colors duration-200 relative">
      <Navbar 
        role={role} 
        setRole={setRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        resetSelection={() => setSelectedJob(null)}
      />

      <Suspense fallback={<LoadingSpinner />}>
        {activeTab === 'profile' && role === 'SEEKER' && (
          <ProfileSection profile={currentUser} setProfile={setCurrentUser} />
        )}

        {activeTab === 'dashboard' && role === 'RECRUITER' && (
          <RecruiterDashboard onPostJob={handlePostJob} />
        )}
      </Suspense>

      {activeTab === 'jobs' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          
          {/* Permanent Hero Section with Professional Image */}
          <div className="relative rounded-2xl overflow-hidden mb-10 shadow-2xl transition-all duration-500 group isolate">
             {/* Background Image */}
             <div className="absolute inset-0 -z-20">
                <img 
                  src={HERO_IMAGE_URL} 
                  alt="Professional Team Collaboration" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90" 
                />
             </div>
             
             {/* Professional Gradient Overlay: Dark Left -> Transparent Right */}
             <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/30 -z-10"></div>
             
             <div className="relative z-20 px-8 py-16 md:py-24 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="max-w-xl">
                   <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white drop-shadow-sm">
                     {role === 'SEEKER' ? `Shape Your Future, ${currentUser.name.split(' ')[0]}` : 'Find Top Talent Today'}
                   </h1>
                   <p className="text-lg text-white/90 mb-8 font-light leading-relaxed max-w-lg">
                     {role === 'SEEKER' ? 'Discover opportunities that match your potential with our AI-powered career platform.' : 'Post jobs and manage candidates efficiently with intelligent tools designed for modern recruiting.'}
                   </p>
                </div>
                
                {role === 'SEEKER' && (
                  <Button 
                    variant="accent" 
                    onClick={fetchRecommendations}
                    isLoading={isAiLoading}
                    className="px-8 py-4 text-base backdrop-blur-sm transition-transform hover:-translate-y-1 font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Ask AI to Recommend Jobs
                  </Button>
                )}
             </div>
          </div>

          {/* Search Bar */}
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-border mb-10 flex gap-4 transition-all hover:shadow-md">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-input-border rounded-lg leading-5 bg-input-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus sm:text-sm transition-all"
                placeholder="Search by title, company, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Show recommended jobs first if available */}
            {recommendations.length > 0 && searchQuery === '' && (
              <div className="md:col-span-2 lg:col-span-3 mb-4 animate-fade-in">
                 <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                   <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                   </div>
                   AI Top Picks for You
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendations.map((rec, i) => {
                      const job = jobs.find(j => j.id === rec.jobId);
                      if (!job) return null;
                      return (
                        <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                          <JobCard 
                            job={job} 
                            isRecommended={true}
                            matchScore={rec.matchScore}
                            matchReason={rec.reason}
                            onApply={handleViewJob}
                          />
                        </div>
                      );
                    })}
                 </div>
                 <div className="border-b border-border my-10"></div>
              </div>
            )}

            {filteredJobs.length === 0 ? (
               <div className="col-span-full text-center py-20 text-text-muted bg-surface rounded-xl border border-dashed border-border">
                 <p className="text-lg">No jobs found matching your criteria.</p>
               </div>
            ) : (
              filteredJobs
                // Filter out already shown recommended jobs to avoid duplicates if recommendations exist
                .filter(j => searchQuery !== '' || !recommendations.some(r => r.jobId === j.id))
                .map((job, i) => (
                  <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <JobCard job={job} onApply={handleViewJob} />
                  </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* AI Chat Assistant Floating Action Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-primary hover:bg-primary-hover text-white rounded-full shadow-xl flex items-center justify-center transition-all z-50 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-focus/50"
      >
        {isChatOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        )}
      </button>

      {/* AI Chat Modal */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-surface rounded-2xl shadow-2xl border border-border z-50 overflow-hidden flex flex-col h-[500px] animate-fade-in origin-bottom-right">
           {/* Header */}
           <div className="bg-primary p-4 flex items-center gap-3">
              <div className="bg-white/10 p-1.5 rounded-lg">
                <Logo variant="icon" className="h-6 w-6 text-white" />
              </div>
              <div>
                 <h3 className="text-white font-bold text-sm">HireEm Assistant</h3>
                 <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                   <span className="text-white/80 text-xs">Online</span>
                 </div>
              </div>
           </div>
           
           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg">
              {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-border text-text-primary rounded-bl-none shadow-sm'}`}>
                      {msg.text}
                    </div>
                 </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                   <div className="bg-surface border border-border p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                     <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-100"></span>
                     <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
           </div>

           {/* Input */}
           <form onSubmit={handleChatSubmit} className="p-3 bg-surface border-t border-border flex gap-2">
             <input 
               className="flex-1 bg-input-bg border-input-border border rounded-xl px-4 py-2 text-sm text-text-primary focus:ring-2 focus:ring-focus focus:outline-none"
               placeholder="Type a message..."
               value={chatInput}
               onChange={e => setChatInput(e.target.value)}
             />
             <button 
               type="submit" 
               disabled={isChatLoading || !chatInput.trim()}
               className="bg-accent text-white p-2 rounded-xl hover:bg-primary disabled:opacity-50 transition-colors"
             >
               <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
             </button>
           </form>
        </div>
      )}
    </div>
  );
}

export default App;