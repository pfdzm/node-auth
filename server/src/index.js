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

// Basic Auth
// req.headers.authorization = "Basic sda;lfkjdsalkfjdaskljfsdkalj"
// req.headers.authorization = "Basic username:password"
//
// JWT
// POST /api/login { username: "admin", password: "admin" } -> JWT (token)
// req.headers.authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user === null || !bcrypt.compareSync(password, user.password)) {
    res.status(401).send("Unauthorized");
    return;
  }

  // const token = jwt.sign({ username }, jwtSecret);
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

const adminMiddleware = (req, res, next) => {
  if (req.token.username !== "admin") {
    res.status(403).send("Forbidden");
    return;
  }
  next();
};

// req.headers.authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
app.get(
  "/all-users",
  authorizationMiddleware,
  adminMiddleware,
  async (req, res) => {
    const allUsers = await User.find();
    res.send(allUsers);
  }
);

app.post("/reset-password", authorizationMiddleware, (req, res) => {
  // reset password
  const newPassword = req.body.password;
  password = newPassword;
  res.send("Password reset");
});

app.post("reset-pw-through-security-questions", (req, res) => {
  // check security questions
  const securityQuestions = req.body.securityQuestions;
  // check users db for security questions
  // if security questions are correct

  // reset password
  const newPassword = req.body.password;
  password = newPassword;
  res.send("Password reset");
});
const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
