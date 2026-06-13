export interface UserProfile {
  name: string;
  examType: string;
}

export interface JournalAnalysis {
  emotion: 'Anxiety' | 'Stress' | 'Confidence' | 'Motivation' | 'Frustration' | string;
  stressScore: number; // 1 to 10
  confidenceScore: number; // 1 to 10
  burnoutRisk: 'Low' | 'Medium' | 'High';
  triggers: string[]; // e.g., ["Fear of Failure", "Parent Pressure", "Mock Test Anxiety", "Time Management", "Peer Comparison"]
  insights: string;
  crisisFlagged: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  moodScore: number; // 1 to 10
  text: string;
  analysis?: JournalAnalysis;
}

export interface TriggerFrequency {
  name: string; // trigger category
  value: number; // count
}

export interface EmotionDistribution {
  name: string; // emotion name
  value: number; // percentage/count
}

export interface HiddenTriggerReport {
  insightsOnTriggers: string[];
  rebuildingStrategy: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface MindfulnessExercise {
  title: string;
  type: string;
  duration: string;
  script: string;
  steps: string[];
  tips: string[];
}
