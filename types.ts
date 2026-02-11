export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  REMOTE = 'Remote',
  INTERNSHIP = 'Internship'
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryRange: string;
  description: string;
  requirements: string[];
  postedAt: string;
  imageUrl?: string; // New field for AI generated images
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'SEEKER' | 'RECRUITER';
  bio?: string;
  skills: string[];
  experience: string;
  resumeFileName?: string;
  password?: string; // Added for mock auth
  themePreference?: 'light' | 'dark'; // Persisted theme preference
}

export interface Application {
  id: string;
  jobId: string;
  userId: string; // Using email as ID for simplicity in this mock
  status: 'APPLIED' | 'REVIEWING' | 'REJECTED' | 'OFFERED';
  appliedAt: string;
}

export interface Recommendation {
  jobId: string;
  matchScore: number;
  reason: string;
}

export interface AiRecommendationResponse {
  recommendations: Recommendation[];
}

export interface ResumeAnalysisResult {
  matchScore: number;
  matchLevel: 'High' | 'Medium' | 'Low';
  strengths: string[];
  missingSkills: string[];
  matchingKeywords: string[]; // New field for explicit matches
  improvementTips: string[];
}