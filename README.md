## .env Bestanden in de PHP Map
In de `php` map moet een `.env` bestand worden toegevoegd. Hierin worden de e-mailadres, het wachtwoord en de SMTP-instellingen opgeslagen. In dit geval alleen de user en pass aanpassen. (goed beveiligd)

### Voorbeeld `.env` bestand
SMTP_HOST=smtp.gmail.com

SMTP_PORT=587

SMTP_USER=testschlappi@gmail.com # hier e-mailadres

SMTP_PASS=your_email_password_here # hier e-mail app wachtwoord (hieronder link naar uitleg)

## Link naar uitleg van wachtwoord aanmaken voor app.
https://help.accredible.com/s/article/smtp-setup-in-gmail-inbox?language=en_US

## allowed_emails.json bestand in de PHP map
In de PHP map moet een 'allowed_emails.json' bestand worden toegevoegd met alle toegestane emails.

### Voorbeeld 'allowed_emails.json' bestand
{
    "allowed_emails":
    [
        "dennis.vanden.broek@indicia.nl"
    ]
}

## Doeken of bakken toevoegen.
Bij het toevoegen van nieuwe doek materialen of nieuwe bak materialen. Moet je naar de map obj/textures gaan. In deze map staan de mappen bak en doeken.
Als je een bak of een doek wilt toevoegen moet je de benaming en de nummering aanhouden zoals het er staat. Bijvoorbeeld: doek15.png is de laatste doek, voeg dan doek16.png toe.
Om hem in de wilt toevoegen, volg dan de stappen die staan bij de functiebeschrijving in createMaterialButtons() in js/secondary_functions/materialAndBakButton.js

## Nieuwe objecten toevoegen.
Bij het toevoegen van nieuwe objecten moet je kijken naar de functiebeschrijving in de functie createSelectObjectButtons() in js/secondary_functions/selectObjectButtons.js
Als je objecten toevoged in de lijst availableObjects in app.js. Moet je ervoor zorgen dat er voor 1 object de varianten zonder bak, straight en straight zonder bak bestaan.
