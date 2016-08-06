(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.factory("InMemoryStorage", InMemoryStorage);

    InMemoryStorage.$inject = [];

    function InMemoryStorage() {

        /**
         * @constructor
         * @author touhid.alam <tua@selise.ch>
         * @param  {Array}    seperator [description]
         */
        var constructor = function (seperator) {
            if (!seperator)
                throw "{InMemoryStorage} undefined seperator";

            this.seperator = seperator;
            this.storage = {};
        };

        /**
         * reads item pointed by the location
         * @method read
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} location [description]
         * @return {[type]}          [description]
         */
        constructor.prototype.read = function (location) {
            return this.worker.read(
                location.split(this.seperator[0]),
                this.storage);
        };

        /**
         * writes item in location
         * @method write
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} location [description]
         * @param  {[type]} value    [description]
         * @return {[type]}          [description]
         */
        constructor.prototype.write = function (location, value) {
            return this.worker.write(
                location.split(this.seperator[0]),
                this.storage,
                value);
        };

        /**
         * removes the leaf node of the location
         * @method prune
         * @author touhid.alam <tua@selise.ch>
         * @param  {string} location [description]
         * @return {boolean}          [description]
         */
        constructor.prototype.prune = function (location) {
            if (location.indexOf(this.seperator[0]) === -1)
                throw "{InMemoryStorage} removing root directory is not allowed";

            var parent = location.substring(0, location.lastIndexOf(this.seperator[0])),
                tail = location.slice(location.lastIndexOf(this.seperator[0]) + 1);

            return this.worker.prune(parent.split(this.seperator[0]), tail, this.storage);
        };

        constructor.prototype.worker = {
            read: function (keys, storage) {
                if (undefined === keys[0] || "" === keys[0])
                    return storage;

                return this.read(
                    keys.slice(1),
                    storage[keys[0]]);
            },
            write: function (keys, storage, value) {
                storage = null === storage || "number" === typeof storage && {} || storage || {};

                if (undefined === keys[0] || "" === keys[0])
                    return value;

                else if (keys[0].indexOf(this.divider[1]) > -1) {
                    var siblings = keys[0].split(this.divider[1]);
                    for (var i = 0; i < siblings.length; i++) {
                        keys[0] = siblings[i];
                        storage[keys[0]] = this.write(
                            keys.slice(1),
                            storage[keys[0]],
                            value);
                    }
                } else storage[keys[0]] = this.write(
                    keys.slice(1),
                    storage[keys[0]],
                    value);

                return storage;
            },
            prune: function (keys, tail, storage) {
                if (undefined === keys[0] || "" === keys[0])
                    return delete storage[tail];

                if (keys[0].indexOf(this.divider[1]) > -1) {
                    var siblings = keys[0].split(this.divider[1]);
                    for (var i = 0; i < siblings.length; i++) {
                        keys[0] = siblings[i];

                        this.prune(
                            keys.slice(1),
                            tail,
                            storage[keys[0]]);
                    }
                }

                return this.prune(
                    keys.slice(1),
                    tail,
                    storage[keys[0]]);
            }
        };

        return constructor;
    };
}).apply(this);
