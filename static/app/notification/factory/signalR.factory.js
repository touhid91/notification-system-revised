(function () {

    var module = angular.module("app.notification");

    module.factory("SignalR", SignalR);

    SignalR.$inject = [
        "$http",
        "$q",
        "signalRMessageTranslator",
        "urlHelper"
    ];

    function SignalR(
        $http,
        $q,
        signalRMessageTranslator,
        urlHelper) {
        /**
         * @constructor
         * @author touhid.alam <tua@selise.ch>
         * @param  {string}    serviceEndPoint [description]
         * @param  {string}    hub             [description]
         */
        var constructor = function (serviceEndPoint, hub) {
            if (!serviceEndPoint)
                throw "{SignalR.constructor} undefined serviceEndPoint";
            if (!hub)
                throw "{SignalR.constructor} undefined hub";

            this.serviceEndPoint = serviceEndPoint.endsWith("/") ? serviceEndPoint.slice(0, -1) : serviceEndPoint;
            this.queries = {
                connectionData: [{
                    name: hub.toLowerCase()
                }],
                tid: Math.floor(Math.random() * 11),
                transport: "webSockets"
            };
        };

        /**
         * issues a new negotiate HTTP request
         * @method negotiate
         * @author touhid.alam <tua@selise.ch>
         * @return {promise}  [description]
         */
        constructor.prototype.negotiate = function () {
            var url = this.serviceEndPoint + "/signalr/negotiate";
            var deferral = $q.defer();

            $http.get(url)
                .then(callback.bind(this), deferral.reject);

            return deferral.promise;

            function callback(response) {
                var keys = Object.keys(response);

                for (var i = 0; i < keys.length; i++)
                    this.queries[keys[i]] = response.data[keys[i]];

                deferral.resolve(this);
            }
        };

        /**
         * establishes connection with the web socket server, initializes the WebSocket object
         * @method connect
         * @author touhid.alam <tua@selise.ch>
         * @param  {string|Array} protocol [description]
         * @return {SignalR}          [description]
         */
        constructor.prototype.connect = function (protocol) {
            var url = urlHelper.isHTTPS(this.serviceEndPoint) ? "wss:" : "ws:" + this.serviceEndPoint.slice(this.serviceEndPoint.indexOf("//")) + "/signalr/connect",
                queryString = urlHelper.composeQueryString(this.queries),
                url = urlHelper.composeURL(url, queryString);

            this.webSocket = new WebSocket(url, protocol);

            return this;
        };

        /**
         * invokes an action defined on server with the specified message as parameter
         * @method invoke
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} action  [description]
         * @param  {object} message [description]
         * @return {SignalR}         [description]
         */
        constructor.prototype.invoke = function (action, message) {
            if (!action)
                throw "{SignalR.invoke} undefined action";
            if (!this.webSocket)
                throw "{SignalR.invoke} WebSocket not initialized. Make sure you negotiate before trying to connect";

            this.webSocket.send(signalRMessageTranslator.serialize(this.hub, action, message));

            return this;
        };
    }
}).apply(this);
