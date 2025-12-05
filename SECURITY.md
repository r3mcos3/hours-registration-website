# Beveiligingsconfiguratie

Dit document beschrijft hoe je de beveiligingsfuncties van de urenregistratie website configureert.

## Beveiligingsfuncties

De website bevat de volgende beveiligingsmaatregelen:

1. **Wachtwoordbeveiliging** - Login vereist voor toegang
2. **Versleutelde Webhook URLs** - Webhook URLs zijn versleuteld in de code
3. **Input Sanitization** - Alle gebruikersinput wordt gevalideerd en gesanitized
4. **Session Management** - Automatische uitlog na 24 uur
5. **Subresource Integrity (SRI)** - Externe scripts zijn beschermd tegen tampering

## Configuratie Stappen

### 1. Wachtwoord Instellen

Het wachtwoord wordt opgeslagen als SHA-256 hash in `login.html`.

**Stap-voor-stap:**

1. Ga naar: https://emn178.github.io/online-tools/sha256.html
2. Voer je gewenste wachtwoord in
3. Kopieer de SHA-256 hash (64 karakters lang)
4. Open `login.html` in een teksteditor
5. Zoek naar de regel: `const PASSWORD_HASH = 'YOUR_PASSWORD_HASH_HERE';`
6. Vervang `YOUR_PASSWORD_HASH_HERE` met je hash

**Voorbeeld:**
```javascript
// Wachtwoord: mijngeheimwachtwoord123
const PASSWORD_HASH = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
```

### 2. Webhook URLs Versleutelen

De webhook URLs moeten versleuteld worden om ze te beschermen.

**Stap-voor-stap:**

1. Kies een willekeurige encryptie sleutel (bijv. `mijn-geheime-sleutel-xyz789`)
2. Open `script.js` in een teksteditor
3. Vervang `YOUR_RANDOM_ENCRYPTION_KEY_HERE` met je gekozen sleutel

4. Open `index.html` in een browser
5. Open de Browser Console (F12 → Console tab)
6. Voer het volgende commando uit voor je registratie webhook:
   ```javascript
   encryptWebhookHelper('https://n8n.example.com/webhook/hours-registration', 'mijn-geheime-sleutel-xyz789')
   ```
7. Kopieer de encrypted output
8. Plak deze in `script.js` bij `REGISTRATION_WEBHOOK_ENC`

9. Herhaal stap 6-8 voor je report webhook:
   ```javascript
   encryptWebhookHelper('https://n8n.example.com/webhook/send-weekly-report', 'mijn-geheime-sleutel-xyz789')
   ```
10. Plak deze in `script.js` bij `REPORT_WEBHOOK_ENC`

**Voorbeeld configuratie in `script.js`:**
```javascript
const CONFIG = {
    ENCRYPTION_KEY: 'mijn-geheime-sleutel-xyz789',
    REGISTRATION_WEBHOOK_ENC: 'aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1f=',
    REPORT_WEBHOOK_ENC: 'zA7bC9dE1faB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5=',
};
```

### 3. n8n Webhook Configuratie

Om extra beveiliging toe te voegen aan je n8n webhooks:

1. **Header Authentication** (optioneel maar aanbevolen):
   - In je n8n workflow, voeg een `IF` node toe na de Webhook node
   - Check op een custom header: `X-Auth-Token`
   - Voeg deze header toe in `script.js` in de fetch calls:
     ```javascript
     headers: {
         'Content-Type': 'application/json',
         'X-Auth-Token': 'je-geheime-token-hier'
     }
     ```

2. **IP Whitelisting** (als je n8n zelf host):
   - Beperk toegang tot je webhooks tot specifieke IP adressen
   - Configureer dit in je firewall of reverse proxy

3. **Rate Limiting**:
   - Voeg rate limiting toe in n8n of je reverse proxy
   - Bijvoorbeeld: max 10 requests per minuut per IP

### 4. Content Security Policy (CSP)

Als je de website host via een webserver (Apache, Nginx, etc.), voeg deze headers toe:

**Voor Nginx (`nginx.conf`):**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://npmcdn.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://n8n.yourdomain.com; img-src 'self' data:;" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

**Voor Apache (`.htaccess` of `httpd.conf`):**
```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://npmcdn.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://n8n.yourdomain.com; img-src 'self' data:;"
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

### 5. HTTPS Vereist

⚠️ **BELANGRIJK**: Host deze website ALTIJD via HTTPS, nooit HTTP.

- Gebruik Let's Encrypt voor gratis SSL certificaten
- Of gebruik een hosting provider die automatisch HTTPS aanbiedt (Netlify, Vercel, GitHub Pages, etc.)

## Beveiligingschecklist voor Productie

Voordat je de website online zet:

- [ ] Wachtwoord hash is ingesteld in `login.html`
- [ ] Encryptie sleutel is ingesteld in `script.js`
- [ ] Beide webhook URLs zijn encrypted en ingesteld
- [ ] Test de login functionaliteit
- [ ] Test de urenregistratie
- [ ] Test de weekrapportage
- [ ] Website wordt gehost via HTTPS
- [ ] (Optioneel) CSP headers zijn geconfigureerd
- [ ] (Optioneel) Header authentication toegevoegd aan n8n
- [ ] (Optioneel) Rate limiting actief

## Wachtwoord Wijzigen

Als je je wachtwoord wilt wijzigen:

1. Genereer een nieuwe SHA-256 hash voor je nieuwe wachtwoord
2. Vervang de hash in `login.html`
3. Upload het aangepaste bestand naar je server

## Webhook URLs Wijzigen

Als je webhook URLs wijzigt:

1. Gebruik de `encryptWebhookHelper()` functie opnieuw
2. Vervang de encrypted values in `script.js`
3. Upload het aangepaste bestand naar je server

## Veelgestelde Vragen

**Q: Is deze beveiliging voldoende voor productiegebruik?**
A: Voor privégebruik (1-10 gebruikers) is dit voldoende. Voor grotere teams wordt een echte backend met database aanbevolen.

**Q: Kan iemand mijn wachtwoord achterhalen?**
A: De SHA-256 hash kan niet worden teruggerekend naar het originele wachtwoord. Kies wel een sterk wachtwoord (min. 12 karakters, mix van letters, cijfers, symbolen).

**Q: Kan iemand mijn webhook URLs zien?**
A: Ze zijn versleuteld in de code, maar met voldoende moeite kunnen ze worden gedecrypt. Voor maximale beveiliging, voeg header authentication toe in n8n.

**Q: Wat gebeurt er als iemand mijn encryptie sleutel vindt?**
A: Ze kunnen dan de webhook URLs decrypten. Daarom is het belangrijk om ook authenticatie toe te voegen in n8n zelf (via headers of API keys).

## Rapporteer Beveiligingsproblemen

Als je een beveiligingsprobleem vindt, open dan een issue in de GitHub repository.
