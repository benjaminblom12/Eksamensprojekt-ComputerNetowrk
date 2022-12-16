const { reject } = require("lodash");
const { resolve } = require("path");
const { Connection, Request, TYPES } = require("tedious");
const config = require("../config.json");
const bcrypt = require("bcrypt");

// DB funktioner inspireret af Nicolai Frost https://www.youtube.com/watch?v=Nry_sp_JSOU
//Starter en connection til databasen
var connection = new Connection(config);
function startDb() {
  return new Promise((resolve, reject) => {
    connection.on("connect", (err) => {
      if (err) {
        console.log("Connection failed");
        reject(err);
        throw err;
      } else {
        console.log("Connected");
        resolve();
      }
    });
    connection.connect();
  });
}
module.exports.sqlConnection = connection;
module.exports.startDb = startDb;

//opretter bruger
function uploadUser(userData) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(userData.password, 10, function (err, hash) {
      if (err) {
        reject(err);
      }
      // store hash in the database
      const sqlQuery =
        "INSERT INTO [dbo].[brugerOplysninger] (email, password) VALUES (@email, @password)";
      const request = new Request(sqlQuery, (err) => {
        if (err) {
          reject(err);
          console.log(err);
        }
      });
      request.addParameter("email", TYPES.VarChar, userData.email);
      request.addParameter("password", TYPES.VarChar, hash);
      request.on("requestCompleted", (row) => {
        resolve("successfully added:", row);
      });
      connection.execSql(request);
    });
  });
}
module.exports.uploadUser = uploadUser;

//Opretter session
function opretSession(sessionD) {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "INSERT INTO [dbo].[sessionT] (email, token) VALUES (@email, @token)";
    const request = new Request(sqlQuery, (err) => {
      if (err) {
        reject(err);
        console.log(err);
      }
    });
    request.addParameter("email", TYPES.VarChar, sessionD.email);
    request.addParameter("token", TYPES.VarChar, sessionD.token);

    request.on("requestCompleted", (row) => {
      resolve("successfully added:", row);
    });
    connection.execSql(request);
  });
}
module.exports.opretSession = opretSession;

// Authenticerer brugeren
function Authenticerer(email, password) {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "SELECT * FROM [dbo].[brugerOplysninger] where email = @email";
    const request = new Request(sqlQuery, (err, rowcount, rows) => {
      if (err) {
        reject(err);
      } else if (rowcount == 0) {
        reject({ message: "user ikke ok" });
      } else {
        const hashedPassword = rows[0][1].value;
        bcrypt.compare(password, hashedPassword, function (err, result) {
          if (err) {
            reject(err);
          } else {
            if (result == false) {
              reject({ message: "user ikke ok" });
            } else {
              resolve(result);
            }
          }
        });
      }
    });
    request.addParameter("email", TYPES.VarChar, email);

    connection.execSql(request);
  });
}
module.exports.Authenticerer = Authenticerer;

// Checker session

function checkSession(token, email) {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "SELECT * FROM sessionT where email = @email AND token = @token";
    const request = new Request(sqlQuery, (err, rowcount) => {
      if (err) {
        reject(err);
        console.log(err);
        //Da tokens er unikke rejectes hvis der ikke er præcis én row med token og email
      } else if (rowcount != 1) {
        reject({ message: "user not logged in" });
      }
    });
    request.addParameter("email", TYPES.VarChar, email);
    request.addParameter("token", TYPES.VarChar, token);
    request.on("row", (columns) => {
      resolve(columns);
    });
    connection.execSql(request);
  });
}
module.exports.checkSession = checkSession;
