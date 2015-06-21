/**
 * Created by aviad on 6/21/15.
 */
var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;
var NginxConfFile = require('nginx-conf').NginxConfFile;


var conf_path = "/etc/nginx/conf.d/";

var nginxCtrl = {

    getHomeDir: function(callback) {
        var child = exec("find / -type d -name 'main.webapp'", function (error, stdout, stderr) {

            if(stderr) {
                return callback(stderr);
            }

            if (error !== null) {
                return callback(error);
            }


            if(stdout) {
                return callback(null, stdout.replace(/(\r\n|\n|\r)/gm,""));
            }
            else {
                return callback("not found");
            }
        });
    },

    readStormConfFiles: function (callback) {
        var sites = [];
        var site_data;

        fs.readdir('/etc/nginx/conf.d', function (err, files) {
            var c = 0;
            var files_c = 0;
            if(files.length < 1) {
                callback([]);
                return;
            }

            for (var i in files) {
                var file_name = files[i];

                if (file_name.indexOf(".storm.conf") > -1) {
                    NginxConfFile.create(conf_path + file_name, function (err, conf) {
                        var obj = {};



                        if(conf.nginx.server.length > 1) {
                            // case array of servers

                            for(var j in conf.nginx.server) {
                                site_data = {};
                                try {
                                    site_data.root = conf.nginx.server[j].root._value;
                                    site_data.listen = parseInt(conf.nginx.server[j].listen._value);
                                    site_data.proxy = conf.nginx.server[j].location[1].proxy_pass._value;

                                    sites[c] = site_data;
                                }
                                catch (err) {}
                                c++;
                            }
                        }
                        else {
                            // case one server
                            site_data = {};
                            try {
                                site_data.root = conf.nginx.server.root._value;
                                site_data.listen = parseInt(conf.nginx.server.listen._value);
                                site_data.proxy = conf.nginx.server.location[1].proxy_pass._value;
                                sites[c] = site_data;
                            }
                            catch (err) {}
                            c++;
                        }





                        files_c++;
                        if (files.length === files_c) {
                            callback(sites);
                        }
                    });
                }
            }
        });
    },

    saveData: function (sites, callback) {
        var f_name;
        var obj;

        f_name = conf_path + "all" + ".storm.conf";


        fs.writeFile(f_name, "", function (err) {
            if (err) {
                return console.log(err);
            }

            NginxConfFile.create(f_name, function (err, conf) {

                var c = 0;
                for (var i in sites) {
                    conf.nginx._add('server');

                    obj = conf.nginx.server;
                    if (c > 0) {
                        obj = conf.nginx.server[c];
                    }

                    obj._add('listen', sites[i].listen);
                    obj._add('server_name', '_');
                    obj._add('root', sites[i].root);
                    obj._add('charset', 'utf-8');
                    obj._add('location', '/');
                    obj.location._add('try_files', '$uri /index.html');
                    obj._add('location', '/api');
                    obj.location[1]._add('proxy_pass', sites[i].proxy);
                    obj.location[1]._add('proxy_http_version', '1.1');
                    obj.location[1]._add('proxy_set_header', 'Upgrade $http_upgrade');
                    obj.location[1]._add('proxy_set_header', "Connection 'upgrade'");
                    obj.location[1]._add('proxy_set_header', 'Host $host');
                    obj.location[1]._add('proxy_cache_bypass', '$http_upgrade');
                    c++;

                }
                callback("ok");

            });

        });


    },

    reloadNginx: function (callback) {
        var child = exec("service nginx reload", function (error, stdout, stderr) {
            sys.print('stdout: ' + stdout);
            if(stderr) {
                sys.print('stderr: ' + stderr);
                callback('stderr: ' + stderr);
            }

            if (error !== null) {
                console.log('exec error: ' + error);
                sys.print('stderr: ' + stderr);
                callback('exec error: ' + error);
            }

            callback(null);
        });
    },

    readFIle: function () {

        var conf_path = "/etc/nginx/nginx.conf";
        conf_path = "/etc/nginx/conf.d/storm.conf";

        NginxConfFile.create(conf_path, function (err, conf) {
            if (err) {
                console.log(err);
                return;
            }

            console.log(conf.nginx.server.location[0]);


            //conf.nginx.http._add('server');
            //conf.nginx.http.server._add('listen', '80');
        });
    }
};


module.exports = nginxCtrl;