import React, { useState, useEffect } from 'react';
import { Job, JobType, UserProfile, ResumeAnalysisResult } from '../types';
import { Button } from './Button';
import { JobCard } from './JobCard';
import { storage } from '../services/storage';
import { analyzeResumeMatch, generateJobDescription, generateJobCoverImage } from '../services/geminiService';

// Internal Component for Job Posting
const JobForm = ({ onPostJob, onCancel }: { onPostJob: (job: Job) => void, onCancel: () => void }) => {
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
    const imgUrl = await generateJobCoverImage(jobData.title, jobData.company);
    if (imgUrl) {
      setJobData(prev => ({ ...prev, imageUrl: imgUrl }));
    } else {
      alert("Failed to generate image.");
    }
    setIsGeneratingImg(false);
  }

  return (
    <div className="bg-surface shadow-lg rounded-xl overflow-hidden border border-border animate-fade-in">
       <div className="bg-primary px-6 py-4 border-b border-primary-hover flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Post a New Job</h2>
            <p className="text-white/70 text-sm">Create a job listing to find your next hire.</p>
          </div>
          <Button variant="secondary" className="text-xs" onClick={onCancel}>Cancel</Button>
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
  );
};

const RecruiterDashboard = ({ onPostJob }: { onPostJob: (job: Job) => void }) => {
  const [view, setView] = useState<'list' | 'post' | 'applicants'>('list');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<UserProfile[]>([]);
  const [analyzingApplicant, setAnalyzingApplicant] = useState<string | null>(null);
  const [applicantAnalysis, setApplicantAnalysis] = useState<Record<string, ResumeAnalysisResult>>({});

  useEffect(() => {
    setJobs(storage.getJobs());
  }, [view]);

  const handlePost = (job: Job) => {
    onPostJob(job);
    setJobs(storage.getJobs());
    setView('list');
  };

  const viewApplicants = (job: Job) => {
    const apps = storage.getApplicationsForJob(job.id);
    const users: UserProfile[] = [];
    apps.forEach(app => {
      const u = storage.getUser(app.userId);
      if (u) users.push(u);
    });
    setSelectedJob(job);
    setApplicants(users);
    setView('applicants');
    setApplicantAnalysis({}); // Reset analysis when viewing new applicants
  };

  const handleAnalyzeApplicant = async (user: UserProfile) => {
    if (!selectedJob) return;
    setAnalyzingApplicant(user.email);
    const result = await analyzeResumeMatch(user, selectedJob);
    if (result) {
      setApplicantAnalysis(prev => ({ ...prev, [user.email]: result }));
    }
    setAnalyzingApplicant(null);
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
      if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h1 className="text-3xl font-bold text-text-primary">Recruiter Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage your job listings and review applicants.</p>
         </div>
         {view === 'list' && (
           <Button variant="accent" onClick={() => setView('post')} className="shadow-lg">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
             Post New Job
           </Button>
         )}
         {view !== 'list' && (
            <Button variant="secondary" onClick={() => setView('list')}>
              Back to Dashboard
            </Button>
         )}
       </div>

       {view === 'list' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const appCount = storage.getApplicationsForJob(job.id).length;
              return (
                <div key={job.id} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                   <div className="h-32 bg-bg relative overflow-hidden">
                      {job.imageUrl ? (
                        <img src={job.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={job.title} />
                      ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary/20">{job.company.substring(0,2)}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur rounded-lg px-2 py-1 border border-border">
                         <span className="text-xs font-bold text-text-primary">{job.type}</span>
                      </div>
                   </div>
                   <div className="p-5">
                      <h3 className="font-bold text-lg text-text-primary mb-1 line-clamp-1">{job.title}</h3>
                      <p className="text-sm text-text-secondary mb-4">{job.company} • {job.location}</p>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                         <div className="flex items-center gap-1.5">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold">
                              {appCount}
                            </span>
                            <span className="text-xs text-text-secondary font-medium">Applicants</span>
                         </div>
                         <Button variant="outline" className="text-xs py-1.5 h-auto" onClick={() => viewApplicants(job)}>
                           Manage
                         </Button>
                      </div>
                   </div>
                </div>
              );
            })}
            {jobs.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-bg/50">
                 <p className="text-text-muted mb-4">You haven't posted any jobs yet.</p>
                 <Button variant="outline" onClick={() => setView('post')}>Post your first job</Button>
              </div>
            )}
         </div>
       )}

       {view === 'post' && (
         <div className="max-w-3xl mx-auto">
            <JobForm onPostJob={handlePost} onCancel={() => setView('list')} />
         </div>
       )}

       {view === 'applicants' && selectedJob && (
         <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden animate-fade-in">
            <div className="bg-bg border-b border-border p-6">
               <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                 Applicants for <span className="text-primary">{selectedJob.title}</span>
               </h2>
               <p className="text-sm text-text-secondary mt-1">{applicants.length} candidates found</p>
            </div>
            
            <div className="divide-y divide-border">
               {applicants.map((user) => (
                 <div key={user.email} className="p-6 hover:bg-bg/50 transition-colors flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                       <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-text-primary">{user.name}</h3>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                          </div>
                          {applicantAnalysis[user.email] && (
                             <div className={`px-3 py-1 rounded-full border text-sm font-bold flex items-center gap-1 ${getScoreColor(applicantAnalysis[user.email].matchScore)}`}>
                               {applicantAnalysis[user.email].matchScore}% Match
                             </div>
                          )}
                       </div>
                       
                       <p className="text-sm text-text-secondary line-clamp-2 mb-3">{user.bio || "No bio provided."}</p>
                       
                       <div className="flex flex-wrap gap-2 mb-4">
                          {user.skills.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-border/50 text-text-secondary text-xs rounded-md border border-border">
                              {s}
                            </span>
                          ))}
                       </div>

                       {user.resumeFileName && (
                          <div className="flex items-center gap-2 text-xs text-primary font-medium">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                             {user.resumeFileName}
                          </div>
                       )}
                    </div>
                    
                    <div className="lg:w-64 flex flex-col gap-3 border-l border-border pl-0 lg:pl-6 pt-4 lg:pt-0">
                       <Button 
                         variant="accent" 
                         className="w-full justify-between group"
                         onClick={() => handleAnalyzeApplicant(user)}
                         isLoading={analyzingApplicant === user.email}
                       >
                         <span>Analyze Fit</span>
                         <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                       </Button>
                       <Button variant="outline" className="w-full">Message Candidate</Button>
                       
                       {applicantAnalysis[user.email] && (
                          <div className="mt-2 text-xs text-text-secondary space-y-1 bg-bg p-3 rounded-lg border border-border">
                             <p className="font-bold text-text-primary mb-1">AI Insights:</p>
                             <p><span className="font-semibold text-green-600">Strengths:</span> {applicantAnalysis[user.email].strengths.slice(0, 2).join(', ')}</p>
                             <p><span className="font-semibold text-red-500">Missing:</span> {applicantAnalysis[user.email].missingSkills.slice(0, 2).join(', ') || "None"}</p>
                          </div>
                       )}
                    </div>
                 </div>
               ))}
               {applicants.length === 0 && (
                 <div className="p-12 text-center text-text-muted">
                    No applicants yet.
                 </div>
               )}
            </div>
         </div>
       )}
    </div>
  );
};

export default RecruiterDashboard;