const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:8081",
    credentials: true,
  })
);

app.get("/", (req, res) => {
    res.send("Hello World");
  });
  
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;