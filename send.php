<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Honeypot anti-spam check
if (!empty($_POST['website'])) {
    http_response_code(200);
    echo json_encode(['ok' => true]); // Silently accept to not alert bots
    exit;
}

// Validate required fields
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$company = trim($_POST['company'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']);
    exit;
}

// Rate limiting (simple file-based, 1 submission per IP per 60 seconds)
$rateLimitDir = __DIR__ . '/tmp_ratelimit';
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0700, true);
}
$ipHash = md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateLimitFile = $rateLimitDir . '/' . $ipHash;
if (file_exists($rateLimitFile) && (time() - filemtime($rateLimitFile)) < 60) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please wait a minute.']);
    exit;
}
@touch($rateLimitFile);

// Clean up old rate limit files (older than 5 minutes)
foreach (glob($rateLimitDir . '/*') as $f) {
    if ((time() - filemtime($f)) > 300) @unlink($f);
}

// Build email
$to = 'nicola.bertato@gmail.com';
$subject = "[Butterfly Media] New inquiry from $name";

$body = "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Company: " . ($company ?: 'N/A') . "\n";
$body .= "Service: " . ($service ?: 'N/A') . "\n";
$body .= "\n--- Message ---\n\n";
$body .= $message . "\n";

$headers = "From: info@butterflymedia.it\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: ButterflyMedia-Contact-Form\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>
