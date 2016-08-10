(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.service("ecapNotificationManager", constructor);

    constructor.$inject = ["ecapNotificationManagerFactory"];

    function constructor(ecapNotificationManagerFactory) {
        var notificationManager = ecapNotificationManagerFactory.create();

        this.initialize = notificationManager.initialize.bind(notificationManager);

        this.subscribeAll = function (context, action, callback) {
            return notificationManager.subscribe({
                context: context,
                id: "*",
                action: ecapNotificationManagerFactory.populateActions(action)
            }, callback);
        };

        this.subscribeSingle = function (context, id, action, callback) {
            return notificationManager.subscribe({
                context: context,
                id: id,
                action: ecapNotificationManagerFactory.populateActions(action)
            }, callback);
        };

        this.subscribeGroup = function (context, id, action, callback) {
            return notificationManager.subscribe({
                context: context,
                id: id,
                action: ecapNotificationManagerFactory.populateActions(action)
            }, callback);
        };

        this.unsubscribe = function (topic) {
            return notificationManager.unsubscribe(topic);
        };
    }
}).apply(this);
