const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  // Catch any errors with a 400 code
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // Store chunks as they come in
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // When were done receiving data chunks, store it all in the request then call the handler
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    request.body = query.parse(bodyString);

    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/api/addBook') {
    parseBody(request, response, jsonHandler.addBook);
  } else if (parsedUrl.pathname === '/api/addGenreToBook') {
    parseBody(request, response, jsonHandler.addGenreToBook);
  }
};

const handleGet = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/') {
    htmlHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/documentation') {
    htmlHandler.getDocs(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/api/getAllBooks') {
    jsonHandler.getAllBooks(request, response);
  } else if (parsedUrl.pathname === '/api/getBook') {
    jsonHandler.getBook(request, response);
  } else if (parsedUrl.pathname === '/api/getBooksByAuthor') {
    jsonHandler.getBooksByAuthor(request, response);
  } else if (parsedUrl.pathname === '/api/getBooksByLanguage') {
    jsonHandler.getBooksByLanguage(request, response);
  } else {
    jsonHandler.notFound(request, response);
  }
};

const onRequest = (request, response) => {
  // first we have to parse information from the url
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  request.body = parsedUrl.searchParams.entries();

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  jsonHandler.parseDataOnStart();
  console.log(`Listening on 127.0.0.1: ${port}`);
});
