// ═══════════════════════════════════════════════════════════════════════
// AUTHENTICATION & PIN LOCKOUT UTILITY (SHA-256 Hashed PINs & Rate Limiting)
// ═══════════════════════════════════════════════════════════════════════

export const hashPassword = async (password) => {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallthrough to fallback
  }

  // Fallback hash for non-HTTPS / HTTP environments where Web Crypto API is restricted
  let hash = 0;
  const str = `saathi_salt_${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `local_hash_${Math.abs(hash).toString(16)}`;
};

export const hashPin = async (pin) => {
  return hashPassword(`__saathi_pin_salt_${pin}`);
};

const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

export const getPinLockoutStatus = () => {
  try {
    const raw = localStorage.getItem('__pin_lockout_state');
    if (!raw) return { locked: false, attemptsLeft: MAX_PIN_ATTEMPTS, remainingSeconds: 0 };
    const { attempts, lockedUntil } = JSON.parse(raw);
    const now = Date.now();

    if (lockedUntil && now < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      return { locked: true, attemptsLeft: 0, remainingSeconds };
    }

    if (lockedUntil && now >= lockedUntil) {
      localStorage.removeItem('__pin_lockout_state');
      return { locked: false, attemptsLeft: MAX_PIN_ATTEMPTS, remainingSeconds: 0 };
    }

    const attemptsLeft = Math.max(0, MAX_PIN_ATTEMPTS - attempts);
    return { locked: false, attemptsLeft, remainingSeconds: 0 };
  } catch {
    return { locked: false, attemptsLeft: MAX_PIN_ATTEMPTS, remainingSeconds: 0 };
  }
};

export const recordFailedPinAttempt = () => {
  try {
    const status = getPinLockoutStatus();
    const currentAttempts = (MAX_PIN_ATTEMPTS - status.attemptsLeft) + 1;

    if (currentAttempts >= MAX_PIN_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem('__pin_lockout_state', JSON.stringify({ attempts: currentAttempts, lockedUntil }));
      return { locked: true, attemptsLeft: 0, remainingSeconds: 30 };
    }

    localStorage.setItem('__pin_lockout_state', JSON.stringify({ attempts: currentAttempts, lockedUntil: null }));
    return { locked: false, attemptsLeft: MAX_PIN_ATTEMPTS - currentAttempts, remainingSeconds: 0 };
  } catch {
    return { locked: false, attemptsLeft: MAX_PIN_ATTEMPTS - 1, remainingSeconds: 0 };
  }
};

export const clearPinLockout = () => {
  localStorage.removeItem('__pin_lockout_state');
};

const getStoredUsers = () => {
  try {
    const usersData = localStorage.getItem('__auth_users');
    return usersData ? JSON.parse(usersData) : {};
  } catch {
    return {};
  }
};

const saveStoredUsers = (users) => {
  localStorage.setItem('__auth_users', JSON.stringify(users));
};

export const getSession = () => {
  try {
    const session = localStorage.getItem('__auth_session');
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

const setSession = (user) => {
  localStorage.setItem('__auth_session', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('__auth_session');
};

export const registerUser = async (username, password) => {
  const cleanUsername = (username || '').trim();
  const normalizedKey = cleanUsername.toLowerCase();

  if (!cleanUsername || cleanUsername.length < 2) {
    throw new Error('Username must be at least 2 characters');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters');
  }

  const users = getStoredUsers();
  if (users[normalizedKey]) {
    throw new Error('Username already exists. Please sign in instead.');
  }

  const hashedPassword = await hashPassword(password);
  users[normalizedKey] = {
    username: cleanUsername,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString()
  };

  saveStoredUsers(users);
  setSession({ username: cleanUsername });
  return { username: cleanUsername };
};

export const loginUser = async (username, password) => {
  const cleanUsername = (username || '').trim();
  const normalizedKey = cleanUsername.toLowerCase();

  if (!cleanUsername || !password) {
    throw new Error('Username and password are required');
  }

  const users = getStoredUsers();
  let user = users[normalizedKey];

  // Also check if matches exact key for backward compatibility
  if (!user && users[username]) {
    user = users[username];
  }

  if (!user) {
    throw new Error('User not found. Check username or tap "Sign Up".');
  }

  const hashedPassword = await hashPassword(password);
  if (user.passwordHash !== hashedPassword) {
    throw new Error('Incorrect password. Please try again.');
  }

  setSession({ username: user.username });
  return { username: user.username };
};

export const loginGuestUser = async () => {
  const guestUser = { username: "Guest" };
  setSession(guestUser);
  return guestUser;
};

export const isAuthenticated = () => {
  return getSession() !== null;
};

export const getCurrentUser = () => {
  return getSession();
};
