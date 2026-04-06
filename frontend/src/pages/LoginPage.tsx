import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { FormField } from '../components/FormField';
import { useCurrentUserQuery, useLoginMutation } from '../features/auth/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserQuery = useCurrentUserQuery();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('Password123!');

  if (currentUserQuery.data) {
    return <Navigate to="/events" replace />;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginMutation.mutateAsync({ email, password });
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/events';
    navigate(redirectTo);
  };

  return (
    <section className="auth-grid">
      <div className="panel">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in</h1>
        <p className="muted">Use a seeded demo account or the account you just created.</p>
      </div>

      <form className="panel form-panel" onSubmit={submit}>
        <FormField label="Email" htmlFor="login-email">
          <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </FormField>

        <FormField label="Password" htmlFor="login-password">
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </FormField>

        {loginMutation.error instanceof ApiError ? (
          <div className="inline-error">{loginMutation.error.message}</div>
        ) : null}

        <button className="button button-primary" disabled={loginMutation.isPending} type="submit">
          {loginMutation.isPending ? 'Logging in...' : 'Log in'}
        </button>

        <p className="muted">
          Need an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </section>
  );
}

