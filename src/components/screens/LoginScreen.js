import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════
// LOGIN SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function LoginScreen({ onLoginSuccess, Icon }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { loginUser, registerUser } = await import("../../utils/auth");

            if (isLogin) {
                await loginUser(username, password);
            } else {
                await registerUser(username, password);
            }

            // Clear form and call success callback
            setUsername("");
            setPassword("");
            onLoginSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Toggle between login and signup modes
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setUsername("");
        setPassword("");
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.logoSection}>
                    <div style={styles.iconWrapper}>
                        <Icon name="heart" size={48} color="#ff9a76" />
                    </div>
                    <h1 style={styles.title}>AI Companion</h1>
                    <p style={styles.subtitle}>Your Personal Life Assistant</p>
                </div>
            </div>

            {/* Form Card */}
            <div style={styles.card}>
                <h2 style={styles.formTitle}>
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p style={styles.formSubtitle}>
                    {isLogin
                        ? "Sign in to your account"
                        : "Join AI Companion to get started"}
                </p>

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
                            placeholder="Enter your username"
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
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {!isLogin && (
                            <p style={styles.passwordHint}>
                                ℹ️ Minimum 6 characters
                            </p>
                        )}
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
                        {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
                    </button>
                </form>

                {/* Toggle Form Mode */}
                <div style={styles.toggleSection}>
                    <p style={styles.toggleText}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={toggleMode}
                            style={styles.toggleBtn}
                            disabled={loading}
                        >
                            {isLogin ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </div>

            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <p style={styles.footerText}>
                    Secure authentication • Local storage • Your data, your privacy
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
    },
    header: {
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        paddingBottom: "20px",
    },
    logoSection: {
        textAlign: "center",
        color: "#8b7e74",
    },
    iconWrapper: {
        marginBottom: "20px",
        display: "flex",
        justifyContent: "center",
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        margin: "0 0 8px 0",
        color: "#8b7e74",
        fontFamily: "'Crimson Text', serif",
        fontStyle: "italic",
    },
    subtitle: {
        fontSize: "16px",
        opacity: 0.8,
        margin: 0,
        color: "rgba(139, 126, 116, 0.7)",
    },
    card: {
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        maxWidth: "420px",
        margin: "0 auto",
        width: "100%",
    },
    formTitle: {
        fontSize: "24px",
        fontWeight: "700",
        margin: "0 0 8px 0",
        color: "#8b7e74",
        fontFamily: "'Crimson Text', serif",
        fontStyle: "italic",
    },
    formSubtitle: {
        fontSize: "14px",
        color: "rgba(139, 126, 116, 0.6)",
        margin: "0 0 24px 0",
    },
    errorBox: {
        background: "rgba(255, 154, 118, 0.15)",
        border: "1px solid rgba(255, 154, 118, 0.3)",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "20px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
    },
    errorIcon: {
        fontSize: "18px",
        flexShrink: 0,
    },
    errorText: {
        color: "#ff9a76",
        fontSize: "14px",
        margin: "2px 0 0 0",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        marginBottom: "24px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#8b7e74",
    },
    input: {
        padding: "12px 16px",
        border: "2px solid rgba(255, 195, 160, 0.3)",
        borderRadius: "8px",
        fontSize: "14px",
        fontFamily: "inherit",
        transition: "all 0.2s",
        outline: "none",
        boxSizing: "border-box",
        background: "rgba(255, 255, 255, 0.8)",
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
        border: "2px solid rgba(255, 195, 160, 0.3)",
        borderRadius: "8px",
        fontSize: "14px",
        fontFamily: "inherit",
        transition: "all 0.2s",
        outline: "none",
        boxSizing: "border-box",
        background: "rgba(255, 255, 255, 0.8)",
        color: "#5a4a42",
    },
    togglePasswordBtn: {
        padding: "8px 12px",
        background: "rgba(255, 195, 160, 0.1)",
        border: "2px solid rgba(255, 195, 160, 0.3)",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "600",
        cursor: "pointer",
        color: "rgba(139, 126, 116, 0.6)",
        transition: "all 0.2s",
        fontFamily: "inherit",
    },
    passwordHint: {
        fontSize: "12px",
        color: "rgba(139, 126, 116, 0.5)",
        margin: "4px 0 0 0",
    },
    submitBtn: {
        padding: "12px 24px",
        background: "linear-gradient(135deg, #ffc3a0, #ffafbd)",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s",
        fontFamily: "inherit",
    },
    toggleSection: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px",
        paddingBottom: "20px",
        borderBottom: "1px solid rgba(255, 195, 160, 0.2)",
    },
    toggleText: {
        fontSize: "14px",
        color: "rgba(139, 126, 116, 0.6)",
        margin: 0,
        display: "flex",
        gap: "8px",
        alignItems: "center",
    },
    toggleBtn: {
        background: "none",
        border: "none",
        color: "#ff9a76",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "14px",
        padding: "0",
        fontFamily: "inherit",
    },
    infoBox: {
        background: "rgba(168, 230, 207, 0.1)",
        border: "1px solid rgba(168, 230, 207, 0.3)",
        borderRadius: "8px",
        padding: "12px 16px",
    },
    infoText: {
        fontSize: "13px",
        color: "rgba(90, 74, 66, 0.7)",
        margin: 0,
    },
    footer: {
        textAlign: "center",
        paddingTop: "20px",
        paddingBottom: "20px",
    },
    footerText: {
        fontSize: "13px",
        color: "rgba(139, 126, 116, 0.6)",
        margin: 0,
    },
};
