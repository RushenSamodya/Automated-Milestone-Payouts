export interface Contributor {
  id: string;
  name: string;
  wallet: string;
  totalEarned: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string; // ISO
  amount: number; // total bonus amount for this milestone
  achieved: boolean;
  contributors: string[]; // contributor ids
}

export interface Payout {
  id: string;
  milestoneId: string;
  recipientId: string;
  amount: number;
  date: string; // ISO
}

export interface ContractSuccess<T = unknown> { success: T; promiseId: string }
export interface ContractError { error: string; promiseId: string }
export type ContractResponse<T = unknown> = ContractSuccess<T> | ContractError;

export type ContractMessage = {
  Service: 'Milestone' | 'Contributor' | 'Payout';
  Action: string;
  Data: unknown;
  promiseId?: string;
};
