// ─── App Orchestrator ────────────────────────────────────────────────────────

(function () {
    'use strict';

    const authView = document.getElementById('auth-view');
    const notepadView = document.getElementById('notepad-view');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authError = document.getElementById('auth-error');
    const authSuccess = document.getElementById('auth-success');
    const userEmail = document.getElementById('user-email');
    const userAvatar = document.getElementById('user-avatar');

    // Auth tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const tabIndicator = document.querySelector('.auth-tab-indicator');

    authTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            authTabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');

            authForms.forEach((f) => f.classList.remove('active'));
            document.getElementById(`${target}-form`).classList.add('active');

            // Move indicator
            if (target === 'signup') {
                tabIndicator.style.transform = 'translateX(100%)';
            } else {
                tabIndicator.style.transform = 'translateX(0)';
            }

            _clearMessages();
        });
    });

    // ── Login ──────────────────────────────────────────────────────
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        _clearMessages();
        _setLoading(loginBtn, true);

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const { user, error } = await Auth.logIn(email, password);

        _setLoading(loginBtn, false);

        if (error) {
            _showError(error.message);
            return;
        }
    });

    // ── Signup ─────────────────────────────────────────────────────
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        _clearMessages();

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (password !== confirm) {
            _showError('Passwords do not match.');
            return;
        }

        _setLoading(signupBtn, true);

        const { user, error } = await Auth.signUp(email, password);

        _setLoading(signupBtn, false);

        if (error) {
            _showError(error.message);
            return;
        }

        // Supabase may require email confirmation — show success message
        if (user && !user.confirmed_at && user.identities?.length === 0) {
            _showSuccess('Check your email to confirm your account.');
        } else {
            _showSuccess('Account created! You are now logged in.');
        }
    });

    // ── Logout ─────────────────────────────────────────────────────
    logoutBtn.addEventListener('click', async () => {
        Notepad.destroy();
        await Auth.logOut();
    });

    // ── Auth State Listener ────────────────────────────────────────
    Auth.onAuthChange(async (event, session) => {
        if (session?.user) {
            _showNotepad(session.user);
        } else {
            _showAuth();
        }
    });

    // Check for existing session on load
    (async () => {
        const session = await Auth.getSession();
        if (session?.user) {
            _showNotepad(session.user);
        }
    })();

    // ── View Switching ─────────────────────────────────────────────

    function _showNotepad(user) {
        authView.style.display = 'none';
        notepadView.style.display = 'flex';

        const email = user.email || 'User';
        userEmail.textContent = email;
        userAvatar.textContent = email.charAt(0).toUpperCase();

        Notepad.init(user.id);
    }

    function _showAuth() {
        notepadView.style.display = 'none';
        authView.style.display = 'flex';
        loginForm.reset();
        signupForm.reset();
        _clearMessages();
    }

    // ── Helpers ────────────────────────────────────────────────────

    function _showError(msg) {
        authError.textContent = msg;
        authError.style.display = 'block';
        authSuccess.style.display = 'none';
    }

    function _showSuccess(msg) {
        authSuccess.textContent = msg;
        authSuccess.style.display = 'block';
        authError.style.display = 'none';
    }

    function _clearMessages() {
        authError.style.display = 'none';
        authSuccess.style.display = 'none';
        authError.textContent = '';
        authSuccess.textContent = '';
    }

    function _setLoading(btn, loading) {
        btn.classList.toggle('btn--loading', loading);
        btn.disabled = loading;
    }
})();
