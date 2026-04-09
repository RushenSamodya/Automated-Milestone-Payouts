import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Users, DollarSign, Settings } from 'lucide-react';

// App shell: provides a consistent layout (header with navigation, main content via <Outlet/>, and footer)
// across all routes. Styling is handled with Tailwind utility classes.
export default function Layout(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Milestone Bonus" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">Milestone Bonus</h1>
              <p className="text-blue-100 text-sm">Automated milestone bonuses for contributors</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={({ isActive }) => `flex items-center gap-2 hover:opacity-90 ${isActive ? 'font-semibold' : ''}`}>
              <Home className="w-4 h-4" /> Dashboard
            </NavLink>
            <NavLink to="/milestones" className={({ isActive }) => `flex items-center gap-2 hover:opacity-90 ${isActive ? 'font-semibold' : ''}`}>
              <DollarSign className="w-4 h-4" /> Milestones
            </NavLink>
            <NavLink to="/contributors" className={({ isActive }) => `flex items-center gap-2 hover:opacity-90 ${isActive ? 'font-semibold' : ''}`}>
              <Users className="w-4 h-4" /> Contributors
            </NavLink>
            <NavLink to="/payouts" className={({ isActive }) => `flex items-center gap-2 hover:opacity-90 ${isActive ? 'font-semibold' : ''}`}>
              <DollarSign className="w-4 h-4" /> Payouts
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-2 hover:opacity-90 ${isActive ? 'font-semibold' : ''}`}>
              <Settings className="w-4 h-4" /> Settings
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600">© {new Date().getFullYear()} Milestone Bonus</div>
      </footer>
    </div>
  );
}
