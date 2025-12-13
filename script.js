// CONFIGURATION
// For security, webhook URLs are encrypted
// To configure:
// 1. Go to the helper tool at the end of this file (searchfor "CONFIGURATION HELPER")
// 2. Follow the instructions to encrypt your webhook URLs
// 3. Replace the encrypted values below

const CONFIG = {
    // Your encryption key (change this to a random string)
    ENCRYPTION_KEY: 'vC1e5zKnQqZM01iHX22mb2dFTLb9M8Gj',

    // Encrypted webhook URLs (use the helper tool to generate these)
    REGISTRATION_WEBHOOK_ENC: 'HjdFFUZAZEE/STRjQ0MfeWgFAV5XAUouJzgFS2NbKwUDJx4SUBgjAT4adThCVAc=',
    REPORT_WEBHOOK_ENC: 'HjdFFUZAZEE/STRjQ0MfeWgFAV5XAUouJzgFS2NbKwUDJx4SUBgjAT4adSBRWAU=',
    GET_HOURS_WEBHOOK_ENC: 'HjdFFUZAZEE/STRjQ0MfeWgFAV5XAUouJzgFS2NbKwUDJx4SUBgjAT4adSpVRUQgN0dAHg==' // Will be replaced after n8n deployment
};

// Decrypt webhook URLs
function decryptWebhook(encrypted, key) {
    if (!encrypted || encrypted.includes('YOUR_')) {
        throw new Error('Please configure the encrypted webhook URLs');
    }
    try {
        const bytes = atob(encrypted);
        let decrypted = '';
        for (let i = 0; i < bytes.length; i++) {
            decrypted += String.fromCharCode(bytes.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
    } catch (error) {
        throw new Error('Failed to decrypt webhook URL. Please check your configuration.');
    }
}

// Get decrypted webhooks
function getWebhooks() {
    return {
        registration: decryptWebhook(CONFIG.REGISTRATION_WEBHOOK_ENC, CONFIG.ENCRYPTION_KEY),
        report: decryptWebhook(CONFIG.REPORT_WEBHOOK_ENC, CONFIG.ENCRYPTION_KEY),
        getHours: decryptWebhook(CONFIG.GET_HOURS_WEBHOOK_ENC, CONFIG.ENCRYPTION_KEY)
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
    startClock();
});

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

function initializeForm() {
    // Initialize Flatpickr for date input
    flatpickr("#date", {
        dateFormat: "d-m-Y",
        defaultDate: "today",
        locale: {
            firstDayOfWeek: 1 // Monday
        },
        onChange: function (selectedDates, dateStr, instance) {
            updateWeekNumber(selectedDates[0]);
        }
    });

    // Calculate and set week number for today
    updateWeekNumber(new Date());

    // Display current week in the report card
    const now = new Date();
    document.getElementById('currentWeekDisplay').textContent = getWeekNumber(now);
    updateWeekRange(now);

    // Initialize week overview (async, non-blocking)
    updateWeekOverview().catch(error => {
        console.error('Failed to load week overview:', error);
    });
}

function updateWeekRange(date) {
    const curr = new Date(date);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday

    const firstday = new Date(curr.setDate(diff));
    const lastday = new Date(curr.setDate(diff + 6));

    const options = { day: 'numeric', month: 'long' };
    const rangeStr = `${firstday.toLocaleDateString('nl-NL', options)} - ${lastday.toLocaleDateString('nl-NL', options)}`;

    document.getElementById('weekDateRange').textContent = rangeStr;
}

function setupEventListeners() {
    // Hours Registration Form
    const form = document.getElementById('hoursForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegistration(new FormData(form));
    });

    // Send Report Button
    const reportBtn = document.getElementById('sendReportBtn');
    reportBtn.addEventListener('click', handleReportSending);
}

// Input sanitization function
function sanitizeInput(input, type = 'text') {
    if (!input) return '';

    let sanitized = String(input).trim();

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    if (type === 'text') {
        // Escape HTML characters
        const div = document.createElement('div');
        div.textContent = sanitized;
        sanitized = div.innerHTML;

        // Limit length
        sanitized = sanitized.substring(0, 500);
    } else if (type === 'number') {
        // Ensure it's a valid number
        const num = parseInt(sanitized);
        return isNaN(num) ? 0 : num;
    } else if (type === 'time') {
        // Validate time format HH:MM
        if (!/^[0-2][0-9]:[0-5][0-9]$/.test(sanitized)) {
            throw new Error('Invalid time format');
        }
    } else if (type === 'date') {
        // Validate date format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(sanitized)) {
            throw new Error('Invalid date format');
        }
    }

    return sanitized;
}

async function handleRegistration(formData) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');

    // Loading state
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // Parse the date from dd-mm-yyyy to yyyy-mm-dd for backend consistency
        const dateStr = formData.get('date');
        const [day, month, year] = dateStr.split('-');
        const isoDate = `${year}-${month}-${day}`;

        // Generate unique ID for this entry
        const entryId = generateUniqueId();

        // Validate and sanitize all inputs
        const data = {
            'id': entryId,
            'Date': sanitizeInput(isoDate, 'date'),
            'Week Number': sanitizeInput(formData.get('weekNumber'), 'number'),
            'Start Time': sanitizeInput(formData.get('startTime'), 'time'),
            'End Time': sanitizeInput(formData.get('endTime'), 'time'),
            'Break in minutes': sanitizeInput(formData.get('pause') || '0', 'number'),
            'Notes': sanitizeInput(formData.get('notes') || '', 'text')
        };

        // Validate time logic
        const [startHour, startMin] = data['Start Time'].split(':').map(Number);
        const [endHour, endMin] = data['End Time'].split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
            throw new Error('Eindtijd moet na starttijd zijn');
        }

        if (data['Break in minutes'] < 0 || data['Break in minutes'] > 480) {
            throw new Error('Pauze moet tussen 0 en 480 minuten zijn');
        }

        const webhooks = getWebhooks();

        const response = await fetch(webhooks.registration, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('Uren succesvol geregistreerd!', 'success');
            document.getElementById('hoursForm').reset();
            initializeForm(); // Reset date and week

            // Update week overview (async, non-blocking)
            updateWeekOverview().catch(error => {
                console.error('Failed to refresh week overview:', error);
            });
        } else {
            throw new Error('Server returned ' + response.status);
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Fout bij registreren: ' + error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

async function handleReportSending() {
    const btn = document.getElementById('sendReportBtn');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<div class="loader"></div> Versturen...';

    try {
        const webhooks = getWebhooks();

        const response = await fetch(webhooks.report, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trigger: 'manual',
                date: new Date().toISOString()
            })
        });

        if (response.ok) {
            showToast('Weekrapportage verstuurd!', 'success');
        } else {
            throw new Error('Server returned ' + response.status);
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Fout bij versturen: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function updateWeekNumber(date) {
    const weekNum = getWeekNumber(date);
    document.getElementById('weekNumber').value = weekNum;
}

// ISO 8601 Week Number calculation
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');

    toastMsg.textContent = message;
    toast.style.borderColor = type === 'success' ? 'var(--success)' : 'var(--error)';
    toast.style.color = type === 'success' ? 'var(--success)' : 'var(--error)';

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ========================================
// WEEK OVERVIEW FUNCTIONALITY
// ========================================

function generateUniqueId() {
    // Generate a unique ID based on timestamp and random number
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekBoundaries(date) {
    const curr = new Date(date);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

    const firstDay = new Date(curr.setDate(diff));
    firstDay.setHours(0, 0, 0, 0);

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);
    lastDay.setHours(23, 59, 59, 999);

    return { firstDay, lastDay };
}

async function getWeekHours() {
    try {
        const { firstDay, lastDay } = getWeekBoundaries(new Date());

        const startDate = formatDateToISO(firstDay);
        const endDate = formatDateToISO(lastDay);

        const webhooks = getWebhooks();
        const response = await fetch(webhooks.getHours, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ startDate, endDate })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const hours = await response.json();

        // Transform n8n format to expected format
        return hours.map(entry => ({
            'Date': entry.date,
            'Start Time': entry.starttime,
            'End Time': entry.endtime,
            'Break in minutes': parseInt(entry.break_in_minutes) || 0,
            'Notes': entry.notes || '',
            'Week Number': parseInt(entry.weeknumber),
            id: entry.id || generateUniqueId(),
            timestamp: entry.timestamp || new Date().toISOString()
        }));

    } catch (error) {
        console.warn('Could not fetch hours from n8n, showing empty list:', error);
        return [];
    }
}

function calculateTotalHours(entries) {
    let totalMinutes = 0;

    entries.forEach(entry => {
        const [startHour, startMin] = entry['Start Time'].split(':').map(Number);
        const [endHour, endMin] = entry['End Time'].split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const breakMinutes = entry['Break in minutes'] || 0;

        const workedMinutes = endMinutes - startMinutes - breakMinutes;
        totalMinutes += workedMinutes;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { hours, minutes, totalMinutes };
}

async function updateWeekOverview() {
    const overviewList = document.getElementById('weekOverviewList');
    const totalElement = document.getElementById('weekTotalHours');

    // Show loading state
    if (overviewList) {
        overviewList.innerHTML = '<li class="loading">⏳ Uren ophalen...</li>';
    }

    try {
        const weekHours = await getWeekHours();
        const { hours, minutes } = calculateTotalHours(weekHours);

        // Update total hours display
        if (totalElement) {
            totalElement.textContent = `${hours}u ${minutes}m`;
        }

        // Update day-by-day breakdown
        if (overviewList) {
            if (weekHours.length === 0) {
                overviewList.innerHTML = '<li class="no-hours">Nog geen uren geregistreerd deze week</li>';
            } else {
                // Group by date
                const groupedByDate = {};
                weekHours.forEach(entry => {
                    const date = entry.Date;
                    if (!groupedByDate[date]) {
                        groupedByDate[date] = [];
                    }
                    groupedByDate[date].push(entry);
                });

                // Sort by date (oldest first - Monday at top)
                const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
                    return new Date(a) - new Date(b);
                });

                overviewList.innerHTML = sortedDates.map(date => {
                    const entries = groupedByDate[date];
                    const { hours: dayHours, minutes: dayMinutes } = calculateTotalHours(entries);

                    // Format date to Dutch
                    const dateObj = new Date(date);
                    const dayName = dateObj.toLocaleDateString('nl-NL', { weekday: 'short' });
                    const dayNumber = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('nl-NL', { month: 'short' });

                    return `
                        <li class="overview-day">
                            <span class="day-label">${dayName} ${dayNumber} ${month}</span>
                            <span class="day-hours">${dayHours}u ${dayMinutes}m</span>
                        </li>
                    `;
                }).join('');
            }
        }
    } catch (error) {
        console.warn('Error updating week overview:', error);
        if (overviewList) {
            overviewList.innerHTML = '<li class="no-hours">Nog geen uren geregistreerd deze week</li>';
        }
        if (totalElement) {
            totalElement.textContent = '0u 0m';
        }
    }
}

// ========================================
// CONFIGURATION HELPER TOOL
// ========================================
// To encrypt your webhook URLs, open your browser console and run:
//
// encryptWebhookHelper('YOUR_WEBHOOK_URL', 'YOUR_ENCRYPTION_KEY')
//
// Example:
// encryptWebhookHelper('https://n8n.example.com/webhook/hours', 'my-secret-key-123')
//
// Then copy the output and paste it into the CONFIG object above
// ========================================

function encryptWebhookHelper(url, key) {
    if (!url || !key) {
        console.error('Usage: encryptWebhookHelper(url, key)');
        console.error('Example: encryptWebhookHelper("https://n8n.example.com/webhook/hours", "my-secret-key-123")');
        return;
    }

    let encrypted = '';
    for (let i = 0; i < url.length; i++) {
        encrypted += String.fromCharCode(url.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }

    const base64 = btoa(encrypted);
    console.log('='.repeat(60));
    console.log('Encrypted webhook URL:');
    console.log(base64);
    console.log('='.repeat(60));
    console.log('Copy this value and paste it into the CONFIG object');
    console.log('Encryption key:', key);
    console.log('='.repeat(60));

    return base64;
}
