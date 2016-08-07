(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.factory("NotificationManager", NotificationManager);

    NotificationManager.$inject = [
        "$interval",
        "$q",
        "CONSTANT",
        "InMemoryStorage",
        "SignalR",
        "signalRMessageTranslator",
        "TopicGenerator"
    ];

    function NotificationManager(
        $interval,
        $q,
        CONSTANT,
        InMemoryStorage,
        SignalR,
        signalRMessageTranslator,
        TopicGenerator) {
        /**
         * @constructor
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} serviceEndPoint [description]
         * @param  {object} config [description]
         */
        var constructor = function (serviceEndPoint, config) {
            if (!serviceEndPoint)
                throw "{NotificationManager.constructor} undefined serviceEndPoint";
            if (!config)
                throw "{NotificationManager.constructor} undefined config";
            if (!config.hub)
                throw "{NotificationManager.constructor} undefined hub in config";
            if (!config.remoteActionMap)
                throw "{NotificationManager.constructor} undefined remoteActionMap in config";
            if (!config.remoteActionMap.subscribe || !config.remoteActionMap.unsubscribe)
                throw "{NotificationManager.constructor} illegal remoteActionMap in config";
            if ("function" === typeof config.weight) {
                this.formatProvider = config.weight;
                this.weight = undefined;
            }
            if (config.formatProvider) {
                if (!config.formatProvider.incoming || !config.formatProvider.outgoing || "function" !== typeof config.formatProvider.incoming || "function" !== typeof config.formatProvider.outgoing)
                    throw "{NotificationManager.constructor} illegal formatProvider in config. undefined incoming and outgoing functions";
            } else config.formatProvider = {
                incoming: function (data) {
                    return data;
                },
                outgoing: function (data) {
                    return data;
                }
            };

            this.signalr = new SignalR(serviceEndPoint, config.hub);
            this.storage = new InMemoryStorage(CONSTANT.SEPERATOR);
            this.topicGenerator = new TopicGenerator(CONSTANT.SEPERATOR);
            this.config = config;
            this.deferral = $q.defer();
            this.ready = false;
        };

        /**
         * initializes WebSocket and registers to onmessage event
         * @author touhid.alam <tua@selise.ch>
         * @return {Promise} [description]
         */
        constructor.prototype.initialize = function () {
            if (this.ready)
                this.deferral.resolve();

            this.signalr
                .negotiate()
                .then(function () {
                    this.signalr.connect();
                    this.signalr.webSocket.onmessage = function (event) {
                        if (event.data === "{}")
                            return;

                        var model = this.config.formatProvider.incoming(signalRMessageTranslator.deserialize(event.data));

                        if (!model.hub)
                            return;

                        var topic = this.topicGenerator.generate(this.topicGenerator.normalize(model, this.weight));
                        var callbacks = this.storage.read(topic);

                        //TODO invoke callback with model generated from event.data
                        var keys = Object.keys(callbacks);
                        for (var i = 0; i < keys.length; i++)
                            callbacks[keys[i]]();

                    }.bind(this);

                    var eid = $interval(function () {
                        if (this.signalr.webSocket.readyState === 1) {
                            this.ready = true;
                            $interval.cancel(eid);
                            this.deferral.resolve();
                        }
                        console.info(this.signalr.webSocket.readyState);
                    }.bind(this));

                }.bind(this));

            return this.deferral.promise;
        };
        /**
         * generates a topic from model respecing the weight, registers its callback, sends the translated model to server
         * @author touhid.alam <tua@selise.ch>
         * @param  {object} model [description]
         * @param  {function} callback [description]
         * @return {string} [description]
         */
        constructor.prototype.subscribe = function (model, callback) {
            if (!model)
                throw "{NotificationManager.subscribe} undefined model";
            if (!callback || "function" !== typeof callback)
                throw "{NotificationManager.subscribe} illegal callback";

            var topic = this.topicGenerator.generate(this.topicGenerator.normalize(model, this.weight));
            var timestamp = Date.now();

            var subscriptionToken = [topic, timestamp].join(CONSTANT.SEPERATOR[0]);

            this.storage.write(subscriptionToken, callback);
            this.signalr.invoke(this.config.remoteActionMap.subscribe, this.config.formatProvider.outgoing(model));
            this.storage.write(timestamp, this.config.formatProvider.outgoing(model));

            return subscriptionToken;
        };
        /**
         * unsubscribes from the registered topic
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} subscriptionToken [description]
         * @return {boolean} [description]
         */
        constructor.prototype.unsubscribe = function (subscriptionToken) {
            if (!subscriptionToken)
                throw "{NotificationManager.subscribe} undefined subscriptionToken";

            this.storage.prune(subscriptionToken);
            var timestamp = subscriptionToken.slice(subscriptionToken.lastIndexOf(">") + 1);
            this.signalr.invoke(this.config.remoteActionMap.unsubscribe, this.storage.read(timestamp));
        };

        return constructor;
    }
})
.apply(this);
