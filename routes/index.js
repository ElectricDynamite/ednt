/*
 * This file is part of Electric Dynamite Network Tools (ednt).
 * ednt is copyright 2014 Philipp Geschke <pg@electricdynamite.de>
 *
 * ednt is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Foobar is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with ednt.  If not, see <http://www.gnu.org/licenses/>.
 */

var express = require('express');
var router = express.Router();


/*
 * Default route that will catch all installed plugins' routes and
 * delegate requests
 */
router.use(function(req, res) {
  var result = '';
  /// This still subscribes multiple times, which is BS. Todo Fix
  req.plugin.on('output', function(err, output) {
    console.log('OUTPUT: '+output);
    app.socket.emit('message', output);
  });
  req.plugin.once('end', function(err) {
    console.log('END REQUEST');
  });
  req.plugin.newRequest(req);
  res.render('index', { title: 'Electric Dynamite Network Tools', result: 'dummy'});
});


module.exports = router;
