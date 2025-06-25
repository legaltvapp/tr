<?php
$dsn = 'sqlite:chat.db';
try {
  $db = new PDO($dsn);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->exec('DELETE FROM messages');
  echo json_encode(['success' => true]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Veritabanı hatası']);
}
?>
