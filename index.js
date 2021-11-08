const express = require("express");
const proxy = require("express-http-proxy");
const path = require('path');
const ejs = require('ejs'); 

const NUMBER_OF_SERVERS = 5;
const PORT = process.env.PORT || 3000;

class Server{
  constructor(active, port) {
    this.active = active;
    this.port = port;
  }
}

let servers = [];

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
  servers.push(newServer);
}

let currServer = 0;

// Load Balancer: Round Robin Algorithm
function loadBalancerRoundRobin() {
  let passes = 0;
  while (true) {
    if (passes == NUMBER_OF_SERVERS || currServer<0 || currServer>=NUMBER_OF_SERVERS) {
      currServer = 0;
      for (let i = 0; i < NUMBER_OF_SERVERS; i++) servers[i].active = true;
    }
    const port = PORT + 1 + currServer;
    if (servers[currServer].active) {
      // const server = `http://localhost:${port}`;
      currServer = (currServer + 1) % NUMBER_OF_SERVERS;
      return port;
    }
    currServer = (currServer + 1) % NUMBER_OF_SERVERS;
    passes++;
  }
}

// Main server where the request will be routed through different servers using load balancer algorithm
const app = require('./app');
// app.get("/", proxy(loadBalancerRoundRobin));
app.get("/", (req, res) => {
  const port = loadBalancerRoundRobin();
  res.render("index.ejs", {
    serverNumber: port - PORT,
    serversState: servers.map((s) => {
      if (s.active) return "green";
      else return "red";
    }),
  });
})
app.post('/', (req, res) => {
  let server = req.body.server-1;
  servers[server].active = !servers[server].active;
  currServer--;
  res.redirect('/');
})
app.listen(PORT, () => console.log(`server is running on port ${PORT}`));

// creating all the instances of different servers
for (let i = PORT+1; i <= PORT + 1 + NUMBER_OF_SERVERS - 1; i++) createServers(i);