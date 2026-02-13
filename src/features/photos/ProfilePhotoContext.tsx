import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { loadProfilePhoto, saveProfilePhoto, removeProfilePhoto } from '@/shared/storage';

interface ProfilePhotoContextValue {
  photo: string | null;
  setPhoto: (base64: string) => void;
  clearPhoto: () => void;
}

const ProfilePhotoContext = createContext<ProfilePhotoContextValue | null>(null);

export function ProfilePhotoProvider({ children }: { children: ReactNode }) {
  const [photo, setPhotoState] = useState<string | null>(() => loadProfilePhoto());

  const setPhoto = useCallback((base64: string) => {
    saveProfilePhoto(base64);
    setPhotoState(base64);
  }, []);

  const clearPhoto = useCallback(() => {
    removeProfilePhoto();
    setPhotoState(null);
  }, []);

  return (
    <ProfilePhotoContext.Provider value={{ photo, setPhoto, clearPhoto }}>
      {children}
    </ProfilePhotoContext.Provider>
  );
}

export function useProfilePhoto(): ProfilePhotoContextValue {
  const ctx = useContext(ProfilePhotoContext);
  if (!ctx) throw new Error('useProfilePhoto must be used within ProfilePhotoProvider');
  return ctx;
}
