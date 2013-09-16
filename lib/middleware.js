/*!
Kettle Infusion/Express Middleware

Copyright 2012-2013 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/kettle/LICENSE.txt
*/

(function () {

    "use strict";

    var fluid = require("infusion"),
        express = require("express"),
        kettle = fluid.registerNamespace("kettle");

    fluid.defaults("kettle.middleware", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            onCreate: [{
                listener: "{requests}.events.registerMiddleware.fire",
                args: "{that}"
            }, "{that}.apply"]
        },
        invokers: {
            resolveEventName: {
                funcName: "kettle.middleware.resolveEventName",
                args: "{middleware}.typeName"
            },
            handle: {
                funcName: "kettle.middleware.handle",
                args: "{arguments}.0"
            },
            apply: {
                funcName: "kettle.middleware.apply",
                args: ["{kettle.server}.server", "{that}.resolveEventName"]
            }
        },
    });

    /**
     * Register a middleware wrapper.
     * @param  {Object} server an express server.
     * @param  {Function} resolveEventName event name builder.
     */
    kettle.middleware.apply = function (server, resolveEventName) {
        server.use(function (req, res, next) {
            var eventName = resolveEventName();
            req.fluidRequest.events[eventName].fire(req.fluidRequest);
        });
    };

    /**
     * Event name builder.
     * @param  {String} typeName middle ware type name.
     * @return {String} sensible event name based on the middleware type name.
     */
    kettle.middleware.resolveEventName = function (typeName) {
        var eventName = fluid.computeNickName(typeName);
        return "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
    };

    fluid.defaults("kettle.middleware.bodyParser", {
        gradeNames: ["kettle.middleware", "autoInit"],
        invokers: {
            handle: {
                funcName: "kettle.middleware.bodyParserHandle"
            }
        }
    });

    /**
     * A wrapper around express' body parser middleware.
     * @param  {Object} request a request object.
     */
    kettle.middleware.bodyParserHandle = function (request) {
        var parser = express.bodyParser();
        parser(request.req, request.res, request.next);
    };

    fluid.demands("bodyParser", "kettle.server", {
        funcName: "kettle.middleware.bodyParser"
    });

})();
