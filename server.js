////////////////////////////////////////
///// Server side
let clients = {};
let games = {};
const WIN_STATES = Array(
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
);
const http = require("http")
  .createServer()
  .listen(8000, () => {
    console.log("port is 8000");
  });

const server = require("websocket").server;

const socket = new server({ httpServer: http });

socket.on("request", (req) => {
  const conn = req.accept(null, req.origin);
  const clientId = Math.floor(Math.random() * (999 - 100)) + 100;
  clients[clientId] = { conn };
  conn.send(
    JSON.stringify({
      tag: "connnected",
      clientId: clientId,
    })
  );
  //   console.log(Object.keys(clients));
  sendAllGame();
  conn.on("message", onMessage);
});
///////////////////////////////////////////
//////// send all game logic
function sendAllGame() {
  //   game = [1, 2, 3];
  const gameList = [];
  for (const game in games) {
    if (games[game].players.length < 2) {
      gameList.push(game);
    }
  }
  for (c in clients) {
    clients[c].conn.send(
      JSON.stringify({
        tag: "gamelist",
        list: gameList,
      })
    );
  }
}

////////////////////////////////
function onMessage(msg) {
  const data = JSON.parse(msg.utf8Data);
  switch (data.tag) {
    case "create":
      const gameId = Math.floor(Math.random() * (999 - 100)) + 100;
      const board = ["", "", "", "", "", "", "", "", ""];
      const playerCreate = {
        clientId: data.clientId,
        symbol: "x",
        isTurn: true,
      };
      const players = Array(playerCreate);
      games[gameId] = {
        board,
        players,
      };
      clients[data.clientId].conn.send(
        JSON.stringify({
          tag: "created",
          gameId,
        })
      );
      sendAllGame();
      break;
    case "join":
      const playerJoin = {
        clientId: data.clientId,
        symbol: "o",
        isTurn: false,
      };
      console.log(data.gameId);
      games[data.gameId].players.push(playerJoin);
      sendAllGame();
      games[data.gameId].players.forEach((player) => {
        clients[player.clientId].conn.send(
          JSON.stringify({
            tag: "joined",
            gameId: data.gameId,
            symbol: player.symbol,
          })
        );
      });
      updateGame(data.gameId);
      break;
    case "moveMade":
      games[data.gameId].board = data.board;
      const isWinner = winState(data.gameId);
      const isDraw = stateDraw(data.gameId);
      if (isWinner) {
        games[data.gameId].players.forEach((player) => {
          clients[player.clientId].conn.send(
            JSON.stringify({
              tag: "winner",
              winner: player.symbol,
            })
          );
        });
      } else if (isDraw) {
        games[data.gameId].players.forEach((player) => {
          clients[player.clientId].conn.send(
            JSON.stringify({
              tag: "draw",
            })
          );
        });
      } else {
        games[data.gameId].players.forEach((player) => {
          player.isTurn = !player.isTurn;
        });
      }
      updateGame(data.gameId);
      break;
  }
}
/////////////////////////////////////////////
////////////// Update game
function updateGame(gameId) {
  games[gameId].players.forEach((player) => {
    clients[player.clientId].conn.send(
      JSON.stringify({
        tag: "updateBoard",
        isTurn: player.isTurn,
        board: games[gameId].board,
      })
    );
  });
}

/////////// win state
function winState(gameId) {
  return WIN_STATES.some((row) => {
    return (
      row.every((cell) => {
        return games[gameId].board[cell] == "x";
      }) ||
      row.every((cell) => {
        return games[gameId].board[cell] == "o";
      })
    );
  });
}

////////// draw state
function stateDraw(gameId) {
  return WIN_STATES.every((row) => {
    return (
      row.some((cell) => {
        return games[gameId].board[cell] == "x";
      }) &&
      row.some((cell) => {
        return games[gameId].board[cell] == "o";
      })
    );
  });
}
