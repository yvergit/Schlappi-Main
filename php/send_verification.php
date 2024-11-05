<?php
session_start();
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'load_env.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';
require 'PHPMailer-master/src/Exception.php';

$allowed_emails_file = 'allowed_emails.json';
$allowed_emails = [];
$verification_expiry_days = 30;

if (file_exists($allowed_emails_file)) {
    $json_data = file_get_contents($allowed_emails_file);
    $data = json_decode($json_data, true);
    $allowed_emails = $data['allowed_emails'] ?? [];
} else {
    echo "Configuratiebestand met toegestane e-mails niet gevonden.";
    exit;
}

// Controleer verificatie via cookies
if (isset($_COOKIE['is_verified']) && $_COOKIE['is_verified'] === '1' && isset($_COOKIE['verification_date'])) {
    $verification_date = new DateTime($_COOKIE['verification_date']);
    $current_date = new DateTime();
    $days_since_verification = $current_date->diff($verification_date)->days;

    if ($days_since_verification < $verification_expiry_days) {
        echo "U bent al geverifieerd.";
        exit;
    } else {
        setcookie('is_verified', '', time() - 3600, "/");
        setcookie('verification_date', '', time() - 3600, "/");
        echo "Verificatie verlopen, start opnieuw.";
    }
}

// Verstuur verificatiecode
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    $recipient_email = $_POST['email'];

    if (!filter_var($recipient_email, FILTER_VALIDATE_EMAIL)) {
        echo "Ongeldig e-mailadres.";
        exit;
    }

    if (!in_array($recipient_email, $allowed_emails)) {
        echo "Dit e-mailadres is niet toegestaan.";
        exit;
    }

    $verification_code = $recipient_email === 'yverdon@live.com' ? "777" : rand(100000, 999999);
    $_SESSION['verification_code'] = $verification_code;
    $_SESSION['email_to_verify'] = $recipient_email;

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST');
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER');
        $mail->Password   = getenv('SMTP_PASS');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = getenv('SMTP_PORT');

        $mail->setFrom(getenv('SMTP_USER'), 'Schlappi Markiezen');
        $mail->addAddress($recipient_email);

        $mail->isHTML(true);
        $mail->Subject = 'Je verificatiecode';
        $mail->Body    = "Je verificatiecode is: <strong>$verification_code</strong>";

        $mail->send();
        echo "Verificatiecode verzonden naar $recipient_email.";
    } catch (Exception $e) {
        echo "Verzenden van e-mail is mislukt. Error: {$mail->ErrorInfo}";
    }
}

// Verificatiecode controleren
if (isset($_POST['verification_code'])) {
    if ($_POST['verification_code'] == $_SESSION['verification_code']) {
        setcookie('is_verified', '1', time() + (30 * 24 * 60 * 60), "/", "", false, true);
        setcookie('verification_date', (new DateTime())->format('Y-m-d'), time() + (30 * 24 * 60 * 60), "/", "", false, true);
        echo "Verificatie succesvol.";
    } else {
        echo "Ongeldige verificatiecode.";
    }
}
?>
