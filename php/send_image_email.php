<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'load_env.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';
require 'PHPMailer-master/src/Exception.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data from request
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['image'])) {
        $imageData = $data['image'];

        // Remove "data:image/jpg;base64," prefix from the image data
        $imageBase64 = preg_replace('#^data:image/\w+;base64,#i', '', $imageData);
        $imageBinary = base64_decode($imageBase64);

        if ($imageBinary === false) {
            echo "Kon afbeelding niet decoderen.";
            exit;
        }

        // Create a temporary file for the image
        $tempFilePath = tempnam(sys_get_temp_dir(), 'screenshot_') . '.jpg';
        file_put_contents($tempFilePath, $imageBinary);

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
            $mail->addAddress(getenv('IMAGE_RECIEVER')); // Replace with your fixed email address

            // Attach the image
            $mail->addAttachment($tempFilePath, 'screenshot.jpg');

            $mail->isHTML(true);
            $mail->Subject = 'Nieuwe afbeelding van de gebruiker';
            $mail->Body    = 'Zie de bijlage voor de verzonden afbeelding.';

            $mail->send();

            echo "Afbeelding succesvol verzonden.";
        } catch (Exception $e) {
            echo "Er is een fout opgetreden bij het verzenden van de e-mail. Mailer Error: {$mail->ErrorInfo}";
        } finally {
            // Remove temporary file
            if (file_exists($tempFilePath)) {
                unlink($tempFilePath);
            }
        }
    } else {
        echo "Geen afbeelding ontvangen.";
    }
}
?>
