"use strict";

/**
 * Auth Controller
 * @description This controller has all functions/methods for authentication process
 * @author Samuel Castro
 * @since 1/15/2016
 */
var Boom = require('boom'),
        jwt = require('jsonwebtoken'),
        config = require('config'),
        https = require('https'),
        models = require('../models'),
        crypto = require('crypto'),
        nodemailer = require('nodemailer'),
        errors = require('../lib/utilities').getErrorsCode(),
        User = models.User,
        twitterOAuth = require('../lib/utilities').twitterOAuth;

function AuthController() {}

AuthController.prototype = (function () {
    return {
        /**
         * Application auth by email and password
         * @param request
         * @param reply
         */
        auth: function (request, reply) {
            var auth = request.payload;
            User.findOne({
                email: auth.email
            }).then(function (user) {

                if (!user) {
                    var err = Boom.notFound('', errors.USER_NOT_FOUND);
                    err.output.payload.details = err.data;
                    return reply(err);
                }

                if (!user.validatePassword(auth.password)) {
                    var err = Boom.badData('', errors.INVALID_PASSWORD);
                    err.output.payload.details = err.data;
                    return reply(err);
                }

                try {
                    var token = jwt.sign(
                            {user: user.get('_id')},
                            config.get('TOKEN.SECRET'),
                            {expiresInMinutes: config.get('TOKEN.OPTIONS.EXPIRES_IN_MINUTES')}
                    );

                    reply(
                            {token: token, user: user.safeCopy()}
                    );

                } catch (err) {
                    return reply(Boom.badImplementation(err));
                }
            });
        },

        /**
         * Revalidate an user token.
         */
        revalidate: function (request, reply) {
            var userId = request.auth.credentials.id;

            User.findOne({_id: userId}).then(function (user) {
                var token = jwt.sign(
                    {user: user.get('_id')},
                    config.get('TOKEN.SECRET'),
                    {expiresInMinutes: config.get('TOKEN.OPTIONS.EXPIRES_IN_MINUTES')}
                );

                reply({token: token, user: user.safeCopy()});
            });
        },

        /**
         * Getting the auth credentials
         * @param request
         * @param reply
         */
        getAuth: function (request, reply) {
            reply(request.auth.credentials);
        },
        /**
         * Forgot password
         * @param request
         * @param reply
         */
        forgot: function (request, reply) {
            User.findOne({
                email: request.params.email
            }).then(function (user) {

                if (!user) {
                    var err = Boom.notFound('', errors.EMAIL_NOT_FOUND);
                    err.output.payload.details = err.data;
                    return reply(err);
                }

                user.doHashReset(function (err, token) {
                    if (err)
                        return reply(Boom.unauthorized('User not found!'));

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        if (err)
                            return reply(Boom.badImplementation(err));

                        var smtpTransport = nodemailer.createTransport({
                            service: 'Gmail',
                            auth: {
                                user: config.get('MAIL.USER'),
                                pass: config.get('MAIL.PASSWORD')
                            }
                        });
                        var mailOptions = {
                            to: user.email,
                            from: config.get('MAIL.FROM'),
                            subject: 'Binners Password Reset',
                            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                                    'http://' + request.headers.host + '/api/v1.0/auth/reset/' + token + '\n\n' +
                                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                        };
                        smtpTransport.sendMail(mailOptions, function (err) {
                            if (err)
                                return reply(Boom.badImplementation(err));

                            smtpTransport.close();
                            reply({success: true, token: token})
                        });
                    });
                });

            });
        },
        /**
         * Reseting password
         * @param request
         * @param reply
         */
        resetPassword: function (request, reply) {
            User.findOne({
                resetPasswordToken: request.params.token,
                resetPasswordExpires: {$gt: Date.now()}
            }).then(function (user) {

                if (!user)
                    return reply.view('reset.html', {
                        isValid: false,
                        message: 'Password reset token is invalid or has expired.'
                    });

                /**
                 * Generating reset.html for reset process
                 * @param request
                 * @param reply
                 */
                reply.view('reset.html', {
                    isValid: true,
                    email: user.email
                });
            });
        },
        /**
         * Updating Password
         * @param request
         * @param reply
         */
        doResetPassword: function (request, reply) {
            User.findOne({
                resetPasswordToken: request.params.token,
                resetPasswordExpires: {$gt: Date.now()}
            }).then(function (user) {

                if (!user)
                    return reply(Boom.unauthorized('User not found!'));

                user.doHashAsync(request.payload.password, function (err, hash) {
                    user.password = hash;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function (err) {
                        if (err)
                            return reply(Boom.badImplementation(err));

                        var smtpTransport = nodemailer.createTransport({
                            service: 'Gmail',
                            auth: {
                                user: config.get('MAIL.USER'),
                                pass: config.get('MAIL.PASSWORD')
                            }
                        });
                        var mailOptions = {
                            to: user.email,
                            from: config.get('MAIL.FROM'),
                            subject: 'Your password has been changed',
                            text: 'Hello,\n\n' +
                                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                        };
                        smtpTransport.sendMail(mailOptions, function (err) {
                            if (err)
                                return reply(Boom.badImplementation(err));

                            smtpTransport.close();
                            reply({success: true})
                        });
                    });
                });
            });
        },
        /**
         * OAuth social authentication
         * @param request
         * @param reply
         * @returns {*}
         */
        isAuthenticated: function (request, reply) {
            if (request.auth.isAuthenticated) {

                /**
                 * Generating a new JWT token
                 */
                var token = jwt.sign(
                        {user: request.auth.credentials.profile.id},
                        config.get('TOKEN.SECRET'),
                        {expiresInMinutes: config.get('TOKEN.OPTIONS.EXPIRES_IN_MINUTES')}
                );

                /**
                 * Updating social token
                 */
                request.auth.credentials.token = token;

                return reply(request.auth);
            }

            reply(Boom.unauthorized('401 Unauthorized'));
        },
        /**
         * OAuth social authentication
         * @param request
         * @param reply
         * @returns {*}
         */
        facebookAuth: function (request, reply) {
            if (request.params.accessToken) {
                https.get("https://graph.facebook.com/v2.5/me?fields=email&access_token=" + request.params.accessToken, function (response) {

                    var data = '';

                    /**
                     * Unauthorized if there is some error
                     */
                    if (response.statusCode !== 200) {
                        return reply(Boom.unauthorized('401 Unauthorized'));
                    }

                    /**
                     * Getting data
                     */
                    response.on('data', function (d) {
                        data += d;
                    });

                    /**
                     * Process end
                     */
                    response.on('end', function () {
                        var err, userData;
                        var facebookUser = JSON.parse(data);

                        // Validate user on mongodb
                        User.findOne({
                            email: facebookUser.email
                        }).then(function (user) {
                            if (!user) {
                                err = Boom.notFound('', errors.USER_NOT_FOUND);
                                err.output.payload.details = err.data;
                                return reply(err);
                            }

                            userData = user.safeCopy();

                            /**
                             * Generating a new JWT token
                             */
                            var token = jwt.sign(
                                    {user: user.id},
                                    config.get('TOKEN.SECRET'),
                                    {expiresInMinutes: config.get('TOKEN.OPTIONS.EXPIRES_IN_MINUTES')}
                            );

                            return reply({token: token, user: userData, social: true});
                        });

                    });

                }).on('error', function (e) {
                    return reply(Boom.unauthorized('401 Unauthorized'));
                });
            }
        },
        /**
         * OAuth social authentication
         * @param request
         * @param reply
         * @returns {*}
         */
        googleAuth: function (request, reply) {
            if (request.params.accessToken) {

                var options = {
                    host: 'www.googleapis.com',
                    path: '/plus/v1/people/me?fields=displayName%2Cemails%2Cgender%2Cname&key=' + request.params.accessToken,
                    headers: {
                        Authorization: 'Bearer ' + request.params.accessToken
                    }
                };

                https.get(options, function (response) {

                    var data = '';

                    /**
                     * Unauthorized if there is some error
                     */
                    if (response.statusCode !== 200) {
                        return reply(Boom.unauthorized('401 Unauthorized'));
                    }

                    /**
                     * Getting data
                     */
                    response.on('data', function (d) {
                        data += d;
                    });

                    /**
                     * Process end
                     */
                    response.on('end', function () {
                        var err, userData;
                        var googleUser = JSON.parse(data);

                        // Validate user on mongodb
                        User.findOne({
                            email: googleUser.emails.length > 0 ? googleUser.emails[0].value : null
                        }).then(function (user) {
                            if (!user) {
                                err = Boom.notFound('', errors.USER_NOT_FOUND);
                                err.output.payload.details = err.data;
                                return reply(err);
                            }

                            userData = user.safeCopy();

                            /**
                             * Generating a new JWT token
                             */
                            var token = jwt.sign(
                                    {user: user.id},
                                    config.get('TOKEN.SECRET'),
                                    {expiresInMinutes: config.get('TOKEN.OPTIONS.EXPIRES_IN_MINUTES')}
                            );

                            return reply({token: token, user: userData, social: true});
                        });

                    });

                }).on('error', function (e) {
                    return reply(Boom.unauthorized('401 Unauthorized'));
                });
            }
        },
        /**
         * Twitter OAuth social authentication
         * @param request
         * @param reply
         * @returns {*}
         */
        twitterAuth: function (request, reply) {
            twitterOAuth
                    .get(
                            'https://api.twitter.com/1.1/account/verify_credentials.json?include_entities=false&skip_status=false&include_email=true',
                            request.params.accessToken,
                            request.params.accessSecret,
                            function (err, data, res) {
                                if (err)
                                    return reply(Boom.wrap(err.data.message));

                                try {
                                    var twitterProfile = JSON.parse(data);
                                } catch (e) {
                                    return reply(Boom.wrap(e));
                                }

                                var criteria = {};
                                if (twitterProfile.email) {
                                    criteria.email = twitterProfile.email;
                                } else {
                                    criteria.social = {
                                        $elemMatch: {
                                        type: 'twitter',
                                        username: twitterProfile.screen_name
                                    }};
                                }

                                // Validate user on mongodb
                                User.findOne(criteria).then(function (user) {
                                    if (!user) {
                                        err = Boom.notFound('', errors.USER_NOT_FOUND);
                                        err.output.payload.details = err.data;
                                        return reply(err);
                                    }

                                    var userData = user.safeCopy();

                                    /**
                                     * Generating a new JWT token
                                     */
                                    var token = jwt.sign(
                                            {user: user.id},
                                            config.get('TOKEN.SECRET'),
                                            {expiresIn: config.get('TOKEN.OPTIONS.EXPIRES_IN_MINUTES')}
                                    );

                                    return reply({token: token, user: userData, social: true});
                                }, function (err) {
                                    return reply(Boom.wrap(err));
                                });

                            });
        }
    }
})();

module.exports = new AuthController();

