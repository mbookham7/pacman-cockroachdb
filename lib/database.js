var { Client } = require("pg");
var db;

const databaseURL = process.env.DATABASE_URL;
console.log(databaseURL);

db = new Client({
  statement_timeout: 3000,
  connectionString: databaseURL,
});
db.connect()

function Database() {
  this.connect = function (app, callback) {
    app.locals.db = db;
  };

  this.getDb = function () {
    return db;
  };
}

module.exports = exports = new Database(); // Singleton
