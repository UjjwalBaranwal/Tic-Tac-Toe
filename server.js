////////////////////////////////////////
///// Server side

const http = require("http")
  .createServer()
  .listen(8000, () => {
    console.log("port is 8000");
  });
