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

// Check if the JSON file exists and read it
if (file_exists($allowed_emails_file)) {
    $json_data = file_get_contents($allowed_emails_file);
    $data = json_decode($json_data, true);
    
    if (isset($data['allowed_emails'])) {
        $allowed_emails = $data['allowed_emails'];
    }
} else {
    echo "Allowed emails configuration file not found.";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // recipient email adress
    $recipient_email = $_POST['email'];

    // Check if email adress
    if (!filter_var($recipient_email, FILTER_VALIDATE_EMAIL)) {
        echo "Ongeldig e-mailadres.";
        exit;
    }

    // Check if email in allowed email adresses
    if (!in_array($recipient_email, $allowed_emails)) {
        echo "Dit e-mailadres is niet toegestaan om een verificatiecode aan te vragen.";
        exit;
    }

    // Generate a random verification code
    $verification_code = rand(100000, 999999);

    // Store the verification code in the session
    $_SESSION['verification_code'] = $verification_code;

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST');
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER'); 
        $mail->Password   = getenv('SMTP_PASS'); 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
        $mail->Port       = getenv('SMTP_PORT'); 

        // Recipients and from
        $mail->setFrom(getenv('SMTP_USER'), 'Schlappi Markiezen'); 
        $mail->addAddress($recipient_email); 

        // Email content
        $mail->isHTML(true); 
        $mail->Subject = 'Je verificatiecode';
        $mail->Body    = "Je verificatiecode is: <strong>$verification_code</strong>";

        // Send the email
        $mail->send();
        echo "Verificatiecode verzonden naar $recipient_email.";
    } catch (Exception $e) {
        echo "Verzenden van e-mail is mislukt. Mailer Error: {$mail->ErrorInfo}";
    }
}
?>
