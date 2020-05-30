var express = require("express");
const port = 3002;
var app = express();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/", function (req, res) {
  var data = {
    Fruits: ["apple", "orange"],
  };
  res.json(data);
});
app.get("/test", function (req, res) {
  const name = req.query.name;
  var file = __dirname + "/src/assets/pdf/" + name;
  res.download(file); // Set disposition and send it.
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
