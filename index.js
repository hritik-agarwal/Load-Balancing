const express = require("express");
const proxy = require("express-http-proxy");
const path = require("path");
const ejs = require("ejs");

const NUMBER_OF_SERVERS = 5;
const PORT = process.env.PORT || 3000;

class Server {
  constructor(active, port) {
    this.active = active;
    this.port = port;
    this.connections = 0;
  }
}

let serversRoundRobin = [];
let serversLeastConnections = [];
let currServerRoundRobin = 0;
let currServerLeastConnections = 0;

function createServers(port) {
  // let app = express();
  // app.set("view engine", "ejs");
  // app.get('/', (req, res) => {
  //   res.render('index.ejs', {
  //     serverNumber: port - PORT,
  //     serversState: servers.map(s => {
  //       if (s.active) return "green";
  //       else return "red";
  //     })
  //   });
  // });
  // app.listen(port);
  let newServer = new Server(true, port);
  serversRoundRobin.push(newServer);
  serversLeastConnections.push(JSON.parse(JSON.stringify(newServer)));
}

// Load Balancer: Round Robin Algorithm
function loadBalancerRoundRobin() {
  let passes = 0;
  while (true) {
    if (
      passes == NUMBER_OF_SERVERS ||
      currServerRoundRobin < 0 ||
      currServerRoundRobin >= NUMBER_OF_SERVERS
    ) {
      currServerRoundRobin = 0;
      for (let i = 0; i < NUMBER_OF_SERVERS; i++)
        serversRoundRobin[i].active = true;
    }
    const port = 1 + currServerRoundRobin;
    if (serversRoundRobin[currServerRoundRobin].active) {
      // const server = `http://localhost:${port}`;
      currServerRoundRobin = (currServerRoundRobin + 1) % NUMBER_OF_SERVERS;
      return port;
    }
    currServerRoundRobin = (currServerRoundRobin + 1) % NUMBER_OF_SERVERS;
    passes++;
  }
}

function loadBalancerLeastConnection() {
  let serverNum = -1;
  let minConnections = 3;
  for (let i = 0; i < NUMBER_OF_SERVERS; i++){
    if (serversLeastConnections[i].connections < minConnections && serversLeastConnections[i].active == true) {
      minConnections = serversLeastConnections[i].connections;
      serverNum = i;
    }
  }
  if (serverNum == -1) {
    for (let i = 0; i < NUMBER_OF_SERVERS; i++)
      serversLeastConnections[i].active = true, serversLeastConnections[i].connections = 0;
    serverNum = 0;
  }
  serversLeastConnections[serverNum].connections++;
  currServerLeastConnections = serverNum;
  return serverNum+1;
}

// Main server where the request will be routed through different servers using load balancer algorithm
const app = require("./app");

// app.get("/", proxy(loadBalancerRoundRobin));
app.get("/", (req, res) => {
  res.render("index.ejs");
  for (let i = 0; i < NUMBER_OF_SERVERS; i++) {
    serversLeastConnections[i].active = true;
    serversLeastConnections[i].connections = 0;
  }
  for (let i = 0; i < NUMBER_OF_SERVERS; i++){
    serversRoundRobin[i].active = true;
  }
});

app.get("/round", (req, res) => {
  const port = loadBalancerRoundRobin();
  res.render("round.ejs", {
    serverNumber: port,
    serversState: serversRoundRobin.map((s) => {
      if (s.active) return "green";
      else return "red";
    }),
  });
});

app.get("/least", (req, res) => {
  const port = loadBalancerLeastConnection();
  res.render("least.ejs", {
    serverNumber: port,
    serversState: serversLeastConnections.map((s) => {
      if (s.active) return "green";
      else return "red";
    }),
    serverConnections: serversLeastConnections.map((s) => s.connections)
  });
});

app.post("/round", (req, res) => {
  let server = req.body.roundRobinServer - 1;
  serversRoundRobin[server].active = !serversRoundRobin[server].active;
  currServerRoundRobin--; if (currServerRoundRobin < 0) currServerRoundRobin = NUMBER_OF_SERVERS - 1;
  res.redirect("/round");
});

app.post("/least", (req, res) => {
  let server = req.body.leastConnectionserver - 1;
  serversLeastConnections[server].active = !serversLeastConnections[server].active;
  serversLeastConnections[server].connections = 0;
  if (server != currServerLeastConnections) {
    res.render("least.ejs", {
      serverNumber: currServerLeastConnections+1,
      serversState: serversLeastConnections.map((s) => {
        if (s.active) return "green";
        else return "red";
      }),
      serverConnections: serversLeastConnections.map((s) => s.connections),
    });
  }
  else res.redirect("/least");
});

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));

// creating all the instances of different servers
for (let i = 1; i <= NUMBER_OF_SERVERS; i++) createServers(i);