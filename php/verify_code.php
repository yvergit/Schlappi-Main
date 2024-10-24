<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_code = $_POST['code'];

    // Check if the entered code matches the one stored in session
    if ($user_code == $_SESSION['verification_code']) {
        echo 'valid'; // Send back "valid" if the code is correct
    } else {
        echo 'invalid'; // Send back "invalid" if the code is incorrect
    }
}
?>
