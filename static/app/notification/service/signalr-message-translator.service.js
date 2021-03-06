(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.service("signalRMessageTranslator", constructor);

    constructor.$inject = [];

    function constructor() {
        this.messageCount = 0;

        /**
         * serializes payload into format accepted by the SignalR server
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} hub [description]
         * @param  {string} action [description]
         * @param  {object} message [description]
         * @return {object} [description]
         */
        this.serialize = function (hub, action, message) {
            return {
                A: [JSON.stringify(message)],
                I: this.messageCount++,
                H: hub,
                M: action
            };
        };

        this.deserialize = function (message) {
            var data = JSON.parse(message).M[0];

            return {
                action: data.M,
                hub: data.H,
                message: data.A
            };
        };
    }
}).apply(this);
