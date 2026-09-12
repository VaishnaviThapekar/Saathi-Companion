// ═══════════════════════════════════════════════════════════════════════
// AUTHENTICATION & PIN LOCKOUT UTILITY (SHA-256 Hashed PINs & Rate Limiting)
// ═══════════════════════════════════════════════════════════════════════

export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = getStoredUsers();
  if (users[username]) {
    throw new Error('Username already exists');
  }

  const hashedPassword = await hashPassword(password);
  users[username] = {
    username,
    passwordHash: hashedPassword,
    createdAt: new Date().toISOString()
  };

  saveStoredUsers(users);
  setSession({ username });
  return { username };
};

export const loginUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  const users = getStoredUsers();
  const user = users[username];

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const hashedPassword = await hashPassword(password);
  if (user.passwordHash !== hashedPassword) {
    throw new Error('Invalid username or password');
  }

  setSession({ username });
  return { username };
};

export const isAuthenticated = () => {
  return getSession() !== null;
};

export const getCurrentUser = () => {
  return getSession();
};
