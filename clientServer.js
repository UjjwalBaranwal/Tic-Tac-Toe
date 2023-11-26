////////////////////////////////////////
///// Client side

const connectBtn = document.querySelector(".ctnBtn");

connectBtn.addEventListener("click", (e) => {
  const socket = new WebSocket("ws://localhost:8000");

  socket.onmessage = onMessage;
  e.target.disabled = true;
});

function onMessage(msg) {}
