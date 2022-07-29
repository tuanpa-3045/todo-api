const jsonServer = require("json-server");
const auth = require("json-server-auth");
const queryString = require("query-string");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
server.db = router.db;

server.use(auth);
// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
  }
  if (req.method === "PATCH") {
    req.body.updatedAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

router.render = (req, res) => {
  const headers = res.getHeaders();
  const totalCountHeader = headers["x-total-count"];
  if (req.method === "GET" && totalCountHeader) {
    const queryParams = queryString.parse(req._parsedOriginalUrl.query);
    const results = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || 10,
        _totalRows: Number.parseInt(totalCountHeader),
      },
    };
    return res.jsonp(results);
  }
  return res.jsonp(res.locals.data);
};

const PORT = process.env.PORT || 4000;
// Use default router

server.use(auth);
server.use(router);
server.listen(PORT);
