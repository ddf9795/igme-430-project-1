const fs = require('fs');

let books = null;

const parseDataOnStart = () => {
  books = JSON.parse(fs.readFileSync('client/books.json'));
  console.log('data parsed');
};

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  // HEAD requests don't get a body back, just the metadata.
  // So if the user made one, we don't want to write the body.
  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }

  response.end();
};

// Find and return all books
const getAllBooks = (request, response) => {
  const responseJSON = {
    books,
  };

  respondJSON(request, response, 200, responseJSON);
};

// Find a book using search parameters
const getBook = (request, response) => {
  const searchParams = Array.from(request.body).flat(Infinity);

  let title;
  let author;
  let language;

  // Check for a 'valid' query
  for (let index = 0; index < searchParams.length; index++) {
    const param = Array.from(searchParams)[index];
    if (param === 'title') {
      title = searchParams[index + 1];
    }
    if (param === 'author') {
      author = searchParams[index + 1];
    }
    if (param === 'language') {
      language = searchParams[index + 1];
    }
  }

  // Start filtering through the provided parameters
  let result = books.filter((book) => (book.title === title || title === undefined));
  result = result.filter((book) => (book.author === author || author === undefined));
  result = result.filter((book) => (book.language === language || language === undefined));

  const responseJSON = {
    result,
  };

  respondJSON(request, response, 200, responseJSON);
};

// Find all books by a specific author
const getBooksByAuthor = (request, response) => {
  const searchParams = Array.from(request.body).flat(Infinity);

  let author;

  // Check for a 'valid' query
  for (let index = 0; index < searchParams.length; index++) {
    const param = Array.from(searchParams)[index];
    if (param === 'author') {
      author = searchParams[index + 1];
    }
  }

  // Start filtering through the provided parameters
  const result = books.filter((book) => (book.author === author || author === undefined));

  const responseJSON = {
    result,
  };

  respondJSON(request, response, 200, responseJSON);
};

// Find all books by a specific language
const getBooksByLanguage = (request, response) => {
  const searchParams = Array.from(request.body).flat(Infinity);

  let language;

  // Check for a 'valid' query
  for (let index = 0; index < searchParams.length; index++) {
    const param = Array.from(searchParams)[index];
    if (param === 'language') {
      language = searchParams[index + 1];
    }
  }

  // Start filtering through the provided parameters
  const result = books.filter((book) => (book.language === language || language === undefined));

  const responseJSON = {
    result,
  };

  respondJSON(request, response, 200, responseJSON);
};

// construct a book from POST body and add it to the database
const addBook = (request, response) => {
  // Default response
  const responseJSON = {
    message: 'Missing fields: ', // We extend this later with missing fields
  };

  console.log(request.body);

  const {
    author,
    country,
    language,
    link,
    pages,
    title,
    year,
    genres,
  } = request.body;

  // Check if we're missing any parameters, and modify the message accordingly
  let failedToVerify = false; // Also prep this for at the end to see if a 400 error is needed
  if (!author) {
    responseJSON.message += 'Author';
    failedToVerify = true;
  }

  if (!country) {
    responseJSON.message += ', Country';
    failedToVerify = true;
  }

  if (!language) {
    responseJSON.message += ', Language';
    failedToVerify = true;
  }

  if (!link) {
    responseJSON.message += ', Link';
    failedToVerify = true;
  }

  if (!pages) {
    responseJSON.message += ', Page Count';
    failedToVerify = true;
  }

  if (!title) {
    responseJSON.message += ', Title';
    failedToVerify = true;
  }

  if (!year) {
    responseJSON.message += ', Year';
    failedToVerify = true;
  }

  if (!genres) {
    responseJSON.message += ', Genres';
    failedToVerify = true;
  }

  // If we failed to verify, send a 400 and end here
  if (failedToVerify === true) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // We now need to parse genres into an array
  const genreArray = genres.split(',');
  for (let index = 0; index < genreArray.length; index++) {
    let genre = genreArray[index];
    genre = genre.trim();
  }

  // Next, change to a 200, and check if the book exists yet
  // If the book is already found to exist, update the entry, and return 204
  for (let index = 0; index < books.length; index++) {
    const book = books[index];
    if (book.title === title) {
      books[index] = {
        author,
        country,
        language,
        link,
        pages,
        title,
        year,
        genres: genreArray,
      };
      responseJSON.message = JSON.stringify(books[index]);
      return respondJSON(request, response, 204, responseJSON);
    }
  }

  // If we got past that check, we can assume no matches were found, so we make a new book
  // and return 201.
  books[books.length] = {
    author,
    country,
    language,
    link,
    pages,
    title,
    year,
    genres: genreArray,
  };
  responseJSON.message = JSON.stringify(books[books.length - 1]);
  return respondJSON(request, response, 201, responseJSON);
};

// Find a book by its title and add a genre to its array
const addGenreToBook = (request, response) => {
  // Default response
  const responseJSON = {
    message: 'Missing fields: ', // We extend this later with missing fields
  };

  console.log(request.body);

  const {
    title,
    genres,
  } = request.body;

  // Check if we're missing any parameters, and modify the message accordingly
  let failedToVerify = false; // Also prep this for at the end to see if a 400 error is needed
  if (!title) {
    responseJSON.message += 'Title';
    failedToVerify = true;
  }

  if (!genres) {
    responseJSON.message += ', Genres';
    failedToVerify = true;
  }

  // If we failed to verify, send a 400 and end here
  if (failedToVerify === true) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // We now need to parse genres into an array
  const genreArray = genres.split(',');
  for (let index = 0; index < genreArray.length; index++) {
    let genre = genreArray[index];
    genre = genre.trim();
  }

  // Next, change to a 204, and check if the book exists
  // If the book is found to exist, update the entry, and return 204
  for (let index = 0; index < books.length; index++) {
    const book = books[index];
    if (book.title === title) {
      for (let index2 = 0; index2 < genreArray.length; index2++) {
        const genre = genreArray[index2];
        books[index].genres.push(genre);
      }
      responseJSON.message = JSON.stringify(books[index]);
      return respondJSON(request, response, 204, responseJSON);
    }
  }

  // If we got past that check, we can assume no matches were found, so we return 404
  responseJSON.message = 'Book not found.';
  return respondJSON(request, response, 404, responseJSON);
};

// Not found
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

// public exports
module.exports = {
  getAllBooks,
  getBook,
  getBooksByAuthor,
  getBooksByLanguage,
  addBook,
  addGenreToBook,
  notFound,
  parseDataOnStart,
};
