# MongoDB Atlas Setup - BELANGRIJK!

## Wat is MongoDB Atlas?
Een gratis cloud database die ervoor zorgt dat alle wijzigingen (spelers, scores, aanwezigheden) permanent worden opgeslagen. Nu werkt alles ook perfect op Render!

## Setup instructies:

### 1. Maak een lokale .env file:

Kopieer `.env.example` naar `.env` en vul je MongoDB wachtwoord in:

```bash
MONGODB_URI=mongodb+srv://benjaminvaneynde_db_user:JOUW_WACHTWOORD_HIER@cluster0.agezyg9.mongodb.net/fc-verachtert?appName=Cluster0
PORT=3000
```

Vervang `JOUW_WACHTWOORD_HIER` met het wachtwoord dat je hebt ingesteld bij MongoDB Atlas.

### 2. Configureer Render:

1. Ga naar je Render dashboard
2. Selecteer je "fc-verachtert-tracker" service
3. Ga naar "Environment"
4. Klik "Add Environment Variable"
5. Voeg toe:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://benjaminvaneynde_db_user:JOUW_WACHTWOORD@cluster0.agezyg9.mongodb.net/fc-verachtert?appName=Cluster0`

### 3. Test lokaal:

```bash
npm run dev
```

Je zou moeten zien:
```
✅ Connected to MongoDB Atlas
Migrating 58 matches to MongoDB...
✅ Migration complete!
Migrating 18 players to MongoDB...
✅ Player migration complete!
```

### 4. Deploy naar Render:

```bash
git add .
git commit -m "Add MongoDB Atlas integration"
git push origin main
```

Render zal automatisch deployen met de nieuwe database!

## Hoe werkt het?

### Met MongoDB (production):
- Alle wijzigingen worden PERMANENT opgeslagen in de cloud
- Werkt op Render, lokaal, en op je telefoon
- Data blijft behouden bij restarts

### Zonder MongoDB (fallback):
- Gebruikt JSON files (zoals voorheen)
- Werkt alleen lokaal
- Data gaat verloren bij Render restart

## Troubleshooting:

**"MongoDB connection error"**
- Check of je wachtwoord correct is in .env
- Check of IP whitelist is ingesteld op 0.0.0.0/0 in MongoDB Atlas

**"Data wordt niet opgeslagen"**
- Check of MONGODB_URI environment variable is ingesteld in Render
- Check de logs in Render dashboard

**Oude data migreren:**
De app migreert automatisch je bestaande JSON data naar MongoDB bij de eerste start!

## Kosten:

MongoDB Atlas Free Tier:
- ✅ 100% GRATIS
- ✅ 512MB storage (meer dan genoeg)
- ✅ Geen creditcard nodig
- ✅ Permanent beschikbaar
