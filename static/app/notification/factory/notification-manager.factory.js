(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.factory("NotificationManager", NotificationManager);

    NotificationManager.$inject = [
        "$q",
        "CONSTANT",
        "InMemoryStorage",
        "SignalR",
        "TopicGenerator"
    ];

    function NotificationManager(
        $q,
        CONSTANT,
        InMemoryStorage,
        SignalR,
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
            if (config.formatProvider)
                if (!config.formatProvider.incoming || !config.formatProvider.outgoing || "function" !== typeof config.formatProvider.incoming || "function" !== typeof config.formatProvider.outgoing)
                    throw "{NotificationManager.constructor} illegal formatProvider in config. undefined incoming and outgoing functions"
                else this.formatProvider = config.formatProvider;
            else this.formatProvider = {
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
                    this.signalr.connect(13);
                    this.signalr.webSocket.onmessage = function (event) {
                        var model = this.formatProvider.incoming(signalRMessageTranslator.deserialize(event.data));
                        var topic = this.topicGenerator.generate(this.topicGenerator.normalize(model, this.weight));
                        var callbacks = this.storage.read(topic);

                        //TODO invoke callback with model generated from event.data
                        for (var i = 0; i < Object.keys(callbacks).length; i++)
                            callbacks[Object.keys[i]]();

                    }.bind(this);
                    this.ready = true;
                    this.deferral.resolve();
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

            var subscriptionToken = [topic, timestamp].join(CONSANT.SEPERATOR[0]);

            this.storage.write(subscriptionToken, callback);
            this.signalr.invoke(this.remoteActionMap.subscribe, formatProvider.outgoing(model));
            this.storage.write(timestamp, formatProvider.outgoing(model));

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
            this.signalr.invoke(this.remoteActionMap.unsubscribe, this.storage.read(subscriptionToken));
        };

        return constructor;
    }
})
.apply(this);
