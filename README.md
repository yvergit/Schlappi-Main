## .env Bestanden in de PHP Map
In de `php` map moet een `.env` bestand worden toegevoegd. Hierin worden de e-mailadres, het wachtwoord en de SMTP-instellingen opgeslagen. In dit geval alleen de user en pass aanpassen. 

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
        "thijnbroekhuizen@gmail.com"
    ]
}
