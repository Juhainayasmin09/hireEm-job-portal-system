import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { storage } from '../services/storage';

interface ProfileSectionProps {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, setProfile }) => {
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

export default ProfileSection;