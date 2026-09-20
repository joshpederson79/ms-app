import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY } from '../utils/api.js';

const AuthContext = createContext(null);
const USER_KEY = 'ms_user';

// The last-known user is kept so the app (and offline stage view) opens instantly, even when the server
// is asleep or there is no signal. It is only trusted while a token exists and is re-verified in the background.
const readCachedUser = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)) : null;
  } catch {
    return null;
  }
};
const cacheUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readCachedUser);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)) && !readCachedUser());

  const storeSession = useCallback(({ token, user: nextUser }) => {
    localStorage.setItem(TOKEN_KEY, token);
    cacheUser(nextUser);
    setUser(nextUser);
  }, []);

  // Refresh on page load: validate the stored token. Only a 401 logs the user out; network errors and
  // server errors keep the cached session so the app still works offline.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    api
      .post('/auth/verify-token')
      .then(({ data }) => {
        cacheUser(data.user);
        setUser(data.user);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          cacheUser(null);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email, password) => storeSession((await api.post('/auth/login', { email, password })).data),
    [storeSession]
  );

  const signup = useCallback(
    async (fields) => storeSession((await api.post('/auth/signup', fields)).data),
    [storeSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    cacheUser(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
