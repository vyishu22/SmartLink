import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateUrl from './pages/CreateUrl';
import Analytics from './pages/Analytics';
import AnalyticsOverview from './pages/AnalyticsOverview';
import Profile from './pages/Profile';
import PublicStats from './pages/PublicStats';
import NotFound from './pages/NotFound';
import Expired from './pages/Expired';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/s/:shortCode" element={<PublicStats />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/expired" element={<Expired />} />

        {/* Guest-only routes */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateUrl /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsOverview /></ProtectedRoute>} />
        <Route path="/analytics/:id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>

    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#27272a',
          color: '#f4f4f5',
          border: '1px solid #3f3f46',
          fontSize: '13px',
          borderRadius: '10px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#27272a' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#27272a' } },
        duration: 3500,
      }}
    />
  </AuthProvider>
);

export default App;
