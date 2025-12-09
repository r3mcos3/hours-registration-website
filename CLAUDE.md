# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static hours registration website that integrates with n8n workflows for time tracking and weekly reporting. Uses client-side encryption and localStorage for data management.

## Architecture

### Security Model
- **Authentication**: SHA-256 password hashing (client-side) with session management via localStorage
- **Webhook Protection**: XOR encryption of webhook URLs in `script.js` using a custom encryption key
- **Session Management**: 24-hour auto-logout via `auth.js`
- **Input Validation**: All form inputs are sanitized before sending to n8n

### Data Flow
1. User logs in via `login.html` → session stored in localStorage
2. Hours registration via `index.html` → data sent to encrypted n8n webhook
3. Registered hours saved to localStorage for week overview display
4. Weekly report trigger sends request to separate n8n webhook

### Key Components
- `login.html` + `login.js`: Authentication entry point with password hash verification
- `index.html`: Main UI with registration form, week report trigger, and week overview display
- `auth.js`: Session validation, auto-logout timer, and page protection
- `script.js`: Form handling, n8n integration, localStorage management, week calculations
- `style.css`: Glassmorphism design with animated background clock

### Week Overview Feature (localStorage-based)
- Stores all registered hours locally in `registeredHours` key
- Filters entries by current week boundaries (Monday-Sunday)
- Calculates total hours and displays per-day breakdown
- Auto-updates after new registrations

## Configuration Requirements

### Before Deployment
1. **Password Hash**: Replace `YOUR_PASSWORD_HASH_HERE` in `login.html` with SHA-256 hash
2. **Encryption Key**: Set `ENCRYPTION_KEY` in `script.js`
3. **Webhook URLs**: Encrypt using `encryptWebhookHelper()` function and update `REGISTRATION_WEBHOOK_ENC` and `REPORT_WEBHOOK_ENC` in `script.js`

### Helper Tools (Not for Production)
- `password-hasher.html`: Generate SHA-256 password hashes
- `webhook-encrypter.html`: Encrypt webhook URLs
- These files are in `.gitignore` and should never be deployed

## Common Tasks

### Testing Locally
Open `login.html` in a browser. No build step or dev server required - this is a pure static site.

### Deploying
Typically deployed via Netlify with automatic GitHub integration. See `DEPLOYMENT.md` for full instructions.

### Clearing Test Data
Open browser console and run:
```javascript
localStorage.removeItem('registeredHours')
location.reload()
```

### Cache-Busting for Updates
When CSS or JavaScript changes don't appear on the live site after deployment, update the version query parameters in the HTML files:

**In `index.html`:**
```html
<link rel="stylesheet" href="style.css?v=YYYYMMDD">
<script src="auth.js?v=YYYYMMDD"></script>
<script src="script.js?v=YYYYMMDD"></script>
```

**In `login.html`:**
```html
<script src="login.js?v=YYYYMMDD"></script>
```

Use today's date in format YYYYMMDD (e.g., 20251209) to ensure browsers fetch the latest version.

## Important Constraints

- This is a **static site** - no backend, no build process, no npm dependencies
- All sensitive data (passwords, webhook URLs) must be configured before deployment
- LocalStorage is the only data persistence mechanism for the week overview
- Week calculations use ISO 8601 week numbers (Monday as first day)
- All commits should be prefixed with emoji (per user's global CLAUDE.md preferences)
- Never include "Generated with Claude Code" in commit messages (per user's preferences)

## n8n Integration

The site expects two n8n webhook endpoints:
1. **Registration webhook**: Receives hour entries with Date, Week Number, Start Time, End Time, Break, and Notes
2. **Report webhook**: Triggered manually to send weekly email report

See `README.md` and `SECURITY.md` for n8n webhook configuration details.
