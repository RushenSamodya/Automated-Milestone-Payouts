import React from 'react';

export default function SettingsPage(): JSX.Element {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <p className="text-gray-600">Configure connection and environment settings in your .env file.</p>
      <ul className="list-disc ml-6 mt-3 text-gray-700">
        <li>VITE_MOCK_MODE=true for development without servers</li>
        <li>VITE_CONTRACT_URLS with comma-separated wss:// URLs for production</li>
      </ul>
    </div>
  );
}
