/**
 * Created by aviad on 6/21/15.
 */
var app_config = require('../config/app');

var routes = function(app){
    app.use('/api/nginx', require('./nginx/'));
};


module.exports = routes(app_config.app);