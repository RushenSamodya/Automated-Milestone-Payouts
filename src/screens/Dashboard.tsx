import React, { useEffect, useMemo, useState } from 'react';
import ApiService from '@/services/api-service';
import Loading from '@/Components/Shared/Loading';
import type { Milestone, Contributor, Payout } from '@/types';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

export default function Dashboard(): JSX.Element {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [contributors, setContributors] = useState<Contributor[] | null>(null);
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, c, p] = await Promise.all([
          ApiService.getInstance().getMilestones(),
          ApiService.getInstance().getContributors(),
          ApiService.getInstance().getPayouts()
        ]);
        setMilestones(m); setContributors(c); setPayouts(p);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      }
    };
    load();
  }, []);

  const totalPayouts = useMemo(() => (payouts ?? []).reduce((sum, p) => sum + p.amount, 0), [payouts]);
  const achievedCount = useMemo(() => (milestones ?? []).filter(m => m.achieved).length, [milestones]);

  if (error) {
    return <div className="card"><p className="text-rose-600">{error}</p></div>;
  }
  if (!milestones || !contributors || !payouts) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome to Milestone Bonus</h2>
        <p className="text-blue-100">Automate milestone-triggered rewards for your contributors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Payouts</p>
              <p className="text-3xl font-bold mt-2">${totalPayouts.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Achieved Milestones</p>
              <p className="text-3xl font-bold mt-2">{achievedCount}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-emerald-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Contributors</p>
              <p className="text-3xl font-bold mt-2">{contributors.length}</p>
            </div>
            <Users className="w-10 h-10 text-indigo-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Recent Payouts</h3>
          <div className="space-y-3">
            {(payouts.slice(-5).reverse()).map(p => (
              <div key={p.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                <div>
                  <p className="font-medium">${p.amount} • Milestone {p.milestoneId}</p>
                  <p className="text-sm text-gray-600">Recipient: {p.recipientId} • {new Date(p.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {payouts.length === 0 && <p className="text-gray-600">No payouts yet.</p>}
          </div>
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Upcoming Milestones</h3>
          <div className="space-y-3">
            {milestones.filter(m => !m.achieved).map(m => (
              <div key={m.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                <div>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-sm text-gray-600">Due {new Date(m.targetDate).toLocaleDateString()} • Total ${m.amount}</p>
                </div>
              </div>
            ))}
            {milestones.filter(m => !m.achieved).length === 0 && <p className="text-gray-600">All milestones achieved!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
