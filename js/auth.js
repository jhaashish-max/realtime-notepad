// ─── Authentication Module ───────────────────────────────────────────────────

const Auth = (() => {
    /**
     * Sign up a new user with email and password.
     * Returns { user, session, error }
     */
    async function signUp(email, password) {
        const { data, error } = await sb.auth.signUp({ email, password });
        return {
            user: data?.user ?? null,
            session: data?.session ?? null,
            error,
        };
    }

    /**
     * Log in an existing user.
     */
    async function logIn(email, password) {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        return { user: data?.user ?? null, error };
    }

    /**
     * Log out the current user.
     */
    async function logOut() {
        const { error } = await sb.auth.signOut();
        if (error) console.error('Logout error:', error.message);
    }

    /**
     * Get the current session (if any).
     */
    async function getSession() {
        const { data } = await sb.auth.getSession();
        return data?.session ?? null;
    }

    /**
     * Listen for auth state changes.
     */
    function onAuthChange(callback) {
        sb.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    return { signUp, logIn, logOut, getSession, onAuthChange };
})();
