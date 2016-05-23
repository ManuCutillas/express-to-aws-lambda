'use strict';
var jwt = require('jsonwebtoken'),
    config = require('../config'),
    AuthPolicy = require('./authPolicy').AuthPolicy;

//TODO https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/

module.exports.handler = function(event, context, cb) {
  var options = {};

  jwt.verify(event.authorizationToken, config.auth.secret, options, function(err, verifiedJwt) {
    if(err) {
      console.log(err);
      cb("Unauthorized");
      return;
    }

    // parse the ARN from the incoming event
    var apiOptions = {};
    var tmp = event.methodArn.split(':');
    var apiGatewayArnTmp = tmp[5].split('/');
    var awsAccountId = tmp[4];
    apiOptions.region = tmp[3];
    apiOptions.restApiId = apiGatewayArnTmp[0];
    apiOptions.stage = apiGatewayArnTmp[1];

    var policy = new AuthPolicy(verifiedJwt.username, awsAccountId, apiOptions);

    policy.allowAllMethods();
    // Or define subset based on scop - verifiedJwt.body.scope
    //policy.allowMethod(AuthPolicy.HttpVerb.GET, "*");
    //policy.allowMethod(AuthPolicy.HttpVerb.POST, "/users/" + verifiedJwt.body.sub);

    cb(null, policy.build());
  });
};