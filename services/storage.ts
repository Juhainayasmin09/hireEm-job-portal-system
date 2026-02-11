import { Job, JobType, UserProfile, Application } from '../types';

const USERS_KEY = 'hireem_users';
const JOBS_KEY = 'hireem_jobs';
const CURRENT_USER_KEY = 'hireem_current_user';
const APPLICATIONS_KEY = 'hireem_applications';

// Mock Data to seed the "database" with realistic cover images
const INITIAL_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Solutions',
    location: 'Remote',
    type: JobType.FULL_TIME,
    salaryRange: '$120k - $160k',
    description: 'We are looking for an experienced React developer to lead our frontend team. You will be responsible for architecture, code quality, and mentoring junior devs.\n\nKey Responsibilities:\n• Architect scalable frontend solutions using React and TypeScript\n• specific optimizations for performance and accessibility\n• Mentor junior developers and conduct code reviews\n• Collaborate with product and design teams',
    requirements: ['React', 'TypeScript', 'Tailwind', 'Node.js'],
    postedAt: '2024-05-15',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200' // Code on screen
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Creative Gaps',
    location: 'New York, NY',
    type: JobType.FULL_TIME,
    salaryRange: '$90k - $130k',
    description: 'Join our design team to create beautiful and functional user experiences. Proficiency in Figma and a strong portfolio are musts.',
    requirements: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
    postedAt: '2024-05-18',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1200' // Designer desk
  },
  {
    id: '3',
    title: 'Backend Developer',
    company: 'DataCore',
    location: 'Austin, TX',
    type: JobType.CONTRACT,
    salaryRange: '$60/hr',
    description: 'Need a Python expert to help scale our data ingestion pipeline. Experience with heavy SQL and API design required.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    postedAt: '2024-05-20',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200' // Code/Dark mode
  },
  {
    id: '4',
    title: 'Marketing Specialist',
    company: 'GrowthRocket',
    location: 'London, UK',
    type: JobType.FULL_TIME,
    salaryRange: '£45k - £60k',
    description: 'Drive our growth strategy through paid ads, SEO, and content marketing. You will work closely with the sales team.',
    requirements: ['SEO', 'Google Ads', 'Copywriting', 'Analytics'],
    postedAt: '2024-05-21',
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200' // Team working
  }
];

export const storage = {
  getJobs: (): Job[] => {
    const stored = localStorage.getItem(JOBS_KEY);
    if (!stored) {
      localStorage.setItem(JOBS_KEY, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(stored);
  },

  addJob: (job: Job): Job[] => {
    const jobs = storage.getJobs();
    const newJobs = [job, ...jobs];
    localStorage.setItem(JOBS_KEY, JSON.stringify(newJobs));
    return newJobs;
  },

  // Mock Authentication Logic
  signup: (user: UserProfile & { password: string }) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: any) => u.email === user.email)) {
      throw new Error("User already exists with this email.");
    }
    // Store user
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after signup
    const userToStore = { ...user };
    delete userToStore.password; // Don't store password in current user session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    return userToStore;
  },

  login: (email: string, password: string): UserProfile => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    
    const userToStore = { ...user };
    delete userToStore.password;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
    return userToStore;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getUser: (email: string): UserProfile | undefined => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.find((u: any) => u.email === email);
  },

  updateProfile: (profile: UserProfile) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    // Also update in the main users array
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const index = users.findIndex((u: any) => u.email === profile.email);
    if (index !== -1) {
       users[index] = { ...users[index], ...profile };
       localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  // --- Application Logic ---

  getApplications: (): Application[] => {
    const stored = localStorage.getItem(APPLICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getApplicationsForJob: (jobId: string): Application[] => {
    const stored = localStorage.getItem(APPLICATIONS_KEY);
    const apps: Application[] = stored ? JSON.parse(stored) : [];
    return apps.filter(a => a.jobId === jobId);
  },

  applyToJob: (userId: string, jobId: string): Application => {
    const apps = storage.getApplications();
    
    // Check for duplicate
    if (apps.find(a => a.userId === userId && a.jobId === jobId)) {
      throw new Error("You have already applied for this position.");
    }

    const newApp: Application = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      jobId,
      status: 'APPLIED',
      appliedAt: new Date().toISOString()
    };

    apps.push(newApp);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    return newApp;
  },

  hasApplied: (userId: string, jobId: string): boolean => {
    const apps = storage.getApplications();
    return !!apps.find(a => a.userId === userId && a.jobId === jobId);
  }
};