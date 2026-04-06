import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { FormField } from '../components/FormField';
import { useCurrentUserQuery, useRegisterMutation } from '../features/auth/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const registerMutation = useRegisterMutation();

  const [name, setName] = useState('New Student');
  const [email, setEmail] = useState('new.student@example.com');
  const [password, setPassword] = useState('Password123!');

  if (currentUserQuery.data) {
    return <Navigate to="/events" replace />;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await registerMutation.mutateAsync({ name, email, password });
    navigate('/login');
  };

  return (
    <section className="auth-grid">
      <div className="panel">
        <p className="eyebrow">Iteration 1</p>
        <h1>Create account</h1>
        <p className="muted">
          Registration creates a real user in the auth service. Login is still a separate step because the JWT cookie is
          issued only by the login endpoint.
        </p>
      </div>

      <form className="panel form-panel" onSubmit={submit}>
        <FormField label="Name" htmlFor="register-name">
          <input id="register-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
        </FormField>

        <FormField label="Email" htmlFor="register-email">
          <input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </FormField>

        <FormField label="Password" htmlFor="register-password" hint="Minimum 8 characters">
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </FormField>

        {registerMutation.error instanceof ApiError ? (
          <div className="inline-error">{registerMutation.error.message}</div>
        ) : null}

        <button className="button button-primary" disabled={registerMutation.isPending} type="submit">
          {registerMutation.isPending ? 'Creating account...' : 'Register'}
        </button>

        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}

