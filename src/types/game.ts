export interface UserGameData {
  id: number;
  userId: number;
  coins: number;
  level: number;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameReward {
  id: number;
  habitId: number;
  userId: number;
  coinsEarned: number;
  experienceEarned: number;
  reason: 'habit_completion' | 'streak_bonus' | 'daily_login';
  createdAt: string;
}

export interface CreateGameRewardRequest {
  habitId: number;
  coinsEarned: number;
  experienceEarned: number;
  reason: 'habit_completion' | 'streak_bonus' | 'daily_login';
}

export interface UpdateUserGameDataRequest {
  coins?: number;
  level?: number;
  experience?: number;
} 