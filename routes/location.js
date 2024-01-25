var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date());
    next();
})

router.get('/region', function(req, res, next) {
    res.json({
        region: process.env.REGION
    });
})

module.exports = router;
