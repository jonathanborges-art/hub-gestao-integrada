import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import ImpersonationBanner from './ImpersonationBanner.jsx';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <ImpersonationBanner />
        <Outlet />
      </main>
    </div>
  );
}
