// NOTE: ApiService provides typed methods for Milestone/Contributor/Payout operations and delegates HotPocket I/O to ContractService. Safe to use in MOCK MODE.
import ContractService from '@/services/contract-service';
import type { Milestone, Contributor, Payout } from '@/types';

export default class ApiService {
  private static instance: ApiService;
  static getInstance(): ApiService {
    if (!ApiService.instance) ApiService.instance = new ApiService();
    return ApiService.instance;
  }

  // Milestones
  async getMilestones(): Promise<Milestone[]> {
    try {
      return await ContractService.getInstance().submitContractReadRequest<Milestone[]>({
        Service: 'Milestone',
        Action: 'GetMilestones',
        Data: null
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to load milestones: ${msg}`);
    }
  }

  async createMilestone(payload: { title: string; description: string; targetDate: string; amount: number; contributors: string[] }): Promise<Milestone> {
    try {
      return await ContractService.getInstance().submitInputToContract<Milestone>({
        Service: 'Milestone',
        Action: 'CreateMilestone',
        Data: payload
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to create milestone: ${msg}`);
    }
  }

  async markMilestoneAchieved(milestoneId: string): Promise<Milestone> {
    try {
      return await ContractService.getInstance().submitInputToContract<Milestone>({
        Service: 'Milestone',
        Action: 'MarkAchieved',
        Data: milestoneId
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to mark milestone as achieved: ${msg}`);
    }
  }

  async releaseBonus(milestoneId: string): Promise<Payout[]> {
    try {
      return await ContractService.getInstance().submitInputToContract<Payout[]>({
        Service: 'Milestone',
        Action: 'ReleaseBonus',
        Data: milestoneId
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to release bonus: ${msg}`);
    }
  }

  // Contributors
  async getContributors(): Promise<Contributor[]> {
    try {
      return await ContractService.getInstance().submitContractReadRequest<Contributor[]>({
        Service: 'Contributor',
        Action: 'GetContributors',
        Data: null
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to load contributors: ${msg}`);
    }
  }

  // Payouts
  async getPayouts(): Promise<Payout[]> {
    try {
      return await ContractService.getInstance().submitContractReadRequest<Payout[]>({
        Service: 'Payout',
        Action: 'GetPayouts',
        Data: null
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to load payouts: ${msg}`);
    }
  }
}
