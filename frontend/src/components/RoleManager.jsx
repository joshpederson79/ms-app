import { useEffect, useState } from 'react';
import Select from './Select.jsx';
import api from '../utils/api.js';
import { ROLE_LABELS } from '../utils/permissions.js';
import { errorMessage } from '../utils/songPayload.js';

// Admin-only: assign each member's role (e.g. promote to Gig Lead).
export default function RoleManager() {
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/users').then(({ data }) => setMembers(data)).catch(() => setMessage('Could not load members.'));
  }, []);

  const changeRole = async (member, role) => {
    setMessage('');
    try {
      await api.patch(`/users/${member.id}/role`, { role });
      setMembers((list) => list.map((m) => (m.id === member.id ? { ...m, role } : m)));
      setMessage(`${member.name} is now ${ROLE_LABELS[role]}.`);
    } catch (err) {
      setMessage(errorMessage(err, 'Could not change that role.'));
    }
  };

  return (
    <section className="stack">
      <h3>Band roles</h3>
      {members.map((m) => (
        <Select key={m.id} label={m.name} value={m.role} onChange={(e) => changeRole(m, e.target.value)}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      ))}
      {message && <span className="muted" role="status">{message}</span>}
    </section>
  );
}
