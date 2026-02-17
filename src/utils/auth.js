// ═══════════════════════════════════════════════════════════════════════
// AUTHENTICATION UTILITY
// ═══════════════════════════════════════════════════════════════════════
// 
// Persistent Login: Session is stored in browser localStorage
// - Same device = automatic login on return (no password needed)
// - Different device = new login required (different localStorage)
// - Sign out = session cleared from localStorage
//

// Simple hash function (not cryptographically secure - for demo purposes)
// In production, use proper hashing libraries
const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Get stored users data
const getStoredUsers = () => {
    try {
        const usersData = localStorage.getItem('__auth_users');
        return usersData ? JSON.parse(usersData) : {};
    } catch {
        return {};
    }
};

// Save users data
const saveStoredUsers = (users) => {
    localStorage.setItem('__auth_users', JSON.stringify(users));
};

// Get current session
export const getSession = () => {
    try {
        const session = localStorage.getItem('__auth_session');
        return session ? JSON.parse(session) : null;
    } catch {
        return null;
    }
};

// Set current session
const setSession = (user) => {
    localStorage.setItem('__auth_session', JSON.stringify(user));
};

// Clear session (logout)
export const logout = () => {
    localStorage.removeItem('__auth_session');
};

// Register new user
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

    // Auto-login after registration
    setSession({ username });
    return { username };
};

// Login user
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

// Check if user is authenticated
export const isAuthenticated = () => {
    return getSession() !== null;
};

// Get current user
export const getCurrentUser = () => {
    return getSession();
};
