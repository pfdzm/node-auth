const express = require("express");
const cors = require("cors");
const jose = require("jose");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const User = mongoose.model("User", {
  username: String,
  password: String,
});

const createRootUser = async () => {
  const rootUser = await User.exists({ username: "admin" });
  if (rootUser) {
    console.log("root user already exists");
    await User.deleteOne(rootUser._id);
  }
  await User.create({
    username: "admin",
    password: bcrypt.hashSync("admin", 10),
  });
};
mongoose.connect(
  process.env.DATABASE_URL ?? "mongodb://localhost:27017/node-auth"
);
const database = mongoose.connection;

database.on("error", console.error.bind(console, "connection error:"));
database.once("open", function () {
  console.log("Connected to database");
  createRootUser().then(() => {
    console.log("Root user created");
  });
});

const jwtSecret = new TextEncoder().encode("secret");

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user === null || !bcrypt.compareSync(password, user.password)) {
    res.status(401).send("Unauthorized");
    return;
  }

  const token = await new jose.SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("node-auth")
    .setExpirationTime("2h")
    .sign(jwtSecret);
  res.status(200).send(token);
});

const authorizationMiddleware = async (req, res, next) => {
  try {
    const rawToken = req.headers.authorization.split(" ")[1];
    const { payload } = await jose.jwtVerify(rawToken, jwtSecret, {
      issuer: "node-auth",
    });
    req.token = payload;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};

app.get("/user", authorizationMiddleware, async (req, res) => {
  const allUsers = await User.find();
  res.send(allUsers);
});

app.get("/user/:username", authorizationMiddleware, async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  if (user === null) {
    res.status(404).send("User not found");
    return;
  }
  res.status(200).send(user);
});

app.post("/user", authorizationMiddleware, async (req, res) => {
  const { username, password: rawPassword } = req.body;
  const password = bcrypt.hashSync(rawPassword, 10);
  await User.create({ username, password });
  res.status(201).send("User created");
});

app.delete("/user/:username", authorizationMiddleware, async (req, res) => {
  const username = req.params.username;

  if (username === "admin") {
    res.status(403).send("Cannot delete root user");
    return;
  }
  await User.deleteOne({ username });
  res.status(200).send("User deleted");
});

app.get("/whoami", authorizationMiddleware, (req, res) => {
  res.send({ username: req.token.username });
});

const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
