import React, { useState, useEffect } from 'react';
import { Job, UserProfile, ResumeAnalysisResult } from '../types';
import { Button } from './Button';
import { Toast } from './Toast';
import { storage } from '../services/storage';
import { analyzeResumeMatch } from '../services/geminiService';

interface JobDetailProps {
  job: Job;
  currentUser: UserProfile;
  onBack: () => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job, currentUser, onBack }) => {
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Analysis State
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'details' | 'company' | 'analysis'>('details');

  useEffect(() => {
    // Check if user has already applied on mount
    const hasApplied = storage.hasApplied(currentUser.email, job.id);
    setIsApplied(hasApplied);
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [currentUser.email, job.id]);

  const handleApply = async () => {
    if (currentUser.role !== 'SEEKER') {
      setToast({ message: 'Only job seekers can apply for jobs.', type: 'error' });
      return;
    }

    setIsApplying(true);
    setToast(null);

    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      storage.applyToJob(currentUser.email, job.id);
      setIsApplied(true);
      setToast({ message: 'Application submitted successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to apply. Please try again.', type: 'error' });
    } finally {
      setIsApplying(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (currentUser.role !== 'SEEKER') {
        setToast({ message: 'Only job seekers can use resume analysis.', type: 'error' });
        return;
    }

    setIsAnalyzing(true);
    const result = await analyzeResumeMatch(currentUser, job);
    if (result) {
        setAnalysis(result);
        setToast({ message: 'Resume analysis complete!', type: 'success' });
        setActiveTab('analysis');
    } else {
        setToast({ message: 'Failed to analyze resume. Please try again.', type: 'error' });
    }
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20';
      if (score >= 60) return 'text-yellow-600 border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      return 'text-red-600 border-red-600 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="bg-bg min-h-screen animate-fade-in pb-20">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {job.imageUrl ? (
          <img 
            src={job.imageUrl} 
            alt={job.company} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-accent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent"></div>
        
        <div className="absolute top-6 left-4 md:left-8">
           <Button variant="secondary" onClick={onBack} className="bg-white/90 backdrop-blur-sm border-0 text-sm hover:bg-white shadow-lg">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Back to Jobs
           </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">{job.title}</h1>
                <div className="flex items-center gap-3 text-text-secondary flex-wrap">
                  <span className="font-semibold text-primary">{job.company}</span>
                  <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-border"></span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span>{job.location}</span>
                  </div>
                  <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-border"></span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Posted {job.postedAt}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-auto flex flex-col items-end gap-2">
                 <div className="flex gap-2 w-full md:w-auto">
                    {currentUser.role === 'SEEKER' && !isApplied && (
                         <Button 
                            variant="accent"
                            onClick={handleAnalyzeResume}
                            isLoading={isAnalyzing}
                            className="flex-1 md:flex-none shadow-lg shadow-accent/20"
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                            Analyze Match
                         </Button>
                    )}

                     <Button 
                        onClick={handleApply}
                        disabled={isApplied || isApplying || currentUser.role !== 'SEEKER'}
                        isLoading={isApplying}
                        variant={isApplied ? "outline" : "primary"}
                        className={`flex-1 md:flex-none px-8 py-3 text-lg transition-all duration-300 ${
                          isApplied 
                            ? 'border-green-500 text-green-600 bg-green-50/50 hover:bg-green-50 hover:text-green-700 hover:border-green-600 cursor-default ring-0 focus:ring-0' 
                            : 'shadow-lg shadow-primary/20'
                        }`}
                     >
                        {isApplied ? (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            Applied
                          </>
                        ) : (
                           "Apply Now"
                        )}
                     </Button>
                 </div>
                 {currentUser.role !== 'SEEKER' && !isApplied && (
                   <p className="text-text-muted text-xs">Sign in as a seeker to apply</p>
                 )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
               <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                  {job.type}
               </span>
               <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                  {job.salaryRange}
               </span>
               {job.requirements.slice(0, 4).map((req, i) => (
                 <span key={i} className="px-3 py-1 bg-bg border border-border text-text-secondary rounded-full text-sm">
                   {req}
                 </span>
               ))}
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-border mb-6 flex gap-6 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 text-sm font-bold transition-all whitespace-nowrap px-1 relative ${activeTab === 'details' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Job Details
                    {activeTab === 'details' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('company')}
                    className={`pb-3 text-sm font-bold transition-all whitespace-nowrap px-1 relative ${activeTab === 'company' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                    Company Info
                    {activeTab === 'company' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                </button>
                <button 
                    onClick={() => setActiveTab('analysis')}
                    disabled={!analysis && !isAnalyzing}
                    className={`pb-3 text-sm font-bold transition-all whitespace-nowrap px-1 relative ${activeTab === 'analysis' ? 'text-primary' : (!analysis ? 'text-text-muted cursor-not-allowed' : 'text-text-secondary hover:text-text-primary')}`}
                >
                    {isAnalyzing ? 'Analyzing...' : 'AI Match Analysis'}
                    {activeTab === 'analysis' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
                    {analysis && activeTab !== 'analysis' && (
                        <span className="ml-2 px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded-full">Ready</span>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px] animate-fade-in">
                {activeTab === 'details' && (
                    <div className="space-y-8 text-text-secondary leading-relaxed animate-fade-in">
                        <div>
                            <h3 className="text-xl font-bold text-text-primary mb-4">About the Job</h3>
                            <div className="whitespace-pre-line">
                            {job.description}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-text-primary mb-4">Minimum Qualifications</h3>
                            <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                                {job.requirements.map((req, i) => (
                                <li key={i}>{req} experience or equivalent practical knowledge.</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'company' && (
                    <div className="animate-fade-in">
                        <div className="bg-bg rounded-xl p-8 border border-border">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 bg-surface border border-border rounded-xl flex items-center justify-center text-3xl font-bold text-text-muted select-none shadow-sm">
                                    {job.company.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-text-primary">{job.company}</h3>
                                    <p className="text-text-secondary">Innovating for the future.</p>
                                </div>
                            </div>
                            
                            <p className="text-text-secondary mb-8 leading-relaxed max-w-2xl">
                                {job.company} is a leading innovator in the tech space, committed to solving complex problems with elegant solutions. 
                                We value creativity, collaboration, and continuous learning. Join us to build products that impact millions of users worldwide.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-6">
                                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-bold uppercase">Industry</p>
                                        <p className="font-semibold text-text-primary">Technology</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-bold uppercase">Size</p>
                                        <p className="font-semibold text-text-primary">50-200</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-surface rounded-lg border border-border">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-bold uppercase">HQ</p>
                                        <p className="font-semibold text-text-primary">{job.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && analysis && (
                    <div className="bg-surface rounded-xl border border-accent/30 shadow-lg overflow-hidden animate-fade-in">
                        <div className="bg-gradient-to-r from-accent/10 to-transparent p-6 border-b border-accent/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                    AI Resume Match Report
                                </h3>
                                <p className="text-sm text-text-secondary mt-1">Based on your profile skills and experience</p>
                            </div>
                            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${getScoreColor(analysis.matchScore)}`}>
                                <span className="text-2xl font-bold">{analysis.matchScore}%</span>
                                <span className="font-medium opacity-90">{analysis.matchLevel} Match</span>
                            </div>
                        </div>
                        
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-900/30">
                                    <h4 className="text-base font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Key Strengths
                                    </h4>
                                    <ul className="space-y-2">
                                        {analysis.strengths.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <h4 className="text-base font-bold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                        Matched Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.matchingKeywords && analysis.matchingKeywords.length > 0 ? (
                                            analysis.matchingKeywords.map((k, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                                    {k}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-text-muted italic">No direct keyword matches found.</span>
                                        )}
                                    </div>
                                </div>
                                
                                {analysis.missingSkills.length > 0 && (
                                    <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30">
                                        <h4 className="text-base font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Missing Skills
                                        </h4>
                                        <ul className="space-y-2">
                                            {analysis.missingSkills.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="bg-surface p-5 rounded-xl border border-border h-full">
                                <h4 className="text-base font-bold text-accent mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    Improvement Tips
                                </h4>
                                <ul className="space-y-4">
                                    {analysis.improvementTips.map((s, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-text-secondary">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};