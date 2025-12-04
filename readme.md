# Hours Registration Website

This website is designed to work with n8n for registering hours and sending weekly reports.

## Installation & Configuration

1. **Set up Webhooks in n8n**:
   - Open your n8n workflow.
   - **Registration**: Replace the `Form Trigger` node (or add one) with a `Webhook` node.
     - Method: `POST`
     - Path: `hours-registration` (or similar)
     - Ensure the webhook responds with a 200 OK.
   - **Reporting**: Replace the `Schedule Trigger` node (or add one) with a `Webhook` node.
     - Method: `POST` (or `GET`)
     - Path: `send-weekly-report`

2. **Configure URLs**:
   - Open `script.js` in this directory.
   - Locate the `CONFIG` section at the top of the file.
   - Replace `YOUR_REGISTRATION_WEBHOOK_URL_HERE` with the production URL of your registration webhook.
   - Replace `YOUR_REPORT_WEBHOOK_URL_HERE` with the production URL of your reporting webhook.

   Example:
   ```javascript
   const CONFIG = {
       REGISTRATION_WEBHOOK: 'https://n8n.yourdomain.com/webhook/hours-registration',
       REPORT_WEBHOOK: 'https://n8n.yourdomain.com/webhook/send-weekly-report'
   };
   ```

3. **Usage**:
   - Open `index.html` in your browser.
   - Fill in your hours and click "Register".
   - Click "Send Email" to generate the weekly report.

## Structure
- `index.html`: The main structure of the page.
- `style.css`: All styling (Glassmorphism, animations, responsive design).
- `script.js`: Logic for the form and API calls to n8n.
