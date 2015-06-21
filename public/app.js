/**
 * Created by aviad on 6/21/15.
 */
var app = angular.module('stormProxy', []);

// http://16.60.242.46:3030

app.controller("mainCtrl", ['$http', '$timeout', function ($http, $timeout) {
    var ctrl = this;
    ctrl.status = {
        ready: false,
        save_button: {
            label: "Save Changes",
            but_class: "btn-default",
            btn_disabled: true
        }
    };

    ctrl.TENANTID = [];
    var but_locked = true;

    var resetSaveButton = function (text) {
        but_locked = false;
        ctrl.status.save_button.label = text || "Save Changes";
        ctrl.status.save_button.but_class = "btn-info";
        ctrl.status.save_button.btn_disabled = false;
    };

    var static_files_dir = null;
    var init = function () {
        ctrl.sites = [];
        $http.get("/api/nginx")
            .success(function (data) {
                ctrl.sites = data;
                ctrl.status.ready = true;
                $http.get("/api/nginx/home_dir")
                    .success(function (data) {
                        static_files_dir = data;
                        resetSaveButton();
                    });
            });
    };

    init();

    ctrl.saveChanges = function () {
        if (but_locked)
            return;
        but_locked = true;
        ctrl.status.save_button.but_class = "btn-warning";
        ctrl.status.save_button.label = "Please wait...";


        ctrl.save_error = null;
        for (var i in ctrl.sites) {
            var site = ctrl.sites[i];
            if (!site.listen || !site.proxy || !site.root) {
                ctrl.save_error = "Error! Partial form data";
                resetSaveButton();
                return;
            }
        }


        $http.post('/api/nginx/save', {sites: ctrl.sites})
            .success(function (data) {
                $timeout(function() {
                    resetSaveButton("Saved!");
                },1500);
            });
    };

    ctrl.addNew = function () {
        var nport = ctrl.sites.length + 6001;

        var new_site = {
            listen: nport,
            proxy: "",
            root: static_files_dir
        };
        ctrl.sites.push(new_site);
    };

    ctrl.removeRecord = function (index) {
        if (!confirm("Sure?"))
            return;

        ctrl.sites.splice(index,1);
    };

}]);