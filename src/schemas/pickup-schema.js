"use strict";
var Joi = require('joi');
/**
 * Pickup schema.
 *
 * @description Pickup definition schema.
 *
 * @author Leonardo Cabral <leomcabral@gmail.com>
 * @since 02/28/2016
 */
function PickupSchema() {
    this.schema = {
        requester: Joi.string().description('User id that requested the pickup'),
        address: {
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zip: Joi.string(),
            location: Joi.object({
                type: Joi.string(),
                coordinates: Joi.array().items(Joi.number())
            })
        },
        time: Joi.date().description('Date/time to the pickup'),
        instructions: Joi.string().description('Instructions to the binner'),
        items: Joi.array().items(Joi.object({
            type: Joi.string().valid('can', 'bottle').description('Type of item'),
            packageSize: Joi.string().valid('small', 'medium', 'large').description('Size classification of the units'),
            quantity: Joi.string().description('Number of packages of this type and size. May be a string.')
        })),
        authorization: Joi.object({
            'Authorization': Joi.string().description('Authorization Token')
        }).unknown()
    };
}
module.exports = PickupSchema;