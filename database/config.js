require('dotenv').config();

var config = {
  host: process.env.MYSQL_HOST || 'mysql_db',
  user: process.env.MYSQL_USER || 'usuario',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'suscripcion',
  multipleStatements: true
};

module.exports = config;