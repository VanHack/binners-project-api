"use strict";

/**
 * User Routes
 * @description Defining all user routes
 * @author Samuel Castro
 * @since 1/14/2016
 */
var controllers = require('../controllers'),
	validators = require('../validators'),
	config = require('config'),
	version = config.get('SERVER.API_VERSION');

exports.register = function(server, options, next) {

	/**
	 * @api {get} /api/v1.0/users/ Request Users information
	 * @apiSampleRequest http://example.com/api/v1.0/users/
	 * @apiName Get Users
	 * @apiGroup Users
	 *
	 * @apiSuccess {Array} Array of users object.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *     [
	 *         {
	 *	    		_id: "55ae7c398e2d4626234ced93"
	 *				userName: "Samuel Castro"
	 *				email: "samuelcastrosilva@gmail.com"
	 *				password: "$2a$08$ewJwmQli/YWOThtMlcR3hubOKxaYr4/nCFy1.TqsCxuxpwud98T.q"
	 *				__v: 0
	 *				active: true
	 *		   },
	 *  	       {
	 *				_id: "55ae7c448e2d4626234ced95"
	 *				userName: "Samuel Castro2"
	 *				email: "samuelcastrosilva2@gmail.com"
	 *				password: "$2a$08$Wnc4KpIOxYHoaio6kl14jOnAzUuid83Hp/5W2eb8g94JwMcUS7lA2"
	 *				__v: 0
	 *				active: true
	 *		   }
	 *      ]
	 *
	 * @apiError InternalServerError: Some issue occurs when try to get users.
	 * @apiError Unprocessable Entity: Not allowed to get users	.
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 500 Internal Server Error
	 *     {
 	 *       "statusCode": 500,
 	 *       "error": "Internal Server Error",
 	 *       "message": "500 Internal Server Error"
 	 *     }
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 422 Unprocessable Entity
	 *     {
 	 *       "statusCode": 422,
 	 *       "error": "Unprocessable Entity",
 	 *       "message": "Not authorized for query on binners_dev.users"
 	 *     }
	 */
	server.route({
		method: 'GET',
		path: '/api/' + version + '/users',
		config: {
			handler : controllers.UserController.find,
			validate: validators.UserValidator.find,
			description: 'Get all users',
			notes: 'Return all users',
			tags: ['api'],
			auth: 'jwt'
		}
	});

	/**
	 * @api {get} /api/v1.0/users/{_id} Request Users information
	 * @apiSampleRequest http://example.com/api/v1.0/users/55ae7c398e2d4626234ced93
	 * @apiName Get User
	 * @apiGroup Users
	 *
	 * @apiSuccess {Object} User Object.
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *       {
	 *	   		_id: "55ae7c398e2d4626234ced93"
	 *			userName: "Samuel Castro"
	 *			email: "samuelcastrosilva@gmail.com"
	 *			password: "$2a$08$ewJwmQli/YWOThtMlcR3hubOKxaYr4/nCFy1.TqsCxuxpwud98T.q"
	 *			__v: 0
	 *			active: true
	 *		 }
	 *
	 * @apiError InternalServerError: Some issue occurs when try to get users.
	 * @apiError Unprocessable Entity: Not allowed to get users	.
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 500 Internal Server Error
	 *     {
 	 *       "statusCode": 500,
 	 *       "error": "Internal Server Error",
 	 *       "message": "500 Internal Server Error"
 	 *     }
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 422 Unprocessable Entity
	 *     {
 	 *       "statusCode": 422,
 	 *       "error": "Unprocessable Entity",
 	 *       "message": "Not authorized for query on binners_dev.users"
 	 *     }
	 */
	server.route({
		method: 'GET',
		path: '/api/' + version + '/users/{_id}',
		config: {
		  	handler : controllers.UserController.findByID,
			validate: validators.UserValidator.findByID,
			description: 'Get specific user by id',
			notes: 'Get user user',
			tags: ['api'],
			auth: 'jwt'
		}
	});

	/**
	* @api {post} /api/v1.0/users
	* @apiName Create new User
	* @apiGroup Users
	*
	* @apiParam {String} name
	* @apiParam {String} email
	* @apiParam {String} password
	* @apiParam {String} phone
	* @apiParam {Boolean} active
  * @apiParam {Array} addresses
	*
	* @apiSuccessExample Success-Response:
	*     HTTP/1.1 200 OK
	*       {
	*	   		__v: 0
	*			name: "Samuel Castro"
	*			email: "samuelcastrosilva@gmail.com"
	*			password: "$2a$08$ewJwmQli/YWOThtMlcR3hubOKxaYr4/nCFy1.TqsCxuxpwud98T.q"
	*			_id: "55ae85d9c5e6883b23dd1d71"
	*			active: true
	*		 }
	*
	* @apiError InternalServerError: Some issue occurs when try to create user.
	* @apiError Unprocessable Entity: Not allowed to create user.
	*
	* @apiErrorExample Error-Response:
	*     HTTP/1.1 500 Internal Server Error
	*     {
 	*       "statusCode": 500,
 	*       "error": "Internal Server Error",
 	*       "message": "500 Internal Server Error"
 	*     }
	*
	* @apiErrorExample Error-Response:
	*     HTTP/1.1 422 Unprocessable Entity
	*     {
 	*       "statusCode": 422,
 	*       "error": "Unprocessable Entity",
 	*       "message": "Not authorized for query on binners_dev.users"
 	*     }
	*/
	server.route({ 
		method: 'POST',
		path: '/api/' + version + '/users',
		config: {
			handler: controllers.UserController.create,
			validate: validators.UserValidator.create,
			description: 'Create a new User',
			notes: 'SignUp process',
			tags: ['api']
		}
	});

	/**
	 * @api {post} /api/v1.0/users/{_id}
	 * @apiName Update user
	 * @apiGroup Users
	 *
	 * @apiParam {String} userName
	 * @apiParam {String} email
	 * @apiParam {String} password
	 * @apiParam {String} phone
	 * @apiParam {Boolean} active
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *       {
	 *	   		__v: 0
	 *			userName: "Samuel Castro"
	 *			email: "samuelcastrosilva@gmail.com"
	 *			password: "$2a$08$ewJwmQli/YWOThtMlcR3hubOKxaYr4/nCFy1.TqsCxuxpwud98T.q"
	 *			_id: "55ae85d9c5e6883b23dd1d71"
	 *			active: true
	 *		 }
	 *
	 * @apiError InternalServerError: Some issue occurs when try to create user.
	 * @apiError Unprocessable Entity: Not allowed to update user.
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 500 Internal Server Error
	 *     {
 	 *       "statusCode": 500,
 	 *       "error": "Internal Server Error",
 	 *       "message": "500 Internal Server Error"
 	 *     }
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 422 Unprocessable Entity
	 *     {
 	 *       "statusCode": 422,
 	 *       "error": "Unprocessable Entity",
 	 *       "message": "Not authorized for query on binners_dev.users"
 	 *     }
	 */
	server.route({
		method: 'PUT', 
		path: '/api/' + version + '/users/{_id}',
		config: {
			handler: controllers.UserController.update,
			validate: validators.UserValidator.update,
			description: 'Update some user by id',
			notes: 'Updating user',
			tags: ['api'],
			auth: 'jwt'
		}
	});

	/**
	 * @api {delete} /api/v1.0/users/{_id}
	 * @apiName Remove user
	 * @apiGroup Users
	 *
	 * @apiSuccessExample Success-Response:
	 *     HTTP/1.1 200 OK
	 *       {
	 *	   		"success": true
	 *		 }
	 *
	 * @apiError InternalServerError: Some issue occurs when try to create user.
	 * @apiError Unprocessable Entity: Not allowed to update user.
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 500 Internal Server Error
	 *     {
 	 *       "statusCode": 500,
 	 *       "error": "Internal Server Error",
 	 *       "message": "500 Internal Server Error"
 	 *     }
	 *
	 * @apiErrorExample Error-Response:
	 *     HTTP/1.1 422 Unprocessable Entity
	 *     {
 	 *       "statusCode": 422,
 	 *       "error": "Unprocessable Entity",
 	 *       "message": "Not authorized for query on binners_dev.users"
 	 *     }
	 */
	server.route({
		method: 'DELETE',
		path: '/api/' + version + '/users/{_id}',
		config: {
	    	handler: controllers.UserController.delete,
	    	validate: validators.UserValidator.delete,
			description: 'Remove specific user by id',
			notes: 'Remove user',
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
  name: 'users-route',
  version: '0.0.1'
};
