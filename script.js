// CONFIGURATION
// Replace these URLs with your actual n8n Webhook URLs
const CONFIG = {
    // Webhook for registering hours (Method: POST)
    REGISTRATION_WEBHOOK: 'YOUR_REGISTRATION_WEBHOOK_URL_HERE',

    // Webhook for triggering the weekly report email (Method: POST or GET)
    REPORT_WEBHOOK: 'YOUR_REPORT_WEBHOOK_URL_HERE'
};

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

async function handleRegistration(formData) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');

    // Loading state
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    loader.classList.remove('hidden');

    // Parse the date from dd-mm-yyyy to yyyy-mm-dd for backend consistency
    const dateStr = formData.get('date');
    const [day, month, year] = dateStr.split('-');
    const isoDate = `${year}-${month}-${day}`;

    const data = {
        'Date': isoDate,
        'Week Number': parseInt(formData.get('weekNumber')),
        'Start Time': formData.get('startTime'),
        'End Time': formData.get('endTime'),
        'Break in minutes': parseInt(formData.get('pause')) || 0,
        'Notes': formData.get('notes') || ''
    };

    try {
        if (CONFIG.REGISTRATION_WEBHOOK.includes('YOUR_')) {
            throw new Error('Please configure the Webhook URL in script.js');
        }

        const response = await fetch(CONFIG.REGISTRATION_WEBHOOK, {
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
        if (CONFIG.REPORT_WEBHOOK.includes('YOUR_')) {
            throw new Error('Please configure the Webhook URL in script.js');
        }

        const response = await fetch(CONFIG.REPORT_WEBHOOK, {
            method: 'POST',
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
