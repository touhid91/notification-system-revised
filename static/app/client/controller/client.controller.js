(function () {
    "use strict";

    var module = angular.module("app.client");

    module.controller("ClientCtrl", constructor);

    constructor.$inject = ["ecapNotificationManager"];

    function constructor(enm) {

        enm.initialize().then(function () {
            var topic = enm.subscribeAll("person", "create", function () {
                console.log("person updated");
            });

            enm.unsubscribe(topic);
        });
    }
}).apply(this);
