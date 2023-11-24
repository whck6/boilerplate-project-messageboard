'use strict';

const { Client } = require('pg')
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'app',
  password: 'app',
})

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(function(req, res) {

    })
    .post(function(req, res) {
      console.log(req.body);

      client.connect((err) => {
        console.error(err);
        client.query('select * from posts', (err, queryRes) => {
          console.error(err);
          console.log(err ? err.stack : queryRes.rows[0]) // Hello World!
          client.end();
          res.status(200).json(queryRes.rows);
        })
      });
    });
    
  app.route('/api/replies/:board');

};
