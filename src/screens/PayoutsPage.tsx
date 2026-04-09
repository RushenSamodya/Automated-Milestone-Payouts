import React, { useEffect, useState } from 'react';
import ApiService from '@/services/api-service';
import type { Payout } from '@/types';
import Loading from '@/Components/Shared/Loading';

export default function PayoutsPage(): JSX.Element {
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setPayouts(await ApiService.getInstance().getPayouts());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payouts');
      }
    };
    load();
  }, []);

  if (error) return <div className="card"><p className="text-rose-600">{error}</p></div>;
  if (!payouts) return <Loading />;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Payouts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="p-2">ID</th>
              <th className="p-2">Milestone</th>
              <th className="p-2">Recipient</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id} className="border-t border-gray-200">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.milestoneId}</td>
                <td className="p-2">{p.recipientId}</td>
                <td className="p-2">${p.amount.toLocaleString()}</td>
                <td className="p-2">{new Date(p.date).toLocaleString()}</td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-gray-600">No payouts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
