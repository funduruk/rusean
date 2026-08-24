<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$TG_TOKEN   = '8601903681:AAHA0-TOSIwSz3j6OedJ9oSK6UyMThTnwXw';
$TG_CHAT_ID = '-1004333551412';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['text'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing text']);
    exit;
}

$text = $input['text'];

$url = "https://api.telegram.org/bot{$TG_TOKEN}/sendMessage";
$data = [
    'chat_id' => $TG_CHAT_ID,
    'text'    => $text,
    'parse_mode' => 'HTML'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
    ]
];
$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Telegram API error']);
} else {
    echo $result;
}