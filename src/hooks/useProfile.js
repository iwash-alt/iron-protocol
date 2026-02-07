import { useState, useEffect } from 'react';
import { KEYS, loadJSON, saveJSON } from '../data/storage';

export function useProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const p = loadJSON(KEYS.profile);
    if (p) setProfile(p);
  }, []);

  const saveProfile = (p) => {
    saveJSON(KEYS.profile, p);
    setProfile(p);
  };

  return { profile, saveProfile };
}
