// NOTE: ContractService manages HotPocket client initialization and mock mode behavior.
import * as bson from 'bson';
import type { ContractMessage, ContractResponse } from '@/types';

interface Deferred {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

type HPClient = {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  submitContractInput: (data: Uint8Array) => Promise<void>;
  submitContractReadRequest: (data: Uint8Array) => Promise<void>;
  events?: {
    disconnect?: (handler: () => void) => void;
    connectionChange?: (handler: (e: unknown) => void) => void;
    contractOutput?: (handler: (e: { data: Uint8Array }) => void) => void;
    healthEvent?: (handler: (e: unknown) => void) => void;
  };
};

export default class ContractService {
  private static instance: ContractService;
  private client: HPClient | null = null;
  private promises: Map<string, Deferred> = new Map();
  private mockMode = false;

  static getInstance(): ContractService {
    if (!ContractService.instance) ContractService.instance = new ContractService();
    return ContractService.instance;
  }

  async init(): Promise<void> {
    const mock = import.meta.env.VITE_MOCK_MODE === 'true';
    if (mock) {
      this.mockMode = true;
      console.warn('\uD83D\uDD27 Running in MOCK MODE - using simulated HotPocket data');
      return;
    }

    const urlsRaw = import.meta.env.VITE_CONTRACT_URLS;
    if (!urlsRaw) {
      throw new Error('Failed to initialize HotPocket client. Please set VITE_CONTRACT_URLS in your .env file, or set VITE_MOCK_MODE=true for development.');
    }
    const servers = urlsRaw.split(',').map(u => u.trim()).filter(Boolean);
    const hasPlaceholder = servers.some(u => /example|your-hotpocket-server|placeholder/i.test(u));
    if (hasPlaceholder) {
      throw new Error('Please configure valid HotPocket server URLs in .env (VITE_CONTRACT_URLS). Remove placeholder/example URLs or enable VITE_MOCK_MODE=true.');
    }

    const w = window as unknown as { HotPocket?: any };
    const HotPocket = w.HotPocket;
    if (!HotPocket) {
      throw new Error('HotPocket client not found on window. Ensure the HotPocket CDN script is included in index.html before app scripts.');
    }

    try {
      await (window as any).sodium?.ready; // Ensure libsodium is ready
      const userKeyPair = await HotPocket.generateKeys();
      const client: HPClient = await HotPocket.createClient(servers, userKeyPair, { protocol: 'bson' });

      // Attach events safely
      if (!client || !client.events) {
        throw new Error('HotPocket client created but missing required events. Check server availability or enable mock mode (VITE_MOCK_MODE=true).');
      }

      client.events.disconnect?.(() => {
        console.warn('HotPocket disconnected. Reloading to attempt reconnection...');
        setTimeout(() => window.location.reload(), 1000);
      });

      client.events.connectionChange?.((e: unknown) => {
        console.info('HotPocket connectionChange:', e);
      });

      client.events.healthEvent?.((e: unknown) => {
        console.info('HotPocket healthEvent:', e);
      });

      client.events.contractOutput?.((evt: { data: Uint8Array }) => {
        try {
          const response = bson.deserialize(evt.data) as ContractResponse;
          const { promiseId } = response as any;
          if (!promiseId) {
            console.warn('Received contract output without promiseId. Ignored.');
            return;
          }
          const deferred = this.promises.get(promiseId);
          if (!deferred) return;
          if ((response as any).error) {
            deferred.reject(new Error((response as any).error));
          } else {
            deferred.resolve((response as any).success);
          }
          this.promises.delete(promiseId);
        } catch (err) {
          console.error('Failed to deserialize contract output (BSON).', err);
        }
      });

      await client.connect();
      this.client = client;
      console.info('HotPocket client initialized and connected.');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to initialize HotPocket client. ${message}. Verify VITE_CONTRACT_URLS or enable VITE_MOCK_MODE=true.`);
    }
  }

  private getUniqueId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async submitInputToContract<T = unknown>(message: ContractMessage): Promise<T> {
    if (this.mockMode) {
      return this.handleMock<T>(message, true);
    }
    if (!this.client) {
      throw new Error('HotPocket client is not initialized. Call ContractService.init() first.');
    }

    const promiseId = this.getUniqueId();
    const payload: ContractMessage = { ...message, promiseId };
    const data = bson.serialize(payload);

    return new Promise<T>(async (resolve, reject) => {
      this.promises.set(promiseId, { resolve, reject });
      try {
        await this.client!.submitContractInput(data);
      } catch (err) {
        this.promises.delete(promiseId);
        reject(new Error('Failed to submit input to contract. Ensure servers are reachable.'));
      }
    });
  }

  async submitContractReadRequest<T = unknown>(message: ContractMessage): Promise<T> {
    if (this.mockMode) {
      return this.handleMock<T>(message, false);
    }
    if (!this.client) {
      throw new Error('HotPocket client is not initialized. Call ContractService.init() first.');
    }

    const promiseId = this.getUniqueId();
    const payload: ContractMessage = { ...message, promiseId };
    const data = bson.serialize(payload);

    return new Promise<T>(async (resolve, reject) => {
      this.promises.set(promiseId, { resolve, reject });
      try {
        await this.client!.submitContractReadRequest(data);
      } catch (err) {
        this.promises.delete(promiseId);
        reject(new Error('Failed to submit read request to contract. Check connection or enable mock mode.'));
      }
    });
  }

  private async handleMock<T>(message: ContractMessage, isWrite: boolean): Promise<T> {
    await new Promise(r => setTimeout(r, 150));
    console.log(`[MOCK] ${isWrite ? 'WRITE' : 'READ'}:`, message);
    const { Service, Action, Data } = message;

    // In-memory mock state stored in localStorage for realism
    const readJSON = (k: string, f: unknown) => {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; }
    };
    const writeJSON = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

    let milestones = readJSON('__mock_milestones', [
      { id: 'm1', title: 'MVP Release', description: 'Ship initial MVP', targetDate: new Date().toISOString(), amount: 1000, achieved: false, contributors: ['c1', 'c2'] },
      { id: 'm2', title: 'Beta Launch', description: 'Public beta launch', targetDate: new Date(Date.now()+86400000*7).toISOString(), amount: 2000, achieved: false, contributors: ['c2'] }
    ] as any) as any[];
    let contributors = readJSON('__mock_contributors', [
      { id: 'c1', name: 'Alice', wallet: 'rAliceWallet', totalEarned: 0 },
      { id: 'c2', name: 'Bob', wallet: 'rBobWallet', totalEarned: 0 }
    ] as any) as any[];
    let payouts = readJSON('__mock_payouts', [] as any[]) as any[];

    const saveAll = () => { writeJSON('__mock_milestones', milestones); writeJSON('__mock_contributors', contributors); writeJSON('__mock_payouts', payouts); };

    switch (Service) {
      case 'Milestone': {
        if (Action === 'GetMilestones') {
          return milestones as T;
        }
        if (Action === 'CreateMilestone') {
          const p = Data as { title: string; description: string; targetDate: string; amount: number; contributors: string[] };
          const nm = { id: `m${crypto.getRandomValues(new Uint16Array(1))[0]}`, title: p.title, description: p.description, targetDate: p.targetDate, amount: p.amount, achieved: false, contributors: p.contributors };
          milestones.push(nm); saveAll();
          return nm as T;
        }
        if (Action === 'MarkAchieved') {
          const id = Data as string;
          const m = milestones.find(x => x.id === id);
          if (!m) throw new Error('Milestone not found');
          m.achieved = true; saveAll();
          return m as T;
        }
        if (Action === 'ReleaseBonus') {
          const id = Data as string;
          const m = milestones.find(x => x.id === id);
          if (!m) throw new Error('Milestone not found');
          if (!m.achieved) throw new Error('Milestone not achieved yet');
          // Split equally among contributors for mock
          const per = m.contributors.length > 0 ? Math.floor(m.amount / m.contributors.length) : 0;
          const now = new Date().toISOString();
          m.contributors.forEach(cid => {
            payouts.push({ id: `p${crypto.getRandomValues(new Uint16Array(1))[0]}`, milestoneId: id, recipientId: cid, amount: per, date: now });
            const c = contributors.find(cc => cc.id === cid); if (c) c.totalEarned += per;
          });
          saveAll();
          return payouts.filter(p => p.milestoneId === id) as T;
        }
        break;
      }
      case 'Contributor': {
        if (Action === 'GetContributors') {
          return contributors as T;
        }
        break;
      }
      case 'Payout': {
        if (Action === 'GetPayouts') {
          return payouts as T;
        }
        break;
      }
    }

    // Default mock fallback
    return [] as unknown as T;
  }
}
