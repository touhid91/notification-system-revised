(function() {
    "use strict";

    var module = angular.module("app.notification");

    module.factory("TopicGenerator", TopicGenerator);

    TopicGenerator.$inject = [];

    function TopicGenerator() {
        /**
         * @function generate
         * @param {heterogeneous array} model
         * @returns {string} topic
         */
        var constructor = function(seperator) {
            if (!seperator)
                throw "{TopicGenerator.constructor} undefined seperator";

            this.seperator = seperator;
        }

				/**
				 * generates an aggregate topic based on model
				 * @method generate
				 * @author touhid.alam <tua@selise.ch>
				 * @param  {Array} model [description]
				 * @return {string}       [description]
				 */
        constructor.prototype.generate = function(model) {
            if (!model)
                throw "{TopicGenerator.generate} undefined model";

            for (var i = 0; i < model.length; i++)
                if (Array.isArray(model[i]))
                    if (model[i].length === 0)
                        model.splice(i, 1);
                    else
                        model[i] = model[i].join(this.seperator[1]);

            return model.join(this.seperator[0]);
        };

				/**
         * normalizes the model into array of arrays respecting the weight, if specified
         * @method normalize
         * @author touhid.alam <tua@selise.ch>
         * @param  {object}  model  [description]
         * @param  {array}  weight [description]
         * @return {array}         [description]
         */
        this.normalize = function (model, weight) {
            var normalizedModel = [];

            if (weight)
                for (var i = 0; i < weight.length; i++)
                    normalizedModel.push(model[weight[i]]);
            else
                for (var i = 0; i < Object.keys(model).length; i++)
                    normalizedModel.push(Object.keys(model[i]));

            return normalizedModel;
        };

        return constructor;
    }
}).apply(this);