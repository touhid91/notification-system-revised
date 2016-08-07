(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.service("ecapNotificationManager", constructor);

    constructor.$inject = ["ecapNotificationManagerHelper"];

    function constructor(ecapNotificationManagerHelper) {
        this.notificationManager = ecapNotificationManagerHelper.createNotificationManager();

        this.subscribeAll = function (context, action, callback) {
            return this.notificationManager.subscribe({
                context: context,
                action: ecapNotificationManagerHelper.populateActions(action)
            }, callback);
        };

        this.subscribeSingle = function (context, id, action, callback) {
            return this.notificationManager.subscribe({
                context: context,
                id: id,
                action: ecapNotificationManagerHelper.populateActions(action)
            }, callback);
        };

        this.subscribeGroup = function (context, id, action, callback) {
            return this.notificationManager.subscribe({
                context: context,
                id: id,
                action: ecapNotificationManagerHelper.populateActions(action)
            }, callback);
        };

        this.unsubscribe = function (topic) {
            return this.notificationManager.unsubscribe(topic);
        };
    }
}).apply(this);
