(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.service("ecapNotificationManagerHelper", constructor);

    constructor.$inject = ["NotificationManager"];

    function constructor(NotificationManager) {
        this.hub = "NotifierServerHub";
        this.remoteActionMap = {
            subscribe: "Subscribe",
            unsubscribe: "Unsubscribe"
        };
        this.weight = ["context", "id", "action"];
        this.outgoingFormatProvider = function (model) {
            var aoo = [];

            if (!model.id)
                aoo.push({
                    "Context": model.context
                });
            else if ("string" === typeof model.id || "number" === typeof model.id)
                if (model.action && model.action.length > 0)
                    for (var i = 0; i < model.action.length; i++)
                        aoo.push({
                            "Context": model.context,
                            "Value": model.id,
                            "ActionName": model.action[i]
                        });

                else
                    for (var i = 0; i < model.id.length; i++)
                        if (model.action && model.action.length > 0)
                            for (var j = 0; j < model.action.length; j++)
                                aoo.push({
                                    "Context": model.context,
                                    "Value": model.id[i],
                                    "ActionName": model.action[j]
                                });

                        else aoo.push({
                            "Context": model.context,
                            "Value": model.id[i],
                        });
            return aoo;
        };

        /**
         * creates a new instance of NotificationManager for ecapNotificationManagerHelper
         * @method createNotificationManager
         * @author touhid.alam <tua@selise.ch>
         * @return {NorificationManager}                  [description]
         */
        this.createNotificationManager = function () {
            return new NotificationManager("http://172.16.0.223/Selise.AppSuite.Notifier.NotifierServer", {
                hub: this.hub,
                remoteActionMap: this.remoteActionMap,
                weight: this.weight,
                formatProvider: {
                    incoming: function (message) {
                        return message;
                    },
                    outgoing: this.outgoingFormatProvider
                }
            });
        };

        this.populateActions = function (action) {
            var model = [],
                acceptedActions = [
                    "create",
                    "delete",
                    "modify",
                    "view"
                ];
            if (action)
                if ("string" === typeof action)
                    if (acceptedActions.indexOf(action) > -1)
                        model.push(action);
                    else
                        model = acceptedActions;
            else if (Array.isArray(action))
                model = action.filter(function (value, index, self) {
                    return /*unique*/ index === self.indexOf(value) && /*accepted*/ this.acceptedActions.indexOf(value) > -1;
                }.bind(this)).sort().map(function (value) {
                    return value.toLowerCase()
                });
            else model = acceptedActions;

            return model;
        };
    }

}).apply(this);
