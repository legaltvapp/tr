<?php
header('Content-Type: application/json');

$dsn = 'sqlite:chat.db';
try {
  $db = new PDO($dsn);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->exec('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, timestamp TEXT)');
  $db->exec('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, last_active INTEGER)');
} catch (PDOException $e) {
  echo json_encode(['error' => 'Veritabanı hatası']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $input['action'] ?? '';

if ($action === 'checkUsername') {
  $username = $input['username'];
  $stmt = $db->prepare('SELECT username FROM users WHERE username = ?');
  $stmt->execute([$username]);
  echo json_encode(['available' => !$stmt->fetch()]);
} elseif ($action === 'join') {
  $username = $input['username'];
  $stmt = $db->prepare('INSERT OR REPLACE INTO users (username, last_active) VALUES (?, ?)');
  $stmt->execute([$username, time()]);
  echo json_encode(['success' => true]);
} elseif ($action === 'sendMessage') {
  $username = $input['username'];
  $message = substr(htmlspecialchars($input['message']), 0, 60);
  $timestamp = date('H:i');
  $stmt = $db->prepare('INSERT INTO messages (username, message, timestamp) VALUES (?, ?, ?)');
  $stmt->execute([$username, $message, $timestamp]);
  $stmt = $db->prepare('UPDATE users SET last_active = ? WHERE username = ?');
  $stmt->execute([time(), $username]);
  echo json_encode(['success' => true]);
} elseif ($action === 'getMessages') {
  $stmt = $db->query('SELECT username, message, timestamp FROM messages ORDER BY id');
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($action === 'getActiveUsers') {
  $timeLimit = time() - 300;
  $stmt = $db->prepare('SELECT username FROM users WHERE last_active > ?');
  $stmt->execute([$timeLimit]);
  echo json_encode(array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'username'));
}
?>
