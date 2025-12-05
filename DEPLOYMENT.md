# Deployment Guide - Netlify

Deze handleiding helpt je om de Hours Registration Website te deployen op Netlify.

## Voorbereiding

Voordat je deploy, controleer dat je het volgende hebt gedaan:

- ✅ Wachtwoord hash geconfigureerd in `login.html`
- ✅ Webhook URLs encrypted in `script.js`
- ✅ `netlify.toml` aanwezig in de root directory
- ✅ `.gitignore` aanwezig (zorgt ervoor dat helper tools niet worden gedeployed)

## Optie 1: Deploy via GitHub (Aanbevolen)

### Stap 1: Push naar GitHub

```bash
# Als je nog geen git repository hebt geïnitialiseerd:
git init

# Voeg alle bestanden toe (helper tools worden genegeerd door .gitignore)
git add .

# Maak een commit
git commit -m "🔐 Configureer beveiligde urenregistratie website"

# Maak een nieuwe repository op GitHub en push:
git remote add origin https://github.com/jouw-username/hours-registration.git
git branch -M main
git push -u origin main
```

### Stap 2: Verbind met Netlify

1. Ga naar [netlify.com](https://netlify.com) en log in
2. Klik op **"Add new site"** → **"Import an existing project"**
3. Kies **"Deploy with GitHub"**
4. Selecteer je repository
5. Netlify detecteert automatisch de `netlify.toml` configuratie
6. Klik op **"Deploy site"**

### Stap 3: Custom Domain (Optioneel)

1. In Netlify dashboard → **"Domain settings"**
2. Klik op **"Add custom domain"**
3. Volg de instructies om je domein te configureren
4. Netlify configureert automatisch HTTPS via Let's Encrypt

## Optie 2: Deploy via Netlify Drop

### Stap 1: Verwijder Helper Tools

Zorg ervoor dat deze bestanden NIET in je deployment zitten:
- `password-hasher.html`
- `webhook-encrypter.html`

### Stap 2: Deploy

1. Ga naar [netlify.com/drop](https://app.netlify.com/drop)
2. Sleep je project folder naar de Netlify Drop zone
3. Wacht tot de deployment compleet is
4. Je site is nu live!

⚠️ **Let op:** Bij deze methode moet je handmatig updaten bij elke wijziging.

## Optie 3: Netlify CLI

### Installatie

```bash
npm install -g netlify-cli
```

### Deploy

```bash
# Login
netlify login

# Initialize (eerste keer)
netlify init

# Deploy naar production
netlify deploy --prod
```

## Na Deployment

### 1. Test je website

Ga naar je Netlify URL (bijv. `https://jouw-site-naam.netlify.app`) en test:

- ✅ Login pagina wordt geladen
- ✅ Je kunt inloggen met je wachtwoord
- ✅ Urenregistratie formulier werkt
- ✅ Test een uren registratie (check of n8n het ontvangt)
- ✅ Test de weekrapportage knop
- ✅ Uitlog functie werkt

### 2. Controleer Security Headers

Test je security headers op: https://securityheaders.com

Je zou een **A** of **A+** score moeten krijgen.

### 3. Controleer HTTPS

- Ga naar je site via `http://` - dit moet redirecten naar `https://`
- Controleer of het groene slotje in je browser verschijnt

### 4. Test n8n Integratie

1. Registreer testuren via de website
2. Check of de data aankomt in je n8n workflow
3. Test de weekrapportage functie
4. Controleer of de email wordt verstuurd

## Troubleshooting

### Website laadt niet

- Check of de deployment succesvol was in Netlify dashboard
- Kijk in de Netlify deploy logs voor errors

### Login werkt niet

- Controleer of je de juiste wachtwoord hash hebt gebruikt
- Open browser console (F12) voor JavaScript errors
- Test je wachtwoord opnieuw in `password-hasher.html`

### Webhook errors

- Controleer of je n8n webhooks actief zijn
- Test de webhook URLs direct met Postman of curl
- Check of de encrypted URLs correct zijn
- Open browser console voor network errors
- Controleer of het n8n domein correct is in `netlify.toml`

### CORS errors

Als je CORS errors ziet:
1. Controleer of het n8n domein correct is in `netlify.toml` (connect-src)
2. In je n8n workflow, zorg dat de webhook node CORS headers toestaat
3. Voeg deze headers toe aan je n8n webhook response:
   - `Access-Control-Allow-Origin: https://jouw-site.netlify.app`
   - `Access-Control-Allow-Methods: POST, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type`

## Environment Variables (Optioneel)

Voor extra beveiliging kun je de encryption key als environment variable opslaan:

1. Netlify Dashboard → **Site settings** → **Environment variables**
2. Voeg toe: `ENCRYPTION_KEY` = `je-encryption-key`
3. In `script.js`, wijzig:
   ```javascript
   // Voor static sites werkt dit niet direct, maar je kunt een build step toevoegen
   ```

⚠️ **Let op:** Dit vereist een build process. Voor pure static sites is de huidige implementatie voldoende.

## Updates Deployen

### Via GitHub

```bash
# Maak wijzigingen
# ...

# Commit en push
git add .
git commit -m "📝 Update website"
git push
```

Netlify deploy automatisch bij elke push naar main/master.

### Via Netlify CLI

```bash
netlify deploy --prod
```

## Beveiliging Checklist voor Productie

- ✅ HTTPS geforceerd via netlify.toml
- ✅ Security headers actief (CSP, X-Frame-Options, etc.)
- ✅ Wachtwoord is sterk (min. 12 karakters)
- ✅ Encryption key is random en sterk
- ✅ Helper tools niet gedeployed (.gitignore)
- ✅ n8n webhooks werken correct
- ✅ Alle functionaliteit getest
- ✅ Security score gecontroleerd

## Backup

Maak regelmatig backups van:
- Je n8n workflows
- Je database (indien van toepassing)
- De configuratie files (git repository is je backup)

## Monitoring

### Netlify Analytics (Optioneel)

Schakel Netlify Analytics in voor:
- Traffic monitoring
- Top pages
- Traffic sources

### n8n Monitoring

Configureer monitoring voor je n8n workflows:
- Error notifications
- Webhook failure alerts
- Data logging

## Support

Bij problemen:
- Check `SECURITY.md` voor security configuratie
- Check `README.md` voor algemene info
- Open een issue in de GitHub repository

## Kosten

**Netlify Free Tier** is meer dan voldoende voor dit project:
- 100 GB bandwidth/maand
- 300 build minuten/maand (niet nodig voor static sites)
- Automatische HTTPS
- Global CDN

Geen kosten totdat je deze limieten overschrijdt.

---

🎉 **Gefeliciteerd!** Je beveiligde urenregistratie website is nu live!
