'use strict';

require('../config');

module.exports.getFlights = async (event, context, callback) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    return {
      statusCode: 200,
      body: {
        userPoolId: context.identity.cognitoIdentityPoolId,
        flights: [
          {
            from: 'Belo Horizonte',
            to: 'Orlando',
            value: 200000
          },
          {
            from: 'Orlando',
            to: 'New York',
            value: 100000
          },
          {
            from: 'New York',
            to: 'Belo Horizonte',
            value: 120000
          }
        ]
      }
    };
  } catch (error) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: { message: 'Not found' }
    };
  }
};
