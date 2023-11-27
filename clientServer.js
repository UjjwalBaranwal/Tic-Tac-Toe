//////////////////////////////////////////
/// inital code

////////////////////////////////////////
///// Client side
var clientId;
var gameId;
var socket;
var symbol;

const sidebar = document.querySelector(".sidebar");
const connectBtn = document.querySelector(".ctnBtn");
const createBtn = document.querySelector(".crtBtn");
const joinBtn = document.querySelector(".joinBtn");
const userDetail = document.querySelector(".user_detail");
const list = document.querySelector(".game-list");
const board = document.querySelector(".board");
const cells = document.querySelectorAll(".cell");

connectBtn.addEventListener("click", (e) => {
  socket = new WebSocket("ws://localhost:8000");
  socket.onmessage = onMessage;
  e.target.disabled = true;
});

function onMessage(msg) {
  const data = JSON.parse(msg.data);
  switch (data.tag) {
    case "connnected":
      console.log("connected");
      console.log({ clientId: data.clientId });
      clientId = data.clientId;
      userDetail.textContent = `your user Id : ${data.clientId}`;
      createBtn.disabled = false;
      joinBtn.disabled = false;
      break;
    case "gamelist":
      console.log(data.list);
      const games = data.list;
      while (list.firstChild) {
        list.removeChild(list.lastChild);
      }
      games.forEach((game) => {
        const li = document.createElement("li");
        li.innerText = game;
        li.style.textAlign = "center";
        list.appendChild(li);
        li.addEventListener("click", () => {
          console.log(`hey my game id is : ${game}`);
          gameId = game;
        });
      });
      break;
    case "created":
      gameId = data.gameId;
      createBtn.disabled = true;
      joinBtn.disabled = true;
      console.log(gameId);
      break;
    case "joined":
      board.style.display = "grid";
      symbol = data.symbol;
      if (symbol === "o") {
        board.classList.add("circle");
      } else {
        board.classList.add("cross");
      }
      break;
    case "updateBoard":
      cells.forEach((cell) => {
        if (cell.classList.contains("cross")) {
          cell.classList.remove("cross");
        } else if (cell.classList.contains("circle")) {
          cell.classList.remove("circle");
        }
      });
      for (let i = 0; i < 9; i++) {
        if (data.board[i] == "x") cells[i].classList.add("cross");
        else if (data.board[i] == "o") cells[i].classList.add("circle");
      }
      if (data.isTurn) {
        makeMove();
      }
      return;
    case "winner":
      alert(`the winner is ${data.winner}`);
      break;
    case "draw":
      alert(`game is in state draw`);
      break;
  }
}

////////////////////////////////////////////////////////
///////////////////// logic for create button
createBtn.disabled = true;
createBtn.addEventListener("click", () => {
  socket.send(
    JSON.stringify({
      tag: "create",
      clientId: clientId,
    })
  );
});

//////////////////////////////////////////////////////////
///////////////////////// Logic for join button
joinBtn.disabled = true;
joinBtn.addEventListener("click", () => {
  socket.send(
    JSON.stringify({
      tag: "join",
      clientId: clientId,
      gameId: gameId,
    })
  );
});
/////////////////////////////////////////////////////
////////////// make move function

function makeMove() {
  cells.forEach((cell) => {
    if (
      !cell.classList.contains("cross") &&
      !cell.classList.contains("circle")
    ) {
      cell.addEventListener("click", cellClicked);
    }
  });
}

function cellClicked(src) {
  let icon;
  if (symbol == "x") {
    icon = "cross";
  } else {
    icon = "circle";
  }
  src.target.classList.add(icon);
  const board = [];
  for (i = 0; i < 9; i++) {
    if (cells[i].classList.contains("circle")) {
      board[i] = "o";
    } else if (cells[i].classList.contains("cross")) {
      board[i] = "x";
    } else {
      board[i] = "";
    }
  }
  cells.forEach((cell) => {
    cell.removeEventListener("click", cellClicked);
  });
  socket.send(
    JSON.stringify({
      tag: "moveMade",
      board,
      gameId,
      clientId,
    })
  );
}
