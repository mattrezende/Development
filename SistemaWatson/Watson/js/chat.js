async function sendMessage() {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");

  const userMessage = input.value;

  chat.innerHTML += `<p><strong>Você:</strong> ${userMessage}</p>`;

  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: userMessage })
  });

  const data = await response.json();

  chat.innerHTML += `<p><strong>Watson:</strong> ${data.reply}</p>`;

  input.value = "";
}