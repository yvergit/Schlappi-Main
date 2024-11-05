import { init_upload } from "./app.js";

let canRequestCode = true; // Flag to control code request
const requestCooldown = 30000; // 30 seconds in milliseconds
let countdownTimer; // Variable to hold the countdown timer

// Helper functions to set and get cookies
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
}

// Function to start the countdown
function startCooldownTimer(duration) {
    let remainingTime = duration / 1000; // Convert milliseconds to seconds
    document.getElementById('timerMessage').style.display = 'block'; // Show timer message

    countdownTimer = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(countdownTimer);
            canRequestCode = true;
            document.getElementById('timerMessage').style.display = 'none'; // Hide timer message
            document.getElementById('timerMessage').innerText = ""; // Clear timer text
        } else {
            document.getElementById('timerMessage').innerText = `Je kunt weer een verificatiecode aanvragen in ${remainingTime} seconden.`;
            remainingTime--;
        }
    }, 1000); // Update every second
}

// Check if the user is already verified
if (getCookie('verified') === 'true') {
    document.getElementById('email').style.display = 'none';
    init_upload(); // Skip verification and proceed to upload section
}

// Request verification code
document.getElementById('requestCodeButton').addEventListener('click', function() {
    const email = document.getElementById('emailInput').value;

    // Validate the email address
    if (!email) {
        alert("Vul een geldig e-mailadres in.");
        return;
    }

    if (!canRequestCode) {
        alert("Je kunt slechts eenmaal in de 30 seconden een verificatiecode aanvragen.");
        return;
    }

    // Send a request to PHP to send the verification code
    fetch('php/send_verification.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'email=' + encodeURIComponent(email)
    })
    .then(response => response.text())
    .then(result => {
        alert(result); // Display the message returned by the PHP script
        console.log(result);
        // Check if the response indicates that the verification code was sent
        if (result.includes("Verificatiecode verzonden")) {
            document.getElementById('verificationCodeInput').style.display = 'block';
            document.getElementById('verifyCodeButton').style.display = 'block';
            document.getElementById('spamCheckMessage').style.display = 'block'; // Show spam check message

            // Start cooldown timer
            canRequestCode = false;
            startCooldownTimer(requestCooldown); // Start the countdown timer
        }
    })
    .catch(error => {
        console.error('Error sending verification code:', error);
    });
});

// Verify the entered code
document.getElementById('verifyCodeButton').addEventListener('click', function() {
    const userCode = document.getElementById('verificationCodeInput').value;

    // Send the code entered by the user to PHP for verification
    fetch('php/verify_code.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'code=' + encodeURIComponent(userCode)
    })
    .then(response => response.text())
    .then(result => {
        if (result === 'valid') {
            // Disable email and code input fields
            document.getElementById('email').style.display = 'none';

            // Set a cookie to remember the verification for 30 days
            setCookie('verified', 'true', 30);

            // Show the file upload section
            init_upload();
        } else {
            document.getElementById('codeStatus').style.display = 'block'; // Show error message
        }
    })
    .catch(error => {
        console.error('Error verifying code:', error);
    });
});
