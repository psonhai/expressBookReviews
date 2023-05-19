const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let isDuplicated = require("./auth_users.js").isDuplicated;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.query.username
  const password = req.query.password

  if (!username) {
    return res.status(403).json({message: "Null username"})
  } else if (!password) {
    return res.status(403).json({message: "Password is null"})
  } else if (!isValid(username)) {
    return res.status(403).json({message: "Username is not valid"})
  } else if (isDuplicated(username)) {
    return res.status(403).json({message: 'Username is duplicated, please choose another one'})
  } else {
    users.push({username: username, password: password})
    return res.status(200).json({message: 'Register successfully'})
  }
})

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const promise = new Promise((resolve, reject) => {
    console.log("getting all books")
    setTimeout(() => {
      resolve(books)
      console.log("done")
    }, 0)
  })

  promise.then((books) => {
    return res.status(200).send(JSON.stringify(books, null, '\t'))
  })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const promise = new Promise((resolve, reject) => {
    const isbn = req.params.isbn

    if (!isbn) {
      reject("Empty isbn")
    } else {
      const filtered_books = Object.values(books).filter((book) => book.ISBN === isbn)
      resolve(filtered_books)
    }
  })

  promise.then(
    (books) => {
      return res.status(200).json(books)
    },
    (error_message) => {
      return res.status(403).json({message: error_message})
    }
  )
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const promise = new Promise((resolve, reject) => {
    const author = req.params.author

    if (!author) {
      reject("Empty author")
    } else {
      const filtered_books = Object.values(books)
        .filter((book) => book.author === author)
      resolve(filtered_books)
    }
  })

  promise.then(
    (books) => {
      return res.status(200).json(books)
    },
    (error_message) => {
      return res.status(403).json({message: error_message})
    }
  )
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const promise = new Promise((resolve, reject) => {
    const title = req.params.title

    if (!title) {
      reject("Empty title")
    } else {
      const filtered_books = Object.values(books)
       .filter((book) => book.title === title)
      resolve(filtered_books)
    }
  })

  promise.then(
    (books) => {
      return res.status(200).json(books)
    },
    (error_message) => {
      return res.status(403).json({message: error_message})
    }
  )
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn

  if (!isbn) {
    return res.status(404).json({message: "Empty isbn"})
  } else {
    const filtered_books = Object.values(books)
     .filter((book) => book.ISBN === isbn)
    return res.status(200).json(filtered_books[0].reviews)
  }
});

module.exports.general = public_users;
