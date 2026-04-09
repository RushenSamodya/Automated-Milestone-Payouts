import React from 'react';
import Dashboard from '@/screens/Dashboard';
import MilestonesPage from '@/screens/MilestonesPage';
import ContributorsPage from '@/screens/ContributorsPage';
import PayoutsPage from '@/screens/PayoutsPage';
import SettingsPage from '@/screens/SettingsPage';

export const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/milestones', element: <MilestonesPage /> },
  { path: '/contributors', element: <ContributorsPage /> },
  { path: '/payouts', element: <PayoutsPage /> },
  { path: '/settings', element: <SettingsPage /> }
];
