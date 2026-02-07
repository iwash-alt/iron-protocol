import { useState, useEffect } from 'react';
import { KEYS, loadJSON, saveJSON } from '../data/storage';
import { getTodayKey } from '../training/engine';

export function useNutrition(profile) {
  const [todayWater, setTodayWater] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [proteinLog, setProteinLog] = useState([]);
  const [nutritionHistory, setNutritionHistory] = useState({});

  useEffect(() => {
    const nh = loadJSON(KEYS.nutrition);
    if (nh) {
      setNutritionHistory(nh);
      const today = getTodayKey();
      if (nh[today]) {
        setTodayWater(nh[today].water || 0);
        setTodayProtein(nh[today].protein || 0);
        setProteinLog(nh[today].proteinLog || []);
      }
    }
  }, []);

  useEffect(() => {
    if (profile && (todayWater > 0 || todayProtein > 0 || proteinLog.length > 0)) {
      const t = getTodayKey();
      setNutritionHistory(prev => {
        const updated = { ...prev, [t]: { water: todayWater, protein: todayProtein, proteinLog } };
        saveJSON(KEYS.nutrition, updated);
        return updated;
      });
    }
  }, [todayWater, todayProtein, proteinLog, profile]);

  const addWater = () => setTodayWater(w => w + 1);

  const addProtein = (source) => {
    setTodayProtein(p => p + source.protein);
    setProteinLog(l => [...l, {
      ...source,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  return {
    todayWater, setTodayWater,
    todayProtein,
    proteinLog,
    nutritionHistory,
    addWater,
    addProtein,
  };
}
