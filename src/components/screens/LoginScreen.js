import { useState, useEffect } from "react";
import { loginUser, registerUser, loginGuestUser } from "../../utils/auth";

// ═══════════════════════════════════════════════════════════════════════
// ENHANCED LOGIN & AUTHENTICATION SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function LoginScreen({ onLoginSuccess, Icon }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState(() => {
        try {
            return localStorage.getItem("saathi_remembered_user") || "";
        } catch {
            return "";
        }
    });
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(() => {
        try {
            return localStorage.getItem("saathi_remember_me") === "true";
        } catch {
            return true;
        }
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        try {
            if (rememberMe && username.trim()) {
                localStorage.setItem("saathi_remembered_user", username.trim());
                localStorage.setItem("saathi_remember_me", "true");
            } else if (!rememberMe) {
                localStorage.removeItem("saathi_remembered_user");
                localStorage.setItem("saathi_remember_me", "false");
            }
        } catch (e) {}
    }, [username, rememberMe]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await loginUser(username, password);
            } else {
                res = await registerUser(username, password);
            }

            setPassword("");
            onLoginSuccess(res);
        } catch (err) {
            setError(err.message || "Authentication failed. Please check details.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const guest = await loginGuestUser();
            onLoginSuccess(guest);
        } catch (err) {
            setError("Failed to start guest session.");
        } finally {
            setLoading(false);
        }
    };

    const fillDemoAccount = () => {
        setIsLogin(true);
        setUsername("Alex");
        setPassword("saathi123");
        setError("");
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setPassword("");
    };

    return (
        <div style={styles.container} className="fade-in">
            {/* Background Ambient Glow Orbs */}
            <div className="ambient-glow-orb-1" />
            <div className="ambient-glow-orb-2" />

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.iconWrapper}>
                        {Icon ? <Icon name="heart" size={54} color="#ff9a76" /> : <span style={{ fontSize: 54 }}>❤️</span>}
                    </div>
                    <h1 style={styles.title}>Your Companion</h1>
                    <p style={styles.subtitle}>Your Personal AI Companion & Growth Vault</p>
                </div>
            </div>

            {/* Form Card */}
            <div style={styles.card} className="glass">
                <h2 style={styles.formTitle}>
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p style={styles.formSubtitle}>
                    {isLogin
                        ? "Sign in to access your private companion vault"
                        : "Join AI Companion to start tracking habits & thoughts"}
                </p>

                {/* Quick Demo Pre-fill Pill */}
                <div style={styles.demoBar}>
                    <span style={{ fontSize: 11, color: "rgba(139, 126, 116, 0.6)", fontWeight: 600 }}>Quick Test:</span>
                    <button type="button" onClick={fillDemoAccount} style={styles.demoPill}>
                        👤 Try Demo Account (Alex)
                    </button>
                </div>

                {error && (
                    <div style={styles.errorBox}>
                        <div style={styles.errorIcon}>⚠️</div>
                        <p style={styles.errorText}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Username Input */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username (e.g. Alex)"
                            style={styles.input}
                            disabled={loading}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                style={styles.passwordInput}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.togglePasswordBtn}
                                disabled={loading}
                                title={showPassword ? "Hide Password" : "Show Password"}
                            >
                                {showPassword ? "🙈 Hide" : "👁️ Show"}
                            </button>
                        </div>
                        {!isLogin && (
                            <p style={styles.passwordHint}>
                                ℹ️ Minimum 4 characters required
                            </p>
                        )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "-8px 0 4px" }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                        />
                        <label htmlFor="rememberMe" style={{ fontSize: 12, color: "rgba(139, 126, 116, 0.75)", cursor: "pointer", userSelect: "none" }}>
                            Remember username on this device
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={{
                            ...styles.submitBtn,
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : isLogin ? "Sign In to Vault 🔒" : "Create My Account 🚀"}
                    </button>
                </form>

                {/* Guest Quick Entry */}
                <button
                    type="button"
                    onClick={handleGuestLogin}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "11px 0",
                        borderRadius: "12px",
                        background: "rgba(168, 230, 207, 0.25)",
                        border: "1.5px solid rgba(168, 230, 207, 0.5)",
                        color: "#2d6a4f",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: loading ? "not-allowed" : "pointer",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                    }}
                >
                    ⚡ Continue as Guest (No Password Required)
                </button>

                {/* Toggle Form Mode */}
                <div style={styles.toggleSection}>
                    <p style={styles.toggleText}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={toggleMode}
                            style={styles.toggleBtn}
                            disabled={loading}
                        >
                            {isLogin ? "Sign Up Free" : "Sign In"}
                        </button>
                    </p>
                </div>

            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <p style={styles.footerText}>
                    🔒 100% Local Device Storage • SHA-256 Encryption • Private & Offline First
                </p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fef3e2 0%, #fde8f4 50%, #e8f5e9 100%)",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden"
    },
    header: {
        display: "flex",
        justifyContent: "center",
        paddingTop: "32px",
        paddingBottom: "16px",
    },
    logoSection: {
        textAlign: "center",
        color: "#8b7e74",
    },
    iconWrapper: {
        marginBottom: "16px",
        display: "flex",
        justifyContent: "center",
    },
    title: {
        fontSize: "34px",
        fontWeight: "700",
        margin: "0 0 6px 0",
        color: "#5a4a42",
        fontFamily: "'Crimson Text', serif",
        fontStyle: "italic",
    },
    subtitle: {
        fontSize: "14px",
        opacity: 0.85,
        margin: 0,
        color: "rgba(139, 126, 116, 0.75)",
        fontWeight: 500
    },
    card: {
        borderRadius: "24px",
        padding: "32px 28px",
        maxWidth: "420px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box"
    },
    formTitle: {
        fontSize: "22px",
        fontWeight: "700",
        margin: "0 0 6px 0",
        color: "#5a4a42",
        fontFamily: "'Crimson Text', serif",
        fontStyle: "italic",
    },
    formSubtitle: {
        fontSize: "13px",
        color: "rgba(139, 126, 116, 0.65)",
        margin: "0 0 16px 0",
        lineHeight: 1.5
    },
    demoBar: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 18,
        background: "rgba(255, 195, 160, 0.15)",
        padding: "6px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255, 195, 160, 0.3)"
    },
    demoPill: {
        background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
        border: "none",
        color: "#fff",
        fontSize: "11px",
        fontWeight: "700",
        padding: "4px 10px",
        borderRadius: "10px",
        cursor: "pointer"
    },
    errorBox: {
        background: "rgba(255, 154, 118, 0.15)",
        border: "1px solid rgba(255, 154, 118, 0.35)",
        borderRadius: "12px",
        padding: "10px 14px",
        marginBottom: "18px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
    },
    errorIcon: {
        fontSize: "16px",
        flexShrink: 0,
    },
    errorText: {
        color: "#e65100",
        fontSize: "13px",
        margin: 0,
        fontWeight: 500
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        marginBottom: "20px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#5a4a42",
    },
    input: {
        padding: "12px 16px",
        border: "1px solid rgba(255, 195, 160, 0.35)",
        borderRadius: "12px",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        background: "rgba(255, 255, 255, 0.9)",
        color: "#5a4a42",
    },
    passwordWrapper: {
        display: "flex",
        gap: "8px",
        alignItems: "stretch",
    },
    passwordInput: {
        flex: 1,
        padding: "12px 16px",
        border: "1px solid rgba(255, 195, 160, 0.35)",
        borderRadius: "12px",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        background: "rgba(255, 255, 255, 0.9)",
        color: "#5a4a42",
    },
    togglePasswordBtn: {
        padding: "8px 14px",
        background: "rgba(255, 195, 160, 0.15)",
        border: "1px solid rgba(255, 195, 160, 0.35)",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        color: "#8b5e3c",
        fontFamily: "inherit",
        whiteSpace: "nowrap"
    },
    passwordHint: {
        fontSize: "11px",
        color: "rgba(139, 126, 116, 0.6)",
        margin: "2px 0 0 0",
    },
    submitBtn: {
        padding: "13px 24px",
        background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 6px 20px rgba(255, 175, 189, 0.35)"
    },
    toggleSection: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "12px",
        paddingTop: "12px",
        borderTop: "1px solid rgba(139, 126, 116, 0.1)",
    },
    toggleText: {
        fontSize: "13px",
        color: "rgba(139, 126, 116, 0.65)",
        margin: 0,
        display: "flex",
        gap: "6px",
        alignItems: "center",
    },
    toggleBtn: {
        background: "none",
        border: "none",
        color: "#ff9a76",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "13px",
        padding: "0",
        fontFamily: "inherit",
    },
    footer: {
        textAlign: "center",
        paddingTop: "16px",
        paddingBottom: "16px",
    },
    footerText: {
        fontSize: "12px",
        color: "rgba(139, 126, 116, 0.6)",
        margin: 0,
    },
};
