/**
 * Read config at given path
 * @param path
 * @constructor
 */
function ConfigReader(path) {
  const self = this;
  const fs = require('fs');
  const util = require('util');
  const _ = require('../../dep/lodash');
  const allowedEnvironmentVars = {
    token: 'CF_API_KEY',
    email: 'CF_API_EMAIL',
    domain: 'CF_API_DOMAIN'
  };

  const homePath = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];


  path = path ? path.replace('~', homePath) : false;
  self.readConfig = readConfig;

  function readConfig(account) {
    let config = {};
    //Load allowed environment variables
    const envConfig = _.fromPairs(
      _.filter(_.map(allowedEnvironmentVars, function (envVar, key) {
          if (process.env[envVar]) {
            return [key, process.env[envVar]];
          } else {
            return false;
          }
        }
      ), function (value) {
        return value !== false;
      })
    );

    return _.extend(config, envConfig);
  }
}

module.exports = ConfigReader;
