var express = require("express");
const session = require("express-session");

var db = require("./models");

var app = express();

app.use(express.static("public"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

app.use(session({
  secret: "this is a secret you know what i mean",
  // TODO replace with environment variable for production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000*60*60*2
    //TODO add secure cookie for production
  }
}))

var routes = require("./controllers/thirsty_controller.js");


app.use(routes);


var PORT = process.env.PORT || 3000;
db.sequelize.sync({force: false}).then(function() {
  app.listen(PORT, function() {
    console.log(`App now listening on port: ${PORT} view at: http://localhost:${PORT}`);
  });
});
