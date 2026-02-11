import React, { useState, useEffect, useRef } from 'react';
import { Job, JobType, UserProfile, Recommendation } from './types';
import { JobCard } from './components/JobCard';
import { JobDetail } from './components/JobDetail';
import { Button } from './components/Button';
import { Auth } from './components/Auth';
import { Logo } from './components/Logo';
import { getJobRecommendations, generateJobDescription, generateJobCoverImage, chatWithAi } from './services/geminiService';
import { storage } from './services/storage';
import { useTheme } from './components/ThemeContext';

// Permanent high-quality hero image representing professional growth
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000";

// --- MAIN APP COMPONENT ---

const Navbar = ({ role, setRole, activeTab, setActiveTab, onLogout, resetSelection }: any) => {
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
            <button 
              onClick={() => { setActiveTab('jobs'); resetSelection(); }}
              className={`${activeTab === 'jobs' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
            >
              Find Jobs
            </button>
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
               onClick={() => { setActiveTab('post-job'); resetSelection(); }}
               className={`${activeTab === 'post-job' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'} border-b-2 px-1 pt-1 text-sm font-medium h-full transition-colors`}
             >
               Post a Job
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
                 onClick={() => { setRole('RECRUITER'); setActiveTab('post-job'); resetSelection(); }}
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

const ProfileSection = ({ profile, setProfile }: { profile: UserProfile, setProfile: (p: UserProfile) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSave = () => {
    storage.updateProfile(tempProfile);
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.pdf', '.doc', '.docx'];

      if (!validExtensions.some(ext => fileName.endsWith(ext))) {
        alert("Please upload a valid resume file (PDF, DOC, or DOCX).");
        e.target.value = ''; // Clear the input
        return;
      }

      setResumeFile(file);
      setTempProfile(prev => ({ ...prev, resumeFileName: file.name }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in">
      <div className="bg-surface shadow-sm rounded-xl overflow-hidden border border-border">
        <div className="bg-bg px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">My Profile</h2>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={tempProfile.name}
                  onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                  className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                />
              ) : (
                <p className="text-text-primary font-medium">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <p className="text-text-primary font-medium py-2">{profile.email}</p>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
             {isEditing ? (
               <textarea 
                 rows={3}
                 value={tempProfile.bio}
                 onChange={e => setTempProfile({...tempProfile, bio: e.target.value})}
                 className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
               />
             ) : (
               <p className="text-text-secondary text-sm">{profile.bio || "No bio added."}</p>
             )}
          </div>

          <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">Skills (comma separated)</label>
             {isEditing ? (
               <input 
                 type="text" 
                 value={tempProfile.skills.join(', ')}
                 onChange={e => setTempProfile({...tempProfile, skills: e.target.value.split(',').map(s => s.trim())})}
                 className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
               />
             ) : (
               <div className="flex flex-wrap gap-2">
                 {profile.skills.length > 0 ? profile.skills.map((skill, i) => (
                   <span key={i} className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">
                     {skill}
                   </span>
                 )) : <span className="text-text-muted text-sm">No skills listed.</span>}
               </div>
             )}
          </div>

          <div>
             <label className="block text-sm font-medium text-text-secondary mb-1">Experience</label>
             {isEditing ? (
               <textarea 
                 rows={4}
                 value={tempProfile.experience}
                 onChange={e => setTempProfile({...tempProfile, experience: e.target.value})}
                 className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
               />
             ) : (
               <p className="text-text-secondary text-sm whitespace-pre-wrap">{profile.experience || "No experience added."}</p>
             )}
          </div>

          <div className="pt-4 border-t border-border">
             <label className="block text-sm font-medium text-text-secondary mb-2">Resume</label>
             {isEditing ? (
               <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-text-secondary
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20"
                  />
                  {resumeFile && <span className="text-green-600 text-xs font-bold">Uploaded!</span>}
               </div>
             ) : (
               <div className="flex items-center gap-2 text-sm text-text-secondary">
                 <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 {profile.resumeFileName ? profile.resumeFileName : "No resume uploaded."}
               </div>
             )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostJobSection = ({ onPostJob }: { onPostJob: (job: Job) => void }) => {
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    type: JobType.FULL_TIME,
    salaryRange: '',
    description: '',
    requirements: '',
    imageUrl: ''
  });
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      ...jobData,
      requirements: jobData.requirements.split(',').map(r => r.trim()),
      postedAt: new Date().toISOString().split('T')[0]
    };
    onPostJob(newJob);
    // Reset
    setJobData({
      title: '',
      company: '',
      location: '',
      type: JobType.FULL_TIME,
      salaryRange: '',
      description: '',
      requirements: '',
      imageUrl: ''
    });
    alert("Job posted successfully!");
  };

  const handleAiGenerateDesc = async () => {
    if (!jobData.title || !jobData.company) {
      alert("Please enter a Job Title and Company Name first.");
      return;
    }
    setIsGeneratingDesc(true);
    const desc = await generateJobDescription(jobData.title, jobData.company, jobData.requirements || "General skills");
    setJobData(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const handleAiGenerateImage = async () => {
    if (!jobData.company || !jobData.title) {
       alert("Please enter a company and title.");
       return;
    }
    setIsGeneratingImg(true);
    // Use the new Role-Aware image generation function
    const imgUrl = await generateJobCoverImage(jobData.title, jobData.company);
    if (imgUrl) {
      setJobData(prev => ({ ...prev, imageUrl: imgUrl }));
    } else {
      alert("Failed to generate image.");
    }
    setIsGeneratingImg(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in">
       <div className="bg-surface shadow-lg rounded-xl overflow-hidden border border-border">
         <div className="bg-primary px-6 py-4 border-b border-primary-hover">
            <h2 className="text-xl font-bold text-white">Post a New Job</h2>
            <p className="text-white/70 text-sm">Create a job listing to find your next hire.</p>
         </div>
         <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Job Title</label>
                 <input 
                   required
                   className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                   value={jobData.title}
                   onChange={e => setJobData({...jobData, title: e.target.value})}
                   placeholder="e.g. Senior Product Manager"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Company</label>
                 <input 
                   required
                   className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                   value={jobData.company}
                   onChange={e => setJobData({...jobData, company: e.target.value})}
                   placeholder="e.g. Acme Corp"
                 />
               </div>
            </div>

            {/* AI Image Generation for Job Post */}
            <div>
               <label className="block text-sm font-medium text-text-secondary mb-2">Job Cover Image</label>
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="h-36 w-full sm:w-64 bg-bg rounded-lg border border-border overflow-hidden flex items-center justify-center relative shadow-inner">
                    {jobData.imageUrl ? (
                      <img src={jobData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="w-8 h-8 mx-auto text-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-xs text-text-muted">No image generated</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                     <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleAiGenerateImage}
                      isLoading={isGeneratingImg}
                      className="text-xs whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      Generate Role-Aware Cover
                    </Button>
                    <p className="text-[10px] text-text-muted max-w-xs leading-tight">
                      AI will analyze the job title to generate a professional, realistic workspace image representing this role.
                    </p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Location</label>
                 <input 
                   required
                   className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                   value={jobData.location}
                   onChange={e => setJobData({...jobData, location: e.target.value})}
                   placeholder="e.g. Remote, NY"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Salary Range</label>
                 <input 
                   className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                   value={jobData.salaryRange}
                   onChange={e => setJobData({...jobData, salaryRange: e.target.value})}
                   placeholder="e.g. $100k - $120k"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                 <select 
                   className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                   value={jobData.type}
                   onChange={e => setJobData({...jobData, type: e.target.value as JobType})}
                 >
                   {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
               </div>
            </div>
            
            <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">Requirements (comma separated)</label>
               <input 
                  required
                  className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                  value={jobData.requirements}
                  onChange={e => setJobData({...jobData, requirements: e.target.value})}
                  placeholder="e.g. React, Node.js, Communication"
                />
            </div>

            <div>
               <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-text-secondary">Description</label>
                 <button 
                   type="button"
                   onClick={handleAiGenerateDesc}
                   disabled={isGeneratingDesc}
                   className="text-xs text-primary hover:text-accent font-medium flex items-center gap-1 disabled:opacity-50"
                 >
                   <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                   {isGeneratingDesc ? "Generating..." : "Generate Description"}
                 </button>
               </div>
               <textarea 
                  required
                  rows={5}
                  className="w-full rounded-lg border-input-border bg-input-bg text-text-primary border px-3 py-2 text-sm focus:ring-2 focus:ring-focus focus:border-focus"
                  value={jobData.description}
                  onChange={e => setJobData({...jobData, description: e.target.value})}
                  placeholder="Describe the role..."
                />
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">Post Job</Button>
            </div>
         </form>
       </div>
    </div>
  );
};

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
    setActiveTab('jobs');
    
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
    setActiveTab('jobs');
    setSelectedJob(null);
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

      {activeTab === 'profile' && role === 'SEEKER' && (
        <ProfileSection profile={currentUser} setProfile={setCurrentUser} />
      )}

      {activeTab === 'post-job' && role === 'RECRUITER' && (
        <PostJobSection onPostJob={handlePostJob} />
      )}

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