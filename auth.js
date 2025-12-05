// Authentication check and session management
(function() {
    'use strict';

    // Session duration in milliseconds (24 hours)
    const SESSION_DURATION = 24 * 60 * 60 * 1000;

    // Check authentication status
    function checkAuth() {
        const session = sessionStorage.getItem('auth_session');

        if (!session) {
            redirectToLogin();
            return false;
        }

        try {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();

            if (now >= sessionData.expires) {
                // Session expired
                sessionStorage.removeItem('auth_session');
                redirectToLogin();
                return false;
            }

            // Session is valid
            return true;
        } catch (error) {
            console.error('Session validation error:', error);
            sessionStorage.removeItem('auth_session');
            redirectToLogin();
            return false;
        }
    }

    function redirectToLogin() {
        window.location.href = 'login.html';
    }

    // Logout function
    window.logout = function() {
        sessionStorage.removeItem('auth_session');
        redirectToLogin();
    };

    // Add logout button to the page
    function addLogoutButton() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', insertLogoutButton);
        } else {
            insertLogoutButton();
        }
    }

    function insertLogoutButton() {
        const header = document.querySelector('.header');
        if (header) {
            const logoutBtn = document.createElement('button');
            logoutBtn.innerHTML = '🚪 Uitloggen';
            logoutBtn.className = 'logout-btn';
            logoutBtn.onclick = logout;

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .logout-btn {
                    position: absolute;
                    top: 2rem;
                    right: 2rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: var(--text);
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    cursor: pointer;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                .logout-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }
                @media (max-width: 768px) {
                    .logout-btn {
                        position: static;
                        display: block;
                        margin: 1rem auto 0;
                        width: fit-content;
                    }
                }
            `;
            document.head.appendChild(style);
            header.appendChild(logoutBtn);
        }
    }

    // Check authentication on page load
    if (checkAuth()) {
        addLogoutButton();
    }

    // Refresh session expiry on user activity
    let activityTimeout;
    function refreshSession() {
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(() => {
            const session = sessionStorage.getItem('auth_session');
            if (session) {
                try {
                    const sessionData = JSON.parse(session);
                    sessionData.expires = new Date().getTime() + SESSION_DURATION;
                    sessionStorage.setItem('auth_session', JSON.stringify(sessionData));
                } catch (error) {
                    console.error('Session refresh error:', error);
                }
            }
        }, 1000);
    }

    // Listen for user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, refreshSession, { passive: true });
    });
})();
