const { serve } = require("@hono/node-server");
const { Hono } = require("hono");
const { cors } = require("hono/cors");
const jose = require("jose");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = new Hono();
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

const authorizationMiddleware = async (c, next) => {
  try {
    const rawToken = c.req.header("Authorization").split(" ")[1];
    const { payload } = await jose.jwtVerify(rawToken, jwtSecret, {
      issuer: "node-auth",
    });
    c.set("token", payload);
    await next();
  } catch (error) {
    c.status(401);
    return c.text("Unauthorized");
  }
};

app.get("/", async (c) => {
  return c.text("Hello World");
});

app.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  const user = await User.findOne({ username });

  if (user === null || !bcrypt.compareSync(password, user.password)) {
    c.status(401);
    return c.text("Unauthorized");
  }

  const token = await new jose.SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("node-auth")
    .setExpirationTime("2h")
    .sign(jwtSecret);
  c.status(200);
  return c.text(token);
});

app.get("/user", authorizationMiddleware, async (c) => {
  const allUsers = await User.find();
  return c.json(allUsers);
});

app.get("/user/:username", authorizationMiddleware, async (c) => {
  const username = c.req.param("username");
  const user = await User.findOne({ username });
  if (user === null) {
    c.status(404);
    return c.text("User not found");
  }
  c.status(200);
  return c.json(user);
});

app.post("/user", authorizationMiddleware, async (c) => {
  const { username, password: rawPassword } = await c.req.json();
  if (username === "admin") {
    c.status(403);
    return c.text("Cannot create root user");
  }
  const password = bcrypt.hashSync(rawPassword, 10);
  await User.create({ username, password });
  c.status(201);
  return c.text("User created");
});

app.delete("/user/:username", authorizationMiddleware, async (c) => {
  const username = c.req.param("username");

  if (username === "admin") {
    c.status(403);
    return c.text("Cannot delete root user");
  }
  await User.deleteOne({ username });
  c.status(200);
  return c.text("User deleted");
});

app.get("/whoami", authorizationMiddleware, (c) => {
  const { username } = c.get("token");
  return c.json({ username });
});

const PORT = process.env.PORT ?? 8080;
serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  () => {
    console.log(`Server running`);
  }
);
