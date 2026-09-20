import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [serverError, setServerError] = useState('');

  if (!loading && user) return <Navigate to="/app/home" replace />;

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    try {
      await login(email, password);
      navigate('/app/home');
    } catch (err) {
      // Distinguish a wrong password from an unreachable API (e.g. Render waking from sleep).
      setServerError(
        err.response
          ? err.response.data?.message || 'Could not log in.'
          : 'Could not reach the server. If it has been idle, wait up to a minute for it to wake up, then try again.'
      );
    }
  };

  return (
    <form className="page stack" onSubmit={handleSubmit(onSubmit)}>
      <h1 style={{ letterSpacing: '2px' }}>Moonshine Saints</h1>
      <h2>Log in</h2>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        {...register('email', { required: 'Email is required' })}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        {...register('password', { required: 'Password is required' })}
        error={errors.password?.message}
      />
      {serverError && <span className="error-text" role="alert">{serverError}</span>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Logging in…' : 'Log in'}</Button>
      <p className="muted">New to the band? <Link to="/onboarding/invite">Join with an invite code</Link></p>
    </form>
  );
}
