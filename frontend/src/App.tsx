import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminEventBookingsPage } from './pages/AdminEventBookingsPage';
import { AdminEmailOutboxPage } from './pages/AdminEmailOutboxPage';
import { AdminEventCreatePage } from './pages/AdminEventCreatePage';
import { AdminEventEditPage } from './pages/AdminEventEditPage';
import { AdminEventsPage } from './pages/AdminEventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventsPage } from './pages/EventsPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="/admin/events/new" element={<AdminEventCreatePage />} />
          <Route path="/admin/events/:eventId/edit" element={<AdminEventEditPage />} />
          <Route path="/admin/events/:eventId/bookings" element={<AdminEventBookingsPage />} />
          <Route path="/admin/email-outbox" element={<AdminEmailOutboxPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
