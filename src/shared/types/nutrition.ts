export interface ProteinSource {
  name: string;
  protein: number;
  icon: string;
}

export interface ProteinLogEntry extends ProteinSource {
  time: string;
}

export interface DailyNutrition {
  water: number;
  protein: number;
  proteinLog: ProteinLogEntry[];
}

export type NutritionHistory = Record<string, DailyNutrition>;
