// ─── Authentication Module ───────────────────────────────────────────────────

const Auth = (() => {
    /**
     * Sign up a new user with email and password.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user: object|null, error: object|null}>}
     */
    async function signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { user: data?.user ?? null, error };
    }

    /**
     * Log in an existing user.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user: object|null, error: object|null}>}
     */
    async function logIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { user: data?.user ?? null, error };
    }

    /**
     * Log out the current user.
     */
    async function logOut() {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout error:', error.message);
    }

    /**
     * Get the current session (if any).
     * @returns {Promise<object|null>}
     */
    async function getSession() {
        const { data } = await supabase.auth.getSession();
        return data?.session ?? null;
    }

    /**
     * Listen for auth state changes.
     * @param {function} callback - receives (event, session)
     */
    function onAuthChange(callback) {
        supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    return { signUp, logIn, logOut, getSession, onAuthChange };
})();
