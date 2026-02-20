// ─── Realtime Notepad Module ─────────────────────────────────────────────────

const Notepad = (() => {
    let _userId = null;
    let _textarea = null;
    let _charCount = null;
    let _lastSaved = null;
    let _syncStatus = null;
    let _writeTimeout = null;
    let _subscription = null;
    let _isRemoteUpdate = false;
    let _lastContent = '';

    const DEBOUNCE_MS = 300;

    /**
     * Initialize the notepad for a given user.
     */
    async function init(userId) {
        _userId = userId;
        _textarea = document.getElementById('notepad');
        _charCount = document.getElementById('char-count');
        _lastSaved = document.getElementById('last-saved');
        _syncStatus = document.getElementById('sync-status');

        // Load existing note
        await _loadNote();

        // Listen for local input
        _textarea.addEventListener('input', _onLocalInput);

        // Subscribe to realtime changes
        _subscribeRealtime();

        _textarea.focus();
    }

    /**
     * Load the user's note from Supabase.
     */
    async function _loadNote() {
        _setSyncStatus('syncing');

        const { data, error } = await sb
            .from('notes')
            .select('content, updated_at')
            .eq('user_id', _userId)
            .maybeSingle();

        if (error) {
            console.error('Load note error:', error.message);
            _setSyncStatus('error');
            return;
        }

        if (data) {
            _textarea.value = data.content;
            _lastContent = data.content;
            _updateCharCount();
            _updateLastSaved(data.updated_at);
        } else {
            // No note yet — create an empty one
            const { error: insertError } = await sb
                .from('notes')
                .insert({ user_id: _userId, content: '' });

            if (insertError) {
                console.error('Create note error:', insertError.message);
            }
            _lastContent = '';
        }

        _setSyncStatus('connected');
    }

    /**
     * Handle local typing — debounce and write to Supabase.
     */
    function _onLocalInput() {
        if (_isRemoteUpdate) return;
        _updateCharCount();
        _setSyncStatus('syncing');

        clearTimeout(_writeTimeout);
        _writeTimeout = setTimeout(() => {
            _saveNote(_textarea.value);
        }, DEBOUNCE_MS);
    }

    /**
     * Save note content to Supabase.
     */
    async function _saveNote(content) {
        if (content === _lastContent) {
            _setSyncStatus('connected');
            return;
        }

        _lastContent = content;

        const { error } = await sb
            .from('notes')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('user_id', _userId);

        if (error) {
            console.error('Save note error:', error.message);
            _setSyncStatus('error');
            return;
        }

        _updateLastSaved(new Date().toISOString());
        _setSyncStatus('connected');
    }

    /**
     * Subscribe to realtime Postgres changes on the notes table for this user.
     */
    function _subscribeRealtime() {
        _subscription = sb
            .channel('notes-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notes',
                    filter: `user_id=eq.${_userId}`,
                },
                (payload) => {
                    _handleRemoteChange(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    _setSyncStatus('connected');
                } else if (status === 'CHANNEL_ERROR') {
                    _setSyncStatus('error');
                }
            });
    }

    /**
     * Handle incoming remote changes — update textarea without losing cursor.
     */
    function _handleRemoteChange(note) {
        if (!note || note.content === _lastContent) return;

        _isRemoteUpdate = true;
        _lastContent = note.content;

        // Preserve cursor position
        const start = _textarea.selectionStart;
        const end = _textarea.selectionEnd;
        const oldLength = _textarea.value.length;

        _textarea.value = note.content;

        // Adjust cursor based on length difference
        const diff = note.content.length - oldLength;
        _textarea.selectionStart = Math.max(0, start + (start >= oldLength ? diff : 0));
        _textarea.selectionEnd = Math.max(0, end + (end >= oldLength ? diff : 0));

        _updateCharCount();
        _updateLastSaved(note.updated_at);
        _isRemoteUpdate = false;
    }

    /**
     * Update the character count display.
     */
    function _updateCharCount() {
        if (_charCount) {
            _charCount.textContent = _textarea.value.length;
        }
    }

    /**
     * Update the "last saved" display.
     */
    function _updateLastSaved(isoString) {
        if (!_lastSaved || !isoString) return;
        const date = new Date(isoString);
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        _lastSaved.textContent = `Saved at ${time}`;
    }

    /**
     * Set the sync status indicator.
     */
    function _setSyncStatus(status) {
        if (!_syncStatus) return;
        _syncStatus.className = `sync-status sync-status--${status}`;
        const label = _syncStatus.querySelector('.sync-label');
        if (label) {
            const labels = { connected: 'Connected', syncing: 'Syncing…', error: 'Offline' };
            label.textContent = labels[status] || 'Connected';
        }
    }

    /**
     * Clean up subscriptions when user logs out.
     */
    function destroy() {
        if (_subscription) {
            sb.removeChannel(_subscription);
            _subscription = null;
        }
        clearTimeout(_writeTimeout);
        if (_textarea) {
            _textarea.removeEventListener('input', _onLocalInput);
            _textarea.value = '';
        }
        _userId = null;
        _lastContent = '';
    }

    return { init, destroy };
})();
