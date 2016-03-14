"use strict";

var controllers = require('../controllers'),
        validators = require('../validators'),
        config = require('config'),
        version = config.get('SERVER.API_VERSION');

exports.register = function (server, options, next) {

    server.route({
        method: 'POST',
        path: '/api/' + version + '/pickup',
        config: {
            handler: controllers.PickupController.pickup,
            validate: validators.PickupValidator.pickup,
            description: 'Place a pickup',
            notes: 'Place a pickup request',
            tags: ['api', 'pickup'],
            auth: 'jwt'
        }
    });

    server.route({
        method: 'GET',
        path: '/api/' + version + '/pickups',
        config: {
            handler: controllers.PickupController.list,
            validate: validators.PickupValidator.list,
            description: 'List last 6 months user\'s pickups',
            notes: 'List last 6 months user\'s pickups',
            tags: ['api'],
            auth: 'jwt'
        }
    });

    next();

};

/**
 * Exporting plugin
 * @type {{name: string, version: string}}
 */
exports.register.attributes = {
    name: 'pickup-route',
    version: '0.0.1'
};
