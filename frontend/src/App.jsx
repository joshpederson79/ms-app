import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Welcome from './pages/onboarding/Welcome.jsx';
import Signup from './pages/onboarding/Signup.jsx';
import Success from './pages/onboarding/Success.jsx';
import Home from './pages/Home.jsx';
import SongsList from './pages/SongsList.jsx';
import SongDetail from './pages/SongDetail.jsx';
import UploadSong from './pages/UploadSong.jsx';
import GigsList from './pages/GigsList.jsx';
import GigDetail from './pages/GigDetail.jsx';
import CreateGig from './pages/CreateGig.jsx';
import Messages from './pages/Messages.jsx';
import Settings from './pages/Settings.jsx';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/app/home' : '/onboarding/invite'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/onboarding/invite" element={<Welcome />} />
      <Route path="/onboarding/signup" element={<Signup />} />
      <Route path="/onboarding/success" element={<Success />} />

      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="songs" element={<SongsList />} />
          <Route path="songs/:id" element={<SongDetail />} />
          <Route path="upload" element={<UploadSong />} />
          <Route path="gigs" element={<GigsList />} />
          <Route path="gigs/create" element={<CreateGig />} />
          <Route path="gigs/:id" element={<GigDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
