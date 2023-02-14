const express = require("express");
const multer = require("multer");
const fs = require("fs");
const app = express();
const cors = require("cors");

require("dotenv").config();
const corsOptions = {
  origin: "https://marvelous-brigadeiros-cbe7ea.netlify.app",
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/static", express.static("./uploads"));
const upload = multer({ dest: "./uploads" });

const { Pool } = require("pg");

const PORT = process.env.PORT || 8060;

const pool = new Pool({
  PGHOST: process.env.PGHOST,
  PGUSER: process.env.PGUSER,
  PGDATABASE: process.env.PGDATABASE,
  PGPASSWORD: process.env.PGPASSWORD,
  PGPORT: process.env.PGPORT,
});

app.get("/", (req, res) => {
  res.send("WELCOME");
});

app.get("/api/recipes", (req, res) => {
  pool
    .query("SELECT * FROM recipes")
    .then((data) => res.json(data.rows))
    .catch((e) => res.sendStatus(500));
});

app.post("/api/recipes", (req, res) => {
  const { title, nameid, image, type, vegetarian, ingredients, instructions } =
    req.body;

  pool
    .query(
      "INSERT INTO recipes (title, nameid, image , type , vegetarian  , ingredients , instructions ) VALUES ($1, $2 , $3 , $4 , $5 , $6 , $7) RETURNING * ",
      [title, nameid, image, type, vegetarian, ingredients, instructions]
    )
    .then((data) => res.json(data.rows[0]))
    .catch((e) => res.sendStatus(500));
});

app.post("/api/recipes", upload.single("selectedFile"), (req, res) => {
  console.log(req.body);

  const title = req.body.title;
  const nameid = req.body.nameid;
  const type = req.body.type;
  const vegetarian = req.body.vegetarian;
  const ingredients = req.body.ingredients;
  const instructions = req.body.instructions;

  const fileType = req.file.mimetype.split("/")[1];
  const newFile = req.file.filename + "." + fileType;
  fs.rename(`./uploads/${req.file.filename}`, `./uploads/${newFile}`, () => {
    console.log("What up");
  });

  const image = `http://localhost:8060/static/${newFile}`;

  pool
    .query(
      "INSERT INTO recipes (title, nameid, image , type , vegetarian  , ingredients , instructions ) VALUES ($1, $2 , $3 , $4 , $5 , $6 , $7) RETURNING * ",
      [title, nameid, image, type, vegetarian, ingredients, instructions]
    )
    .then((data) => res.json(data.rows[0]))
    .catch((e) => res.sendStatus(500));
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
