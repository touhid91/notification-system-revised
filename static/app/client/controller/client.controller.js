(function () {
    "use strict";

    var module = angular.module("app.client");

    module.controller("ClientCtrl", constructor);

    constructor.$inject = ["ecapNotificationManager"];

    function constructor(ecapNotificationManager) {

        ecapNotificationManager
            .initialize()
            .then(function () {
                var sid = ecapNotificationManager.subscribeSingle("person", "123", "create", function (message) {
                    console.log("subscribeSingle person", message);
                });

                var sid2 = ecapNotificationManager.subscribeAll("person", "*", function (message) {
                    console.log("subscribeAll person", message);
                });

                var sid3 = ecapNotificationManager.subscribeGroup("person", ["1", "2", "3", "123"], "*", function (message) {
                    console.log("subscribeGroup person", message);
                });
                ecapNotificationManager.unsubscribe(sid2);
                ecapNotificationManager.unsubscribe(sid3);
            });
    }
}).apply(this);
