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
         * @param  {string} serviceEndPoint [description]
         * @param  {string} hub [description]
         */
        var constructor = function (serviceEndPoint, hub) {
            if (!serviceEndPoint)
                throw "{SignalR.constructor} undefined serviceEndPoint";
            if (!hub)
                throw "{SignalR.constructor} undefined hub";

            this.serviceEndPoint = serviceEndPoint.endsWith("/") ? serviceEndPoint.slice(0, -1) : serviceEndPoint;
            this.hub = hub;
            
            //TODO Authorization
            this.queries = {
                Authorization: "bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnRfaWQiOiIyMDBERTc5Qi1EQ0NELTQ5NjUtQkM5My0wQTZBOEU2QUUzNTUiLCJzdWIiOiI3YmZkYzU1NC0zYzMzLTRhNDAtYTA2OC05NThlMTVlMDNlOWUiLCJzaXRlX2lkIjoiRUU3ODU5MkQtNTI3Qy00NDhBLTlCNjQtRThDNzI3MUNDMDA4Iiwib3JpZ2luIjoiZGV2LnNlbGlzZS5iaXoiLCJzZXNzaW9uX2lkIjoiODBlMmU5MzI4M2QwNDZlNDlhMDg4MzY4YThhNWNkY2EiLCJ1c2VyX2lkIjoiN2JmZGM1NTQtM2MzMy00YTQwLWEwNjgtOTU4ZTE1ZTAzZTllIiwiZGlzcGxheV9uYW1lIjoiTWQuIEFidWwgS2FzaW0iLCJzaXRlX25hbWUiOiJKYW1haG9vayBUZWFtIiwidXNlcl9uYW1lIjoiYWJ1bC5rYXNpbUBzZWxpc2UuY2giLCJ1bmlxdWVfbmFtZSI6IjdiZmRjNTU0LTNjMzMtNGE0MC1hMDY4LTk1OGUxNWUwM2U5ZSIsInJvbGUiOlsiYXBwdXNlciIsImFwcHVzZXIiXSwiaXNzIjoiaHR0cDovL3NlbGlzZS5jaCIsImF1ZCI6IioiLCJleHAiOjE0NzI4MjA2MTIsIm5iZiI6MTQ3MDIyODYxMn0.8v3-BBN_Z-DKk3yMg-mzlsloOjtswe-2-J78oMY4CzA",
                connectionData: [{
                    name: hub.toLowerCase()
                }],
                tid: Math.floor(Math.random() * 11),
                transport: "webSockets"
            };
        };
        /**
         * issues a new negotiate HTTP request
         * @author touhid.alam <tua@selise.ch>
         * @return {Promise} [description]
         */
        constructor.prototype.negotiate = function () {
            var url = this.serviceEndPoint + "/signalr/negotiate";
            var deferral = $q.defer();

            $http.get(urlHelper.composeURL(url, urlHelper.composeQueryString(this.queries)))
                .then(callback.bind(this), deferral.reject);

            return deferral.promise;

            function callback(response) {
                var keys = Object.keys(response.data);

                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i][0].toLowerCase() + keys[i].slice(1);
                    this.queries[key] = response.data[keys[i]];
                }
                deferral.resolve(this);
            }
        };
        /**
         * establishes connection with the web socket server, initializes the WebSocket object
         * @author touhid.alam <tua@selise.ch>
         * @param  {string|Array} protocol [description]
         * @return {SignalR} [description]
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
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} action [description]
         * @param  {object} message [description]
         * @return {SignalR} [description]
         */
        constructor.prototype.invoke = function (action, message) {
            if (!action)
                throw "{SignalR.invoke} undefined action";
            if (!this.webSocket)
                throw "{SignalR.invoke} WebSocket not initialized. Make sure you negotiate before trying to connect";

            this.webSocket.send(JSON.stringify(signalRMessageTranslator.serialize(this.hub, action, message)));

            return this;
        };

        return constructor;
    }
})
.apply(this);
