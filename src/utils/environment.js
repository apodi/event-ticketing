const fs = require('fs/promises');
const path = require('path');
const { REPLServer } = require('repl');

// Importing dotenv conditionally
if (process.env.ENV !== 'production') {
  require('dotenv').config();
}

// Use environment variables to specify the path
async function getEnvironmentVariables() {
  let dbPass = '';
  
  if (process.env.ENV !== 'production') {
    try {
      dbPass = process.env.DB_PASS || 'default_password';
    } catch (err) {
      console.error('Error reading environment variables', err);
    }
  } else {
    // for prod fetch key from secure vault like AWS Secrets Manager or Azure Key Vault etc.
  }
  
  return {
    DB_HOSTS: process.env.DB_HOSTS || 'db1:27017,db2:27017,db3:27017',
    REPLCA_SET_NAME: process.env.REPLCA_SET_NAME || 'rs0',
    DB_USER: process.env.DB_USER || 'default_user',
    DB_PASS: dbPass,
    DB_NAME: process.env.DB_NAME || 'default_db',
  };
}

module.exports = { getEnvironmentVariables };