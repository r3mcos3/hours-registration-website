# Hours Registration Website

This website is designed to work with n8n for registering hours and sending weekly reports.

## Security Features

✅ **Login beveiliging** - Wachtwoordbeveiliging voor toegang
✅ **Versleutelde webhooks** - Webhook URLs zijn encrypted in de code
✅ **Input validatie** - Alle gebruikersinput wordt gevalideerd en gesanitized
✅ **Session management** - Automatische uitlog na 24 uur
✅ **Subresource Integrity** - Externe scripts zijn beschermd

⚠️ **BELANGRIJK**: Lees [SECURITY.md](SECURITY.md) voor complete configuratie-instructies!

## Quick Start

### 1. Configureer Beveiliging

**a) Stel je wachtwoord in:**
1. Ga naar: https://emn178.github.io/online-tools/sha256.html
2. Genereer een SHA-256 hash van je wachtwoord
3. Open `login.html` en vervang `YOUR_PASSWORD_HASH_HERE` met je hash

**b) Versleutel je webhook URLs:**
1. Open `script.js` en stel een `ENCRYPTION_KEY` in
2. Open `index.html` in je browser en open de console (F12)
3. Voer uit: `encryptWebhookHelper('je-webhook-url', 'je-encryption-key')`
4. Kopieer de output naar `script.js`

Zie [SECURITY.md](SECURITY.md) voor gedetailleerde instructies.

### 2. Configureer n8n Webhooks

1. **Registration Webhook**:
   - Method: `POST`
   - Path: `hours-registration`
   - Return: 200 OK

2. **Report Webhook**:
   - Method: `POST`
   - Path: `send-weekly-report`
   - Return: 200 OK

### 3. Gebruik

1. Open `login.html` in je browser
2. Log in met je wachtwoord
3. Registreer je uren
4. Verstuur wekelijkse rapporten

## File Structure

- `login.html`: Login pagina met wachtwoordbeveiliging
- `index.html`: Hoofdpagina voor urenregistratie
- `auth.js`: Authenticatie en session management
- `script.js`: Formulier logica en API calls naar n8n
- `style.css`: Styling (Glassmorphism, animaties, responsive design)
- `SECURITY.md`: Gedetailleerde beveiligingsconfiguratie
- `README.md`: Deze documentatie

## Aanbevolen Extra Beveiligingsmaatregelen

Voor productiegebruik raden we aan:

1. **HTTPS verplicht** - Host altijd via HTTPS
2. **CSP Headers** - Configureer Content Security Policy headers
3. **n8n authenticatie** - Voeg header authentication toe aan je n8n webhooks
4. **Rate limiting** - Beperk aantal requests per IP
5. **Backup** - Maak regelmatig backups van je n8n data

Zie [SECURITY.md](SECURITY.md) voor implementatie details.

## Screenshots

<img width="1049" height="871" alt="image" src="https://github.com/user-attachments/assets/fb529fbb-645d-4ffa-876d-76265e740e08" />
