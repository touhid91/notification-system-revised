(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.service("urlHelper", constructor);

    constructor.$inject = [];

    function constructor() {
        /**
         * encodes a new query
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} attribute [description]
         * @param  {string} value [description]
         * @return {string} [description]
         */
        this.encodeQuery = function (attribute, value) {
            value = "object" === typeof value ?
                window.encodeURIComponent(JSON.stringify(value)) :
                window.encodeURIComponent(value);
            return [attribute, value].join("=");
        };
        /**
         * composes query string from attributes and corresponding values
         * @author touhid.alam <tua@selise.ch>
         * @param  {object} queries [description]
         * @return {string} [description]
         */
        this.composeQueryString = function (queries) {
            if (!queries)
                return "";

            var attributes = Object.keys(queries),
                encodedQueries = [];
            for (var i = 0; i < keys.length; i++)
                encodedQueries.push(this.encodeQuery(keys[i], queries[keys[i]]));

            return encodedQueries.join("&");
        };

        /**
         * [composeURL description]
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} url [description]
         * @param  {string} queryString [description]
         * @return {string} [description]
         */
        this.composeURL = function (url, queryString) {
            return queryString ? url + "?" + queryString : url;
        };

        /**
         * [isHTTPS description]
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} url [description]
         * @return {boolean} [description]
         */
        this.isHTTPS = function (url) {
            return new URL(url)
                .protocol.indexOf("https") === 0;
        };
    }
})
.apply(this);
