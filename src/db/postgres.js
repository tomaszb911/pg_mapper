
/* PostgreSQL and PostGIS module and connection setup */

// Setup connection
var username = "tomek"; // sandbox username
var password = "admin"; // read only privileges on our table
var host = "localhost:5432";
var database = "cambridge"; // database name
var conString =
  "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection

  module.exports = conString