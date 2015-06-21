var express = require('express');
var router = express.Router();
var app_config = require('../../config/app');
var app = app_config.app;
var nginxCtrl = require("./nginx.controller");


router.get('/', function (req, res) {


    nginxCtrl.readStormConfFiles(function (data) {
        return res.send(data);
    });

});

router.get('/home_dir', function (req, res) {

    nginxCtrl.getHomeDir(function (err, data) {
        if(err) {
            return res.status(500).send(err);
        }

        var url = data + "/build";
        return res.send(url);
    });

});

router.post('/save', function (req, res) {
    var data = req.body.sites;
    nginxCtrl.saveData(data,function(result) {
        nginxCtrl.reloadNginx(function(err){
            if(err) {
                return res.status(500).send(err);
            }
            res.send("ok");
        });
    });

});

module.exports = router;