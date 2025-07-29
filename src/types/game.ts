export interface UserGameData {
  id: number;
  userId: number;
  coins: number;
  level: number;
  experience: number;
  food: number;
  toy: number;
  createdAt: string;
  updatedAt: string;
}

export enum RewardType {
  HABIT_COMPLETION = 'HABIT_COMPLETION',
  STREAK_BONUS = 'STREAK_BONUS',
  DAILY_LOGIN = 'DAILY_LOGIN',
}

export interface GameReward {
  id: number;
  habitId: number;
  userId: number;
  coinsEarned: number;
  experienceEarned: number;
  foodEarned: number;
  toyEarned: number;
  rewardType: RewardType;
  createdAt: string;
}
