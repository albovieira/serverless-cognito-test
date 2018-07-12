'use strict';

const jsonWebToken = require('jsonwebtoken');
const AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'; // Region

require('../config');

module.exports.preSignUp = async (event, context, callback) => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  context.done(null, event);
};

module.exports.customMessage = async (event, context, callback) => {
  console.log(event.triggerSource);
  callback(null, event);
};

module.exports.postConfirmation = async (event, context, callback) => {
  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(
    { apiVersion: '2016-04-18' }
  );
  const token = await generateToken(event.request.userAttributes);
  const params = {
    UserAttributes: [
      {
        Name: 'custom:token',
        Value: token
      }
    ],
    UserPoolId: event.userPoolId,
    Username: event.userName
  };
  cognitoidentityserviceprovider.adminUpdateUserAttributes(params, function(
    err,
    data
  ) {
    if (err) {
      console.error('error', err);
    } else {
      console.log('success', data);
    }
  });

  callback(null, event);
};

module.exports.postAuth = async (event, context, callback) => {
  console.log('Authentication successful');
  console.log('Trigger function =', event.triggerSource);
  console.log('User pool = ', event.userPoolId);
  console.log('App client ID = ', event.callerContext.clientId);
  console.log('Event object = ', event);
  console.log('testing');
  callback(null, event);
};

module.exports.migrateUsers = async (event, context, callback) => {
  const user = await authenticateUser(event.userName, event.request.password);
  if (user) {
    const mountedUser = await mountToPersistUser(user);
    event.response.userAttributes = mountedUser;
    event.response.finalUserStatus = 'CONFIRMED';
    event.response.messageAction = 'SUPPRESS';
    context.succeed(event);
    console.log('Successfully migration!');
  } else {
    callback('Bad password');
  }
};

module.exports.preTokenGeneration = async (event, context, callback) => {
  const userAttributes = event.request.userAttributes;
  const attributes = await unMountPersistedUser(userAttributes);
  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        ...attributes
      },
      claimsToSuppress: []
    }
  };
  console.log(event);
  callback(null, event);
};

async function authenticateUser(username, password) {
  //same check of max auth api
  return {
    username: 'felipeari',
    name: 'Felipe Arimatéia Terra Souza',
    email: 'felipearimateia2@gmail.com',
    gender: 'male',
    location: 'Belo Horizonte',
    birthday: '1986-02-26',
    state: 'MG',
    type_person: 'Pessoa Física',
    isAdmin: true,
    idclient: '133984',
    ssn: '068.046.016-02',
    specialClient: 0,
    phone: '(31) 99292-8793',
    roles: [],
    data: {
      iduser: '133944'
    }
  };
}

async function generateToken(user) {
  const token = await jsonWebToken.sign(
    {
      expiresIn: '30d',
      algorithm: 'HS256',
      ...user
    },
    process.env.SECRET
  );
  return token;
}

async function mountToPersistUser(user) {
  let mountedUser = {};
  const prefix = 'custom:';
  for (let attr in user) {
    if (attr === 'email') continue;

    if (user[attr] instanceof Object) {
      mountedUser[`${prefix}${attr}`] = JSON.stringify(user[attr]);
      continue;
    }
    mountedUser[`${prefix}${attr}`] = user[attr];
  }
  mountedUser.email = user.email;
  mountedUser.email_verified = 'true';
  const token = await generateToken(user);
  mountedUser[`${prefix}token`] = token;
  console.log('token generated:', token);
  return mountedUser;
}

async function unMountPersistedUser(user) {
  let unMountedUser = {};
  const prefix = 'custom:';
  for (let attr in user) {
    if (attr.startsWith(prefix)) {
      const attrFixed = attr.replace(prefix, '');
      unMountedUser[attrFixed] = user[attr];
    }
  }
  unMountedUser.email = user.email;
  unMountedUser.email_verified = 'true';
  return unMountedUser;
}
