(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.factory("InMemoryStorage", InMemoryStorage);

    InMemoryStorage.$inject = [];

    function InMemoryStorage() {

        /**
         * @constructor
         * @author touhid.alam <tua@selise.ch>
         * @param  {Array} seperator [description]
         */
        var constructor = function (seperator) {
            if (!seperator)
                throw "{InMemoryStorage} undefined seperator";

            this.seperator = seperator;
            this.memory = {};
        };

        /**
         * reads item pointed by the location
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} location [description]
         * @return {[type]} [description]
         */
        constructor.prototype.read = function (location) {
            return this.worker().read(location.toString().split(this.seperator[0]), this.memory);
        };

        /**
         * writes item in location
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} location [description]
         * @param  {object} value [description]
         * @return {[type]} [description]
         */
        constructor.prototype.write = function (location, value) {
            return this.worker().write(location.toString().split(this.seperator[0]), this.memory, value);
        };

        /**
         * removes the leaf node of the location
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} location [description]
         * @return {boolean} [description]
         */
        constructor.prototype.prune = function (location) {
            if (location.toString().indexOf(this.seperator[0]) === -1)
                throw "{InMemoryStorage} removing root directory is not allowed";

            var parent = location.toString().substring(0, location.toString().lastIndexOf(this.seperator[0])),
                tail = location.toString().slice(location.toString().lastIndexOf(this.seperator[0]) + 1);

            return this.worker().prune(parent.split(this.seperator[0]), tail, this.memory);
        };

        constructor.prototype.worker = function () {
            var seperator = this.seperator;
            return {
                read: function (keys, memory) {
                    if (undefined === keys[0] || "" === keys[0])
                        return memory;
                    return this.read(keys.slice(1), memory[keys[0]]);
                },
                write: function (keys, memory, value) {
                    memory = null === memory || "number" === typeof memory && {} || memory || {};

                    if (undefined === keys[0] || "" === keys[0])
                        return value;
                    else if (keys[0].indexOf(seperator[1]) > -1) {
                        var siblings = keys[0].split(seperator[1]);
                        for (var i = 0; i < siblings.length; i++) {
                            keys[0] = siblings[i];
                            memory[keys[0]] = this.write(keys.slice(1), memory[keys[0]], value);
                        }
                    } else
                        memory[keys[0]] = this.write(keys.slice(1), memory[keys[0]], value);

                    return memory;
                },
                prune: function (keys, tail, memory) {
                    if (undefined === keys[0] || "" === keys[0])
                        return delete memory[tail];

                    if (keys[0].indexOf(seperator[1]) > -1) {
                        var siblings = keys[0].split(seperator[1]);
                        for (var i = 0; i < siblings.length; i++) {
                            keys[0] = siblings[i];
                            this.prune(keys.slice(1), tail, memory[keys[0]]);
                        }
                    }

                    return this.prune(keys.slice(1), tail, memory[keys[0]]);
                }
            };
        };

        return constructor;
    };
}).apply(this);
