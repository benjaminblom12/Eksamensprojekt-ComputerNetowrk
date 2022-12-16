document.addEventListener("DOMContentLoaded", (e) => {
  if (!localStorage.getItem("SessionInfo")) {
    location.href = "/login.html";
  } else {
    //post request der sender Email + token, for at checke om session eksisterer
    fetch("http://localhost:8080/checkSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(JSON.parse(localStorage.getItem("SessionInfo"))),
    }).then((res) => {
      console.log(res);
      if (res.status != 200) {
        // location.href = "/login.html";
      }
    });
  }
});

// Inspireret af Web dev simplified https://www.youtube.com/watch?v=rxzOqP9YwmM&t=868s

const socket = io("http://localhost:8080");
const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

const name = prompt("Hvad er dit navn?");
appendMessage("You joined");
socket.emit("new-user", name);

socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  appendMessage(`${name} disconnected`);
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  appendMessage(`You: ${message}`);
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}
