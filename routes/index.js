var express = require('express');
var router = express.Router();

/*
 * Default route that will catch all installed plugins' routes and
 * delegate requests
 */
router.use(function(req, res) {
  
  req.plugin.newRequest(req,res, function(e, result) {
    res.render('index', { title: 'Electric Dynamite Network Tools', result: result});
  });
});



module.exports = router;
