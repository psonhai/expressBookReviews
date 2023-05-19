const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return username.length <= 20 && username.length > 5
}

const isDuplicated = (username) => {
  for (const user of users) {
    if (user.username === username) {
      return true
    }
  }
  return false
}

const authenticatedUser = (username,password)=>{ //returns boolean
  for (const user of users) {
    if (user.username === username && user.password == password) {
      return true
    }
  }
  return false
}

const isLoggedIn = (req, res, next) => {
  const accessToken = req.session.authorization?.accessToken
  if (!accessToken) {
    return res.status(403).json({message: 'user need to login'})
  }
  jwt.verify(accessToken, 'access', (err, user) => {
    if (!err) {
      next()
    } else {
      return res.status(403).json({message: 'user not authenticated'})
    }
  })
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.query.username
  const password = req.query.password

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"})
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({
      data: password
    }, 'access', {expiresIn: 60*60})

    req.session.authorization = {
      username: username,
      accessToken: accessToken
    }
    return res.status(200).send("User successfully logged in")
  } else {
    return res.status(403).json({message: "Wrong username or password"})
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", isLoggedIn, (req, res) => {
  const isbn = req.params.isbn
  const review = req.query.review

  if (!isbn || !review) {
    return res.status(403).json({message: 'isbn or review is empty'})
  } else {
    const book = Object.values(books).find((book) => book.ISBN === isbn)
    book.reviews = {...book.reviews, [req.session.authorization.username]: review}
    return res.status(200).json(book)
  }
});

regd_users.delete("/auth/review/:isbn", isLoggedIn, (req, res) => {
  const isbn = req.params.isbn
  const username = req.session.authorization.username
    
  if (!isbn) {
    return res.status(403).json({message: 'isbn is empty'})
  } else {
    const book = Object.values(books).find((book) => book.ISBN === isbn)
    delete book.reviews[username]
    return res.status(200).json({message: 'delete successfully'}) 
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.isDuplicated = isDuplicated;
