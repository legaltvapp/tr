let username = '';
let lastMessageTime = 0;
let messageCount = 0;

async function joinChat() {
  const input = document.getElementById('username').value.trim();
  if (!input) return;
  const res = await fetch('chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'checkUsername', username: input }),
  });
  const data = await res.json();
  if (!data.available) {
    document.getElementById('error').classList.remove('hidden');
    return;
  }
  username = input;
  document.getElementById('login').classList.add('hidden');
  document.getElementById('chat').classList.remove('hidden');
  fetch('chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'join', username }),
  });
  loadMessages();
  loadActiveUsers();
  setInterval(loadMessages, 2000);
  setInterval(loadActiveUsers, 5000);
}

function sendMessage() {
  const input = document.getElementById('message-input').value.trim();
  if (!input) return;
  const now = Date.now();
  if (now - lastMessageTime < 60000 && messageCount >= 3) {
    alert('Dakikada en fazla 3 mesaj gönderebilirsiniz!');
    return;
  }
  if (now - lastMessageTime >= 60000) {
    messageCount = 0;
    lastMessageTime = now;
  }
  messageCount++;
  fetch('chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'sendMessage', username, message: input }),
  });
  document.getElementById('message-input').value = '';
}

function toggleEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  if (picker.classList.contains('hidden')) {
    picker.classList.remove('hidden');
    picker.innerHTML = '<emoji-picker></emoji-picker>';
    document.querySelector('emoji-picker').addEventListener('emoji-click', (e) => {
      document.getElementById('message-input').value += e.detail.unicode;
      picker.classList.add('hidden');
    });
  } else {
    picker.classList.add('hidden');
  }
}

function loadMessages() {
  fetch('chat.php?action=getMessages')
    .then(res => res.json())
    .then(messages => {
      const messagesDiv = document.getElementById('messages');
      messagesDiv.innerHTML = '';
      messages.forEach(data => {
        const div = document.createElement('div');
        div.className = data.username === username ? 'self' : 'other';
        div.innerHTML = `<strong>${data.username}</strong>: ${data.message} <small class="text-gray-500">(${data.timestamp})</small>`;
        messagesDiv.appendChild(div);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

function loadActiveUsers() {
  fetch('chat.php?action=getActiveUsers')
    .then(res => res.json())
    .then(users => {
      document.getElementById('active-users').innerHTML = users.map(user => `<li>${user}</li>`).join('');
    });
}

document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
