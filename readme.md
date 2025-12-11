# Hours Registration Website

This website is designed to work with n8n for registering hours and sending weekly reports.

## Security Features

✅ **Login protection** - Password protection for access
✅ **Encrypted webhooks** - Webhook URLs are encrypted in the code
✅ **Input validation** - All user input is validated and sanitized
✅ **Session management** - Automatic logout after 24 hours
✅ **Subresource Integrity** - External scripts are protected

⚠️ **IMPORTANT**: Read [SECURITY.md](SECURITY.md) for complete configuration instructions!

## Quick Start

### 1. Configure Security

**a) Set your password:**
1. Go to: https://emn178.github.io/online-tools/sha256.html
2. Generate a SHA-256 hash of your password
3. Open `login.html` and replace `YOUR_PASSWORD_HASH_HERE` with your hash

**b) Encrypt your webhook URLs:**
1. Open `script.js` and set an `ENCRYPTION_KEY`
2. Open `index.html` in your browser and open the console (F12)
3. Execute: `encryptWebhookHelper('your-webhook-url', 'your-encryption-key')`
4. Copy the output to `script.js`

See [SECURITY.md](SECURITY.md) for detailed instructions.

### 2. Configure n8n Webhooks

1. **Registration Webhook**:
   - Method: `POST`
   - Path: `hours-registration`
   - Purpose: Receives and stores registered hours
   - Expected data: `id`, `Date`, `Week Number`, `Start Time`, `End Time`, `Break in minutes`, `Notes`
   - Return: 200 OK

2. **Report Webhook**:
   - Method: `POST`
   - Path: `send-weekly-report`
   - Purpose: Sends weekly report email
   - Return: 200 OK

### 3. Hours Helper (Local Data Management)

For manually managing your localStorage data:

- **Location**: Open `hours-helper.html` in your browser
- **Functionality**:
  - Manually add hours to localStorage
  - View and delete existing hours
  - Debug information for troubleshooting
- **Note**: Hours added via the helper are **not** sent to n8n
- **Use case**: Useful for correcting local data or testing the week overview functionality

### 4. Usage

1. Open `login.html` in your browser
2. Log in with your password
3. Register your hours
4. Send weekly reports

## File Structure

- `login.html`: Login page with password protection
- `index.html`: Main page for hours registration
- `hours-helper.html`: Helper tool for manually managing localStorage
- `auth.js`: Authentication and session management
- `script.js`: Form logic and API calls to n8n
- `style.css`: Styling (Glassmorphism, animations, responsive design)
- `SECURITY.md`: Detailed security configuration
- `README.md`: This documentation

## Recommended Additional Security Measures

For production use, we recommend:

1. **HTTPS required** - Always host via HTTPS
2. **CSP Headers** - Configure Content Security Policy headers
3. **n8n authentication** - Add header authentication to your n8n webhooks
4. **Rate limiting** - Limit number of requests per IP
5. **Backup** - Regularly backup your n8n data

See [SECURITY.md](SECURITY.md) for implementation details.

## Screenshots

<img width="1042" height="855" alt="Screenshot 2025-12-09 183641" src="https://github.com/user-attachments/assets/cf4b343b-e681-4321-8e8a-b22212485ce7" />
