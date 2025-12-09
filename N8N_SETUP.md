# n8n Setup Guide voor Multi-Device Synchronisatie

Deze gids helpt je bij het opzetten van de nieuwe "Get Hours" webhook in n8n voor multi-device synchronisatie.

## Overzicht

Je hebt nu **3 webhooks** nodig in n8n:

1. ✅ **Registration Webhook** (bestaand) - Ontvangt en slaat uren op
2. ✅ **Report Webhook** (bestaand) - Verstuurt wekelijkse rapporten
3. 🆕 **Get Hours Webhook** (nieuw) - Haalt uren op voor synchronisatie

## Stap 1: Update je Registration Webhook

Je bestaande registration webhook moet nu ook het `id` veld opslaan. Dit veld is essentieel voor duplicaatpreventie.

### Verwachte data structuur:
```json
{
  "id": "1733752345678-abc123def",
  "Date": "2025-12-09",
  "Week Number": 50,
  "Start Time": "09:00",
  "End Time": "17:00",
  "Break in minutes": 30,
  "Notes": "Project X"
}
```

### Aanbevolen opslag:
- **Google Sheets**: Voeg een kolom "ID" toe als eerste kolom
- **Database**: Gebruik `id` als PRIMARY KEY
- **Airtable**: Maak een "ID" veld met type "Single line text"

## Stap 2: Maak de Get Hours Webhook

### n8n Workflow Setup:

1. **Maak een nieuwe workflow** in n8n
2. **Voeg een Webhook node toe**:
   - Naam: "Get Hours Request"
   - HTTP Method: `POST`
   - Path: `get-hours`
   - Response Mode: "When Last Node Finishes"

3. **Parseer de request body**:
   - De webhook ontvangt: `{ "startDate": "2025-12-04", "endDate": "2025-12-10" }`
   - Deze data bevat de week boundaries (maandag tot zondag)

### Optie A: Google Sheets als data source

4. **Voeg Google Sheets node toe**:
   - Operation: "Read"
   - Document: [Je urenregistratie spreadsheet]
   - Sheet: [Je sheet naam]
   - Range: `A:H` (of je volledige data range)

5. **Filter de data**:
   - Voeg een "Filter" node toe
   - Condition 1: `{{ $json.Date }} >= {{ $('Get Hours Request').item.json.body.startDate }}`
   - Condition 2: `{{ $json.Date }} <= {{ $('Get Hours Request').item.json.body.endDate }}`

6. **Format de response**:
   - Voeg een "Set" node toe om de data te structureren
   - Zorg dat alle velden aanwezig zijn: `id`, `Date`, `Week Number`, etc.

7. **Return de response**:
   - Voeg een "Respond to Webhook" node toe
   - Response Code: 200
   - Body: `{{ $json }}`

### Optie B: Database als data source

4. **Voeg een database query node toe** (PostgreSQL, MySQL, etc.):
   ```sql
   SELECT * FROM hours_registration
   WHERE date BETWEEN :startDate AND :endDate
   ORDER BY date ASC
   ```

5. **Format de response**:
   - Voeg een "Respond to Webhook" node toe
   - Response Code: 200
   - Body: De query resultaten

### Voorbeeld response format:
```json
[
  {
    "id": "1733752345678-abc123def",
    "Date": "2025-12-09",
    "Week Number": 50,
    "Start Time": "09:00",
    "End Time": "17:00",
    "Break in minutes": 30,
    "Notes": "Project X",
    "timestamp": "2025-12-09T08:45:32.123Z"
  },
  {
    "id": "1733838745678-xyz789ghi",
    "Date": "2025-12-10",
    "Week Number": 50,
    "Start Time": "08:30",
    "End Time": "16:30",
    "Break in minutes": 45,
    "Notes": "Meeting + development"
  }
]
```

## Stap 3: Configureer de Webhook URL in je Website

1. **Kopieer de webhook URL** uit n8n (bijv. `https://jouw-n8n.com/webhook/get-hours`)

2. **Open de browser console** (F12) op je website

3. **Encrypt de webhook URL**:
   ```javascript
   encryptWebhookHelper('https://jouw-n8n.com/webhook/get-hours', 'JE_ENCRYPTION_KEY')
   ```

4. **Update `script.js`**:
   - Open `script.js`
   - Vervang `YOUR_GET_HOURS_WEBHOOK_ENC_HERE` met de encrypted URL
   - Save en deploy

## Stap 4: Test de Synchronisatie

1. **Registreer uren op je laptop**
2. **Open de site op je telefoon**
3. **Klik op de 🔄 sync knop** in het weekoverzicht
4. **Controleer of de uren verschijnen**

### Troubleshooting:

- **Geen data zichtbaar**: Check de browser console (F12) voor errors
- **CORS errors**: Zorg dat je n8n instance CORS toestaat voor je website
- **Lege response**: Controleer of de date filter correct werkt in n8n
- **Duplicaten**: Zorg dat het `id` veld correct wordt opgeslagen en gebruikt

## Best Practices

1. **Bewaar alle data in n8n**: Gebruik n8n als de "single source of truth"
2. **Backup regelmatig**: Maak backups van je Google Sheet of database
3. **Monitor webhook calls**: Houd de n8n logs in de gaten voor errors
4. **Rate limiting**: Implementeer rate limiting als je veel sync requests verwacht

## n8n Workflow Template (Google Sheets)

Hier is een complete workflow snippet die je kunt importeren:

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "get-hours",
        "responseMode": "lastNode"
      },
      "name": "Get Hours Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "operation": "read",
        "documentId": "YOUR_SHEET_ID",
        "sheetName": "Sheet1",
        "range": "A:H"
      },
      "name": "Read Google Sheet",
      "type": "n8n-nodes-base.googleSheets"
    },
    {
      "parameters": {
        "conditions": {
          "and": [
            {
              "leftValue": "={{ $json.Date }}",
              "rightValue": "={{ $node['Get Hours Webhook'].json.body.startDate }}",
              "operation": "largerEqual"
            },
            {
              "leftValue": "={{ $json.Date }}",
              "rightValue": "={{ $node['Get Hours Webhook'].json.body.endDate }}",
              "operation": "smallerEqual"
            }
          ]
        }
      },
      "name": "Filter by Date Range",
      "type": "n8n-nodes-base.if"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook"
    }
  ]
}
```

## Volgende Stappen

Na het opzetten van de synchronisatie:

1. Test op meerdere apparaten (laptop, telefoon, tablet)
2. Controleer of oude data ook wordt gesynchroniseerd
3. Verwijder eventueel oude localStorage data: `localStorage.clear()`
4. Reload de pagina om fresh te starten

## Vragen of Problemen?

Check de browser console voor error messages en n8n execution logs voor webhook calls.
