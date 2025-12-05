// Login page JavaScript

// Start the clock animation
function startClock() {
    const hourHand = document.querySelector('.clock-hand.hour');
    const minuteHand = document.querySelector('.clock-hand.minute');
    const secondHand = document.querySelector('.clock-hand.second');

    function update() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();

        const secondDeg = ((seconds / 60) * 360);
        const minuteDeg = ((minutes / 60) * 360) + ((seconds / 60) * 6);
        const hourDeg = ((hours / 12) * 360) + ((minutes / 60) * 30);

        if (secondHand) secondHand.style.transform = `translate(-50%, -50%) rotate(${secondDeg}deg)`;
        if (minuteHand) minuteHand.style.transform = `translate(-50%, -50%) rotate(${minuteDeg}deg)`;
        if (hourHand) hourHand.style.transform = `translate(-50%, -50%) rotate(${hourDeg}deg)`;

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

startClock();

// SECURITY CONFIGURATION
// To set your password:
// 1. Go to: https://emn178.github.io/online-tools/sha256.html
// 2. Enter your desired password
// 3. Copy the SHA-256 hash
// 4. Replace the hash below with your hash
const PASSWORD_HASH = '17b7d2ccaa88c077ef6959960c3c57fce8a02b28fad5022d6d9c871dc39b4100';

// Session duration in milliseconds (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// Check if already logged in
const session = sessionStorage.getItem('auth_session');
if (session) {
    const sessionData = JSON.parse(session);
    const now = new Date().getTime();

    if (now < sessionData.expires) {
        // Valid session, redirect to main page
        window.location.href = 'index.html';
    } else {
        // Expired session
        sessionStorage.removeItem('auth_session');
    }
}

// Handle login form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const loader = loginBtn.querySelector('.loader');

    // Show loading state
    loginBtn.disabled = true;
    btnText.classList.add('hidden');
    loader.classList.remove('hidden');
    errorMessage.classList.remove('show');

    try {
        // Hash the password using SHA-256
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Verify password
        if (hashHex === PASSWORD_HASH) {
            // Create session
            const sessionData = {
                expires: new Date().getTime() + SESSION_DURATION,
                timestamp: new Date().toISOString()
            };
            sessionStorage.setItem('auth_session', JSON.stringify(sessionData));

            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            // Invalid password
            errorMessage.classList.add('show');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Er is een fout opgetreden. Probeer het opnieuw.';
        errorMessage.classList.add('show');
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
});
