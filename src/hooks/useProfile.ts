import { useEffect, useState } from 'react';
import { KEYS, loadJSON, saveJSON } from '../data/storage';

type Profile = {
  name: string;
  height: number;
  weight: number;
  age: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  days: number;
  health: boolean;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const p = loadJSON<Profile>(KEYS.profile);
    if (p) setProfile(p);
  }, []);

  const saveProfile = (p: Profile) => {
    saveJSON(KEYS.profile, p);
    setProfile(p);
  };

  return { profile, saveProfile };
}
