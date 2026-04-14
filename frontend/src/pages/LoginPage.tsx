import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { FormField } from '../components/FormField';
import { DEMO_ACCOUNTS } from '../features/auth/demoAccounts';
import type { LoginNavigationState } from '../features/auth/navigation';
import { useCurrentUserQuery, useLoginMutation } from '../features/auth/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserQuery = useCurrentUserQuery();
  const loginMutation = useLoginMutation();
  const locationState = (location.state as LoginNavigationState | null) ?? null;
  const registeredEmail = locationState?.registeredEmail;
  const showRegistrationSuccess = locationState?.registrationSucceeded === true;

  const [email, setEmail] = useState(registeredEmail ?? '');
  const [password, setPassword] = useState('');
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState<string | null>(
    showRegistrationSuccess ? 'Account created. Log in to continue.' : null,
  );

  if (currentUserQuery.data) {
    return <Navigate to="/events" replace />;
  }

  useEffect(() => {
    if (!showRegistrationSuccess) {
      return;
    }

    const preservedState = locationState?.from ? { from: locationState.from } : null;
    navigate(location.pathname, { replace: true, state: preservedState });
  }, [location.pathname, locationState, navigate, showRegistrationSuccess]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginMutation.mutateAsync({ email, password });
    const redirectTo = locationState?.from ?? '/events';
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
        <div className="demo-accounts">
          <span className="field-label">Demo accounts</span>
          <div className="demo-account-actions">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

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

        {registrationSuccessMessage ? <div className="inline-success">{registrationSuccessMessage}</div> : null}

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
