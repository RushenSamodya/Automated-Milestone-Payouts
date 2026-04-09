import React, { useEffect, useState } from 'react';
import ApiService from '@/services/api-service';
import type { Milestone } from '@/types';
import Loading from '@/Components/Shared/Loading';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '@/features/snackbar/snackbarSlice';
import { Check, DollarSign } from 'lucide-react';
import CreateMilestoneForm from '@/Components/Forms/CreateMilestoneForm';

export default function MilestonesPage(): JSX.Element {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const load = async () => {
    try {
      setMilestones(await ApiService.getInstance().getMilestones());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    }
  };

  useEffect(() => { load(); }, []);

  const markAchieved = async (id: string) => {
    try {
      await ApiService.getInstance().markMilestoneAchieved(id);
      dispatch(showSnackbar({ message: 'Milestone marked as achieved', type: 'success' }));
      await load();
    } catch (err) {
      dispatch(showSnackbar({ message: err instanceof Error ? err.message : 'Action failed', type: 'error' }));
    }
  };

  const releaseBonus = async (id: string) => {
    try {
      await ApiService.getInstance().releaseBonus(id);
      dispatch(showSnackbar({ message: 'Bonus released to contributors', type: 'success' }));
    } catch (err) {
      dispatch(showSnackbar({ message: err instanceof Error ? err.message : 'Release failed', type: 'error' }));
    }
  };

  if (error) return <div className="card"><p className="text-rose-600">{error}</p></div>;
  if (!milestones) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Create Milestone</h2>
        <CreateMilestoneForm onCreated={load} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.map(m => (
          <div key={m.id} className="card hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">{m.title}</h3>
              <span className={`rounded-full px-3 py-1 text-sm ${m.achieved ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>{m.achieved ? 'Achieved' : 'Pending'}</span>
            </div>
            <p className="text-gray-600 mb-2">{m.description}</p>
            <p className="text-sm text-gray-500">Due {new Date(m.targetDate).toLocaleDateString()}</p>
            <div className="flex items-center gap-2 mt-3 text-gray-700">
              <DollarSign className="w-4 h-4" /> ${m.amount}
            </div>
            <p className="text-sm text-gray-600 mt-2">Contributors: {m.contributors.join(', ') || 'None'}</p>
            <div className="flex items-center gap-3 mt-4">
              {!m.achieved && (
                <button onClick={() => markAchieved(m.id)} className="btn-primary">
                  <Check className="w-4 h-4" /> Mark Achieved
                </button>
              )}
              <button onClick={() => releaseBonus(m.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition">
                <DollarSign className="w-4 h-4" /> Release Bonus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
