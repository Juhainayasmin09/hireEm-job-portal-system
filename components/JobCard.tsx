import React from 'react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  isRecommended?: boolean;
  matchScore?: number;
  matchReason?: string;
  onApply: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, isRecommended, matchScore, matchReason, onApply }) => {
  // Generate a consistent gradient based on the company name for fallback
  const getFallbackGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hues = [210, 200, 220, 190, 230]; // Corporate hues (blues, cyans, purples)
    const hue = hues[hash % hues.length];
    return `linear-gradient(135deg, hsl(${hue}, 40%, 30%), hsl(${hue}, 30%, 20%))`;
  };

  return (
    <div 
      className={`group relative bg-surface rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer ${isRecommended ? 'border-accent/50 ring-1 ring-accent/30' : 'border-border shadow-sm'}`}
      onClick={() => onApply(job)}
    >
      
      {/* Job Image Header - 16:9 Aspect Ratio */}
      <div className="w-full aspect-video bg-bg relative overflow-hidden">
        {job.imageUrl ? (
          <div className="absolute inset-0">
             <img 
              src={job.imageUrl} 
              alt={`${job.title} at ${job.company}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
              loading="lazy"
            />
            {/* Gradient Overlay for Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
          </div>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center relative"
            style={{ background: getFallbackGradient(job.company) }}
          >
             <span className="text-4xl font-bold text-white/10 select-none tracking-tighter">{job.company.substring(0, 2).toUpperCase()}</span>
             <div className="absolute inset-0 bg-black/10"></div>
          </div>
        )}
        
        {/* Company Badge Overlay */}
        <div className="absolute bottom-3 left-4 z-10">
           <div className="bg-surface/90 backdrop-blur-md px-3 py-1 rounded-md border border-border/50 shadow-sm">
             <span className="text-xs font-bold text-text-primary tracking-wide uppercase">{job.company}</span>
           </div>
        </div>
      </div>

      {isRecommended && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1 z-10 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {matchScore}% Match
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors leading-tight line-clamp-2">{job.title}</h3>
        </div>

        <div className="flex items-center gap-3 text-sm text-text-muted mb-4">
           <span className="flex items-center gap-1 bg-bg px-2 py-0.5 rounded text-xs border border-border">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             {job.location}
           </span>
           <span className="flex items-center gap-1 bg-bg px-2 py-0.5 rounded text-xs border border-border">
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {job.salaryRange}
           </span>
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary ml-auto">
            {job.type}
          </span>
        </div>

        <p className="text-text-secondary text-sm mb-5 line-clamp-3 leading-relaxed">
          {job.description}
        </p>

        {isRecommended && matchReason && (
          <div className="mb-4 p-3 bg-accent/10 rounded-lg text-xs text-primary border border-accent/20 animate-fade-in delay-100 flex gap-2 items-start">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{matchReason}</span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {job.requirements.slice(0, 3).map((req, i) => (
              <span key={i} className="text-xs bg-bg border border-border text-text-secondary px-2 py-1 rounded-full">
                {req}
              </span>
            ))}
            {job.requirements.length > 3 && (
              <span className="text-xs text-text-muted px-2 py-1">+{job.requirements.length - 3}</span>
            )}
          </div>

          <button 
            className="w-full py-2.5 rounded-lg font-medium text-sm bg-surface border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm hover:shadow-md"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};