(function () {
    "use strict";

    var module = angular.module("app.notification", NotificationManager);

    NotificationManager.$inject = ["InMemoryStorage", "SignalR", "TopicGenerator", "topicGeneratorModelNormalizer"];

    function NotificationManager(InMemoryStorage, SignalR, TopicGenerator, topicGeneratorModelNormalizer) {

        /**
         * @constructor
         * @author touhid.alam <tua@selise.ch>
         * @param  {string}    serviceEndPoint [description]
         * @param  {string}    hub             [description]
         * @param  {object}    action          [description]
         * @param  {Array}    weight          [description]
         * @param  {function}    formatProvider  [description]
         */
        var constructor = function (serviceEndPoint, hub, action, weight, formatProvider) {
            if (!serviceEndPoint)
                throw "{NotificationManager.constructor} undefined serviceEndPoint";
            if (!hub)
                throw "{NotificationManager.constructor} undefined hub";
            if (!action)
                throw "{NotificationManager.constructor} undefined action";
            if (!action.subscribe || !action.unsubscribe)
                throw "{NotificationManager.constructor} illegal action";
            if ("function" === typeof weight) {
                this.formatProvider = weight;
                this.weight = undefined;
            }
            if (formatProvider)
                if (!formatProvider.incoming || "function" !== typeof formatProvider.incoming || !formatProvider.outgoing || "function" !== typeof formatProvider.outgoing)
                    throw "{NotificationManager.constructor} illegal formatProvider. undefined incoming and outgoing functions"
                else this.formatProvider = formatProvider;
            else this.formatProvider = {
                incoming: function (data) {
                    return data;
                },
                outgoing: function (data) {
                    return data;
                }
            };

            this.signalr = new SignalR(serviceEndPoint, hub);
            this.storage = new InMemoryStorage(CONSANT.SEPERATOR);
            this.topicGenerator = new TopicGenerator(CONSANT.SEPERATOR);
        };

        constructor.prototype.initialize = function () {
            return this.signalr
                .negotiate()
                .then(function () {
                    this.signalr.connect(13);
                    this.signalr.webSocket.onmessage = function (event) {
                        var model = this.formatProvider.incoming(signalRMessageTranslator.deserialize(event.data));
                        var topic = this.topicGenerator.generate(this.topicGenerator.normalize(model, this.weight));
                        var callbacks = this.storage.read(topic);

                        for (var i = 0; i < Object.keys(callbacks).length; i++)
                            callbacks[Object.keys[i]].apply(this);
														
                    }.bind(this);
                }.bind(this))
        };

        /**
         * generates a topic from model respecing the weight, registers its callback, sends the translated model to server
         * @method subscribe
         * @author touhid.alam <tua@selise.ch>
         * @param  {object}   model    [description]
         * @param  {function} callback [description]
         * @return {string}            [description]
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
            this.signalr.invoke(this.action.subscribe, formatProvider.outgoing(model));
            this.storage.write(timestamp, formatProvider.outgoing(model));
        };

        /**
         * unsubscribes from the registered topic
         * @method unsubscribe
         * @author touhid.alam <tua@selise.ch>
         * @param  {string}    subscriptionToken [description]
         * @return {boolean}                      [description]
         */
        constructor.prototype.unsubscribe = function (subscriptionToken) {
            if (!subscriptionToken)
                throw "{NotificationManager.subscribe} undefined subscriptionToken";

            this.storage.prune(subscriptionToken);
            this.signalr.invoke(this.action.unsubscribe, this.storage.read(subscriptionToken));
        };

        return constructor;
    }
}).apply(this);
