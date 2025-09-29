<?php
/**
 * Contact Form Handler for Robotics & Control Ltd
 * Plesk SMTP Email Processing
 * 
 * Configure SMTP settings in Plesk Control Panel:
 * - Mail Settings > Authentication Required
 * - Use your domain's email account credentials
 */

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CSRF protection (add this to your contact form as a hidden field)
session_start();

// Configuration - Update these settings in Plesk
$smtp_host = 'localhost'; // Plesk default SMTP
$smtp_port = 587; // or 465 for SSL
$smtp_secure = 'tls'; // or 'ssl'
$smtp_username = 'info@rcltd.ie'; // Your domain email
$smtp_password = ''; // Set in Plesk email account

$from_email = 'info@rcltd.ie';
$from_name = 'RC Ltd Contact Form';

// Response function
function sendResponse($success, $message) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit();
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Validate and sanitize input
$name = isset($_POST['name']) ? trim(filter_var($_POST['name'], FILTER_SANITIZE_STRING)) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$company = isset($_POST['company']) ? trim(filter_var($_POST['company'], FILTER_SANITIZE_STRING)) : '';
$phone = isset($_POST['phone']) ? trim(filter_var($_POST['phone'], FILTER_SANITIZE_STRING)) : '';
$service = isset($_POST['service']) ? trim(filter_var($_POST['service'], FILTER_SANITIZE_STRING)) : '';
$department = isset($_POST['department']) ? trim(filter_var($_POST['department'], FILTER_SANITIZE_EMAIL)) : '';
$message = isset($_POST['message']) ? trim(filter_var($_POST['message'], FILTER_SANITIZE_STRING)) : '';

// Required field validation
if (empty($name) || empty($email) || empty($message)) {
    sendResponse(false, 'Please fill in all required fields');
}

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Please enter a valid email address');
}

// Department email validation and routing
$valid_departments = [
    'info@rcltd.ie',
    'chelsey.omahony@rcltd.ie',
    'morgan@rcltd.ie',
    'benedict.larkin@rcltd.ie', // Normalized to lowercase
    'lmccormack@rcltd.ie'
];

// Normalize department email to lowercase for comparison
$department_normalized = !empty($department) ? strtolower(trim($department)) : '';

// Determine recipient email based on department selection
$to_email = 'info@rcltd.ie'; // Default fallback
if (!empty($department_normalized) && in_array($department_normalized, $valid_departments)) {
    $to_email = $department_normalized;
}

// Rate limiting (simple)
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_file = sys_get_temp_dir() . '/contact_form_' . md5($ip);
if (file_exists($rate_limit_file)) {
    $last_submission = file_get_contents($rate_limit_file);
    if (time() - $last_submission < 60) { // 1 minute rate limit
        sendResponse(false, 'Please wait before submitting another message');
    }
}

// Create email content
$subject = 'New Contact Form Submission - ' . $name;

$html_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #0891b2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #0891b2; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class='header'>
        <h2>New Contact Form Submission</h2>
        <p>Robotics & Control Ltd</p>
    </div>
    <div class='content'>
        <div class='field'>
            <div class='label'>Name:</div>
            <div>" . htmlspecialchars($name) . "</div>
        </div>
        <div class='field'>
            <div class='label'>Email:</div>
            <div>" . htmlspecialchars($email) . "</div>
        </div>";

if (!empty($company)) {
    $html_body .= "
        <div class='field'>
            <div class='label'>Company:</div>
            <div>" . htmlspecialchars($company) . "</div>
        </div>";
}

if (!empty($phone)) {
    $html_body .= "
        <div class='field'>
            <div class='label'>Phone:</div>
            <div>" . htmlspecialchars($phone) . "</div>
        </div>";
}

if (!empty($service)) {
    $service_labels = [
        'automation' => 'Automation Services',
        'safety' => 'Machine Safety',
        'design' => 'Electrical Design',
        'panel' => 'Panel Building',
        'training' => 'Safety Training',
        'consultation' => 'General Consultation'
    ];
    $service_display = isset($service_labels[$service]) ? $service_labels[$service] : $service;
    
    $html_body .= "
        <div class='field'>
            <div class='label'>Service Interest:</div>
            <div>" . htmlspecialchars($service_display) . "</div>
        </div>";
}

if (!empty($department)) {
    $department_labels = [
        'info@rcltd.ie' => 'General Inquiries',
        'chelsey.omahony@rcltd.ie' => 'Health, Safety & Operations',
        'morgan@rcltd.ie' => 'Operations Management',
        'benedict.larkin@rcltd.ie' => 'Marketing & Communications',
        'lmccormack@rcltd.ie' => 'General Administration'
    ];
    $department_display = isset($department_labels[$department_normalized]) ? $department_labels[$department_normalized] : $department;
    
    $html_body .= "
        <div class='field'>
            <div class='label'>Department:</div>
            <div>" . htmlspecialchars($department_display) . " (" . htmlspecialchars($department) . ")</div>
        </div>";
}

$html_body .= "
        <div class='field'>
            <div class='label'>Message:</div>
            <div>" . nl2br(htmlspecialchars($message)) . "</div>
        </div>
        <div class='field'>
            <div class='label'>Submitted:</div>
            <div>" . date('Y-m-d H:i:s T') . "</div>
        </div>
        <div class='field'>
            <div class='label'>IP Address:</div>
            <div>" . htmlspecialchars($_SERVER['REMOTE_ADDR']) . "</div>
        </div>
    </div>
    <div class='footer'>
        <p>This email was sent from the contact form on rcltd.ie</p>
        <p>Unit 2 Cahir Business Park, Cahir, Co. Tipperary, Ireland, E21 C564</p>
        <p>Phone: +353 (0) 52 7443258</p>
    </div>
</body>
</html>";

// Plain text version
$text_body = "New Contact Form Submission - Robotics & Control Ltd\n\n";
$text_body .= "Name: " . $name . "\n";
$text_body .= "Email: " . $email . "\n";
if (!empty($company)) $text_body .= "Company: " . $company . "\n";
if (!empty($phone)) $text_body .= "Phone: " . $phone . "\n";
if (!empty($service)) $text_body .= "Service Interest: " . $service_display . "\n";
if (!empty($department)) $text_body .= "Department: " . $department_display . " (" . $to_email . ")\n";
$text_body .= "\nMessage:\n" . $message . "\n";
$text_body .= "\nSubmitted: " . date('Y-m-d H:i:s T') . "\n";
$text_body .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Try to send with PHP mail() first (Plesk default)
$headers = [
    'From' => $from_name . ' <' . $from_email . '>',
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion(),
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/html; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit'
];

$header_string = '';
foreach ($headers as $key => $value) {
    $header_string .= $key . ': ' . $value . "\r\n";
}

// Attempt to send email
$mail_sent = mail($to_email, $subject, $html_body, $header_string);

if ($mail_sent) {
    // Update rate limiting
    file_put_contents($rate_limit_file, time());
    
    // Log successful submission (optional)
    error_log("Contact form submission from: " . $email . " - " . $name);
    
    sendResponse(true, 'Thank you for your message! We will get back to you within 24 hours.');
} else {
    // Log error
    error_log("Failed to send contact form email from: " . $email);
    sendResponse(false, 'Sorry, there was an error sending your message. Please try again or call us directly at +353 (0) 52 7443258.');
}
?>