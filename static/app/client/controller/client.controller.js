(function () {
    "use strict";

    var module = angular.module("app.client");

    module.controller("ClientCtrl", constructor);

    constructor.$inject = ["ecapNotificationManager"];

    function constructor(ecapNotificationManager) {

        ecapNotificationManager
            .initialize()
            .then(function () {
                var sid = ecapNotificationManager.subscribeSingle("person","123","*", function () {
                    console.log("person updated");
                });
                // ecapNotificationManager.unsubscribe(sid);
            });
    }
}).apply(this);
