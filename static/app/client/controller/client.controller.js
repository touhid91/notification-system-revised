(function () {
    "use strict";

    var module = angular.module("app.client");

    module.controller("ClientCtrl", constructor);

    constructor.$inject = ["ecapNotificationManager"];

    function constructor(ecapNotificationManager) {

        ecapNotificationManager
            .initialize()
            .then(function () {
                var sid = ecapNotificationManager.subscribeAll("person", "*", function () {
                    console.log("person updated");
                });
                // ecapNotificationManager.unsubscribe(sid);
            });
    }
}).apply(this);
