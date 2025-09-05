const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/* =========================================================
   Task 10 – Get all books (async/await)
   =========================================================*/
public_users.get('/', async (req, res) => {
  try {
    const booksList = await Promise.resolve(books);
    return res.status(200).json({ books: booksList });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   Task 11 – Get book by ISBN (async/await)
   =========================================================*/
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   Task 12 – Get books by author (async/await)
   =========================================================*/
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const booksByAuthor = await Promise.resolve(
      Object.values(books).filter(book => book.author === author)
    );
    if (booksByAuthor.length > 0) {
      return res.status(200).json({ books: booksByAuthor });
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   Task 13 – Get books by title (async/await)
   =========================================================*/
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const booksByTitle = await Promise.resolve(
      Object.values(books).filter(book => book.title === title)
    );
    if (booksByTitle.length > 0) {
      return res.status(200).json({ books: booksByTitle });
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* =========================================================
   Task 5 – Get book reviews (sync)
   =========================================================*/
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book not found or no reviews available" });
  }
});

module.exports.general = public_users;