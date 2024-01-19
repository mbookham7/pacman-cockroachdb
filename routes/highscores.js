var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var Database = require("../lib/database");

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date());
  next();
});

router.get("/list", urlencodedParser, async function (req, res, next) {
  console.log("[GET /highscores/list]");
  const db = Database.getDb();
  var get_highscores =
    "SELECT name, region, score FROM highscores ORDER BY score DESC LIMIT 10";

  const dbRes = await db.query(get_highscores);

  var result = [];
  for (var i = 0; i < dbRes.rows.length; i++) {
    result.push(dbRes.rows[i]);
  }

  res.json(result);
});

// Accessed at /highscores
router.post("/", urlencodedParser, async function (req, res, next) {
  console.log(
    "[POST /highscores] body =",
    req.body,
    " host =",
    req.headers.host,
    " user-agent =",
    req.headers["user-agent"],
    " referer =",
    req.headers.referer
  );

  var userScore = parseInt(req.body.score, 10),
    userLevel = parseInt(req.body.level, 10);

  const db = Database.getDb();

  // Insert high score with extra user data
  var insert_score =
    "INSERT INTO highscores (name, score, level, region, date) VALUES ($1, $2, $3, $4, now())";

  const args = [req.body.name, userScore, userLevel, process.env.REGION];
  await db.query(insert_score, args);

  res.json({
    name: req.body.name,
    score: userScore,
    level: userLevel
  });
});

module.exports = router;
