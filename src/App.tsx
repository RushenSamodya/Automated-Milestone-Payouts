// NOTE: App bootstraps the client by initializing ContractService (HotPocket or mock mode) and renders the route tree with a global Snackbar.
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/Components/Layout/Layout';
import NotFound from '@/Components/Shared/NotFound';
import Snackbar from '@/Components/Shared/Snackbar';
import Loading from '@/Components/Shared/Loading';
import ContractService from '@/services/contract-service';
import { routes } from '@/routes/routes';

function App(): JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        await ContractService.getInstance().init();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize HotPocket client. Please check configuration.');
      }
    };
    void initializeContract();
  }, []);

  if (error) return (
    <div className="max-w-2xl mx-auto mt-10 card">
      <h2 className="text-xl font-semibold mb-2">Initialization Error</h2>
      <p className="text-rose-600">{error}</p>
      <p className="text-gray-600 mt-2">Tip: Set VITE_MOCK_MODE=true to run without HotPocket servers while developing.</p>
      <Snackbar />
    </div>
  );

  if (!isInitialized) return <Loading />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}> 
          {routes.map(r => (
            <Route key={r.path} path={r.path === '/' ? '' : r.path.replace('/', '')} element={r.element} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Snackbar />
    </>
  );
}

export default App;
