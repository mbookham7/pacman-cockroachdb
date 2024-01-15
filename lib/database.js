var { Client } = require("pg");
var db;

const databaseURL = process.env.DATABASE_URL;
console.log(databaseURL);

db = new Client({
  statement_timeout: 3000,
  connectionString: databaseURL,
});
db.connect()

var create_table = `CREATE TABLE IF NOT EXISTS highscores (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name STRING NOT NULL,
                        score INT NOT NULL,
                        level INT NOT NULL,
                        date DATE NOT NULL
                    )`;

const res = db.query(create_table);
console.log(res);

function Database() {
  this.connect = function (app, callback) {
    app.locals.db = db;
  };

  this.getDb = function () {
    return db;
  };
}

module.exports = exports = new Database(); // Singleton
