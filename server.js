// Imports
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const db = require("./Controller/db");
const fs = require("fs");
const { Console } = require("console");

// Port
const PORT = 8080;

// Server
http.listen(PORT, function () {
  console.log(`Server active through port: ${PORT}`);
});

// Middleware
app.use(express.json());
app.use("/", express.static("view"));

// Connecter DB
async function connectToDb() {
  try {
    await db.startDb();
  } catch (error) {
    console.log("No connection to the database", error.message);
  }
}
connectToDb();

// Opretter bruger
app.post("/register/user", async function (req, res) {
  try {
    //laver ny user med user classen og info fra request
    let userData = { email: req.body.email, password: req.body.password };
    await db.uploadUser(userData);
    res.status(200).json("USER UPLOADED");
  } catch (err) {
    res.status(400).json("Bruger kunne ikke uploades");
  }
});
// session bruger
app.post("/session", async function (req, res) {
  try {
    let nySession = req.body;
    await db.opretSession(nySession);
    res.status(200).json("session er ok");
  } catch {
    res.status(400).json("session not ok");
  }
});

// login
app.post("/login", async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;
    console.log(await db.Authenticerer(email, password));
    res.status(200).json("ok");
  } catch {
    res.status(400).json("ikke ok");
  }
});

// Checker efter session
app.post("/checkSession", async function (req, res) {
  try {
    // console.log(req.body);
    let email = req.body.email;
    let token = req.body.token;
    const sess = await db.checkSession(token, email);
    res.status(200).json("user logged in");
  } catch {
    res.status(400).json("user is not logged in");
  }
});

// socket.io
const users = {};
io.on("connection", (socket) => {
  socket.on("new-user", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", name);
  });
  socket.on("send-chat-message", (message) => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
    });
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnected", users[socket.id]);
    delete users[socket.id];
  });
});
