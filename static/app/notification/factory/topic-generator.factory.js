(function () {
    "use strict";

    var module = angular.module("app.notification");

    module.factory("TopicGenerator", TopicGenerator);

    TopicGenerator.$inject = [];

    function TopicGenerator() {

        /**
         * @constructor
         * @author touhid.alam <tua@selise.ch>
         * @param  {Array} seperator [description]
         */
        var constructor = function (seperator) {
            if (!seperator)
                throw "{TopicGenerator.constructor} undefined seperator";

            this.seperator = seperator;
        };

        /**
         *
         * @author touhid.alam <tua@selise.ch>
         * @param  {Array} model [description]
         * @return {string} [description]
         */
        constructor.prototype.generate = function (model) {
            if (!model)
                throw "{TopicGenerator.generate} undefined model";

            for (var i = 0; i < model.length; i++)
                if (Array.isArray(model[i]))
                    if (model[i].length === 0)
                        model.splice(i, 1);
                    else
                        model[i] = model[i].join(this.seperator[1]);

            return model.filter(function (item) {
                return item !== undefined && item !== null;
            }).join(this.seperator[0]);
        };

        /**
         * normalizes the model into array of arrays respecting the weight, if specified
         * @author touhid.alam <tua@selise.ch>
         * @param  {object} model [description]
         * @param  {Array} weight [description]
         * @return {object} [description]
         */
        constructor.prototype.normalize = function (model, weight) {
            var normalizedModel = [];

            if (weight)
                for (var i = 0; i < weight.length; i++)
                    normalizedModel.push(model[weight[i]]);
            else {
                var keys = Object.keys(model);
                for (var i = 0; i < keys.length; i++)
                    normalizedModel.push(model[keys[i]]);
            }

            return normalizedModel;
        }

        return constructor;
    }
}).apply(this);
