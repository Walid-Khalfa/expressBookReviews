const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/* ----------  utils  ---------- */
const isValid = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

/* ----------  middleware : vérifie le token  ---------- */
const authenticatedCustomer = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(' ')[1];          // "Bearer <token>"
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    req.user = jwt.verify(token, 'access');        // { data: username, iat, exp }
    next();
  } catch (e) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/* =========================================================
   6  –  Register
   =========================================================*/
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });
  if (users.some(u => u.username === username))
    return res.status(409).json({ message: "Username already exists" });

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login", username });
});

/* =========================================================
   7  –  Login
   =========================================================*/
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password are required" });
  if (!authenticatedUser(username, password))
    return res.status(401).json({ message: "Invalid Login. Check username and password" });

  const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: "1h" });
  return res.status(200).json({ message: "User successfully logged in", username, accessToken });
});

/* =========================================================
   8  –  Add / Modify review   (async)
   =========================================================*/
regd_users.put("/auth/review/:isbn", authenticatedCustomer, async (req, res) => {
  try {
    const isbn   = req.params.isbn;
    const review = req.body.review;
    const username = req.user.data;

    if (!review) return res.status(400).json({ message: "Review content is required" });
    if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

    if (!books[isbn].reviews) books[isbn].reviews = {};
    const old = books[isbn].reviews[username];
    books[isbn].reviews[username] = review;

    return res.status(old ? 200 : 201).json({
      message: old ? "Review modified successfully" : "Review added successfully",
      isbn, username, review, ...(old && { oldReview: old })
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});

/* =========================================================
   9  –  Delete review         (async)
   =========================================================*/
regd_users.delete("/auth/review/:isbn", authenticatedCustomer, async (req, res) => {
  try {
    const isbn     = req.params.isbn;
    const username = req.user.data;

    if (!books[isbn])                return res.status(404).json({ message: "Book not found" });
    if (!books[isbn].reviews?.[username]) return res.status(404).json({ message: "Review not found" });

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});


module.exports.authenticated = regd_users;
module.exports.users = users;