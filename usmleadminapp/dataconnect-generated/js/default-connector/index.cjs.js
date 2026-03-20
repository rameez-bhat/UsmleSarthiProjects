const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'y',
  location: 'asia-east1'
};
exports.connectorConfig = connectorConfig;

