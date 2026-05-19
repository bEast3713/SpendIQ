import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopAppBar from './TopAppBar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Redirect to onboarding if not complete
  if (profile && !profile.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="bg-background min-h-screen flex text-on-background font-body overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col relative">
        <TopAppBar />
        <div className="p-container-padding flex-1 overflow-y-auto">
          <Outlet />
        </div>

        {/* Mobile Nav Placeholder (Implement if needed) */}
      </main>
    </div>
  );
};

export default Layout;
