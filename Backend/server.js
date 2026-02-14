const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const dataPath = path.join(__dirname, "data", "books.json");
const issuedPath = path.join(__dirname, "data", "issued.json");

// GET all books
app.get("/books", (req, res) => {
  const data = fs.readFileSync(dataPath, "utf-8");
  res.json(JSON.parse(data));
});

// ADD a new book
app.post("/addBook", (req, res) => {
  const newBook = req.body;

  const books = JSON.parse(fs.readFileSync(dataPath));
  books.push(newBook);

  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2));
  res.json({ message: "Book added successfully" });
});

// DELETE a book
app.post("/deleteBook", (req, res) => {
  const { index } = req.body;

  const books = JSON.parse(fs.readFileSync(dataPath));

  if (index === undefined) {
    return res.json({ error: "Index not received" });
  }

  books.splice(index, 1);

  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2));
  res.json({ message: "Book deleted successfully" });
});

// ISSUE BOOK
app.post("/issueBook", (req, res) => {
  const issueData = req.body;

  const issued = JSON.parse(fs.readFileSync(issuedPath));
  issued.push(issueData);

  fs.writeFileSync(issuedPath, JSON.stringify(issued, null, 2));
  res.json({ message: "Book issued" });
});

// GET ISSUED
app.get("/issued", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(issuedPath)));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
