(function () {
    "use strict";

    var module = angular.module("app.notification", constructor);

    constructor.$inject = ["ecapNotificationManagerHelper"];

    function constructor(ecapNotificationManagerHelper) {
        this.notificationManager = ecapNotificationManagerHelper.createNotificationManager.apply(this);

        this.subscribeAll = function (context, action, callback) {
            return this.notificationManager.subscribe({
                context: context,
                action: ecapNotificationManagerHelper.populateActions(action)
            }, callback);
        };

        this.subscribeSingle = function (entityName, id, action, callback) {
            return this.notificationManager.subscribe({
                context: context,
                id: id,
                action: ecapNotificationManagerHelper.populateActions(action)
            }, callback);
        };

        this.subscribeGroup = function (entityName, id, action, callback) {
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
