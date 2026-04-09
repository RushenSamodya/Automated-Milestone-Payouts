import React, { useEffect, useState } from 'react';
import ApiService from '@/services/api-service';
import type { Contributor } from '@/types';
import Loading from '@/Components/Shared/Loading';
import { Users } from 'lucide-react';

export default function ContributorsPage(): JSX.Element {
  const [contributors, setContributors] = useState<Contributor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setContributors(await ApiService.getInstance().getContributors());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contributors');
      }
    };
    load();
  }, []);

  if (error) return <div className="card"><p className="text-rose-600">{error}</p></div>;
  if (!contributors) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Contributors</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contributors.map(c => (
          <div key={c.id} className="card">
            <h3 className="text-lg font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-600">Wallet: {c.wallet}</p>
            <p className="mt-2 text-gray-700">Total Earned: ${c.totalEarned.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
