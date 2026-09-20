import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import api from '../../utils/api.js';

export const INVITE_KEY = 'ms_invite_code';

export default function Welcome() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/check-invite', { invite_code: code });
      if (!data.valid) return setError('That invite code is not valid.');
      sessionStorage.setItem(INVITE_KEY, code);
      navigate('/onboarding/signup');
    } catch (err) {
      // A response means the API was reached but rejected the request; no response means network, CORS or a sleeping server.
      setError(
        err.response
          ? `The server returned an error (${err.response.status}). Check the API URL and try again.`
          : 'Could not reach the server. If it has been idle, wait up to a minute for it to wake up, then try again.'
      );
    }
  };

  return (
    <form className="page stack" onSubmit={onSubmit}>
      <h1 style={{ letterSpacing: '2px' }}>Moonshine Saints</h1>
      <Input label="Invite code" name="invite" value={code} onChange={(e) => setCode(e.target.value)} error={error} />
      <Button type="submit" disabled={!code.trim()}>Continue</Button>
      <p className="muted">Don't have a code? Contact your band leader.</p>
    </form>
  );
}
