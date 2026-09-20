import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/onboarding/Login.jsx';
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
import Stage from './pages/Stage.jsx';
import SetlistsList from './pages/SetlistsList.jsx';
import SetlistDetail from './pages/SetlistDetail.jsx';
import Messages from './pages/Messages.jsx';
import MessageThread from './pages/MessageThread.jsx';
import Settings from './pages/Settings.jsx';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/app/home' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<Login />} />
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
          <Route path="gigs/:id/edit" element={<CreateGig />} />
          <Route path="setlists" element={<SetlistsList />} />
          <Route path="setlists/:id" element={<SetlistDetail />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:id" element={<MessageThread />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Stage view is full screen, so it sits outside AppLayout (no header or bottom nav). */}
      <Route element={<ProtectedRoute />}>
        <Route path="/stage/song/:id" element={<Stage kind="song" />} />
        <Route path="/stage/gig/:id/:pos?" element={<Stage kind="gig" />} />
        <Route path="/stage/setlist/:id/:pos?" element={<Stage kind="setlist" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
