(function () {
    "use strict";

    var module = angular.module("app.client");

    module.controller("ClientCtrl", constructor);

    constructor.$inject = ["ecapNotificationManager"];

    function constructor(ecapNotificationManager) {

        ecapNotificationManager
            .initialize()
            .then(function () {
                var sid = ecapNotificationManager.subscribeSingle("person", "f78e646fee5f4eecbb5da9ef23068f0e", "create", function (message) {
                    console.log("subscribeSingle person", message);
                });

                var sid2 = ecapNotificationManager.subscribeAll("person", "modify", function (message) {
                    console.log("subscribeAll person", message);
                });

                var sid3 = ecapNotificationManager.subscribeGroup("person", [
                    "107586a5ca1049cbad761f0cec54f742",
                    "18e8b9466f8c41d29e48437262b41d76",
                    "f78e646fee5f4eecbb5da9ef23068f0e",
                    "28874e1af4264897bc669a5a56c052d4"
                ], "*",
                    function (message) {
                        console.log("subscribeGroup person", message);
                    });
            });
    }
}).apply(this);
