(function () {

    "use strict";

    var module = angular.module("app.notification");

    module.service("signalRMessageTranslator", constructor);

    constructor.$inject = [];

    function constructor() {
        this.messageCount = 0;

        /**
         * serializes payload into format accepted by the SignalR server
         * @method serialize
         * @author touhid.alam <tua@selise.ch>
         * @param  {string}  hub     [description]
         * @param  {string}  action  [description]
         * @param  {object}  message [description]
         * @return {object}          [description]
         */
        this.serialize = function (hub, action, message) {
            return {
                A: action,
                I: this.messageCount++,
                H: hub,
                M: [JSON.stringify(message)]
            };
        };

        this.deserialize = function (message) {
            return {
                action: message.A,
                hub: message.H,
                message: message.M
            };
        };
    }

}).apply(this);
