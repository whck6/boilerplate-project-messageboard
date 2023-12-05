'use strict';

const { Client } = require('pg')
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'app',
  password: 'app',
})

client.connect((err) => {
  if (err) {
    console.log(err);
  }
});

module.exports = function (app) {

  app.route('/api/threads/:boardName')
    .get(function (req, res, next) {
      const { boardName } = req.params;
      const query = {
        // give the query a unique name
        name: 'fetch-board-and-threads',
        text: "select threads.id as _id, text, created_on, bumped_on, (select coalesce(json_agg(r), '[]'::json) from (select id as _id, text, created_on from replies where replies.thread_id = threads.id) as r) as replies from threads left join boards on threads.board_id = boards.id where boards.name = $1 group by threads.id",
        values: [boardName],
      }

      client.query(query, (err, result) => {
        if (err) next(err);
        res.json(result.rows);
      });
    })
    .post(async function (req, res, next) {
      console.log('post', req.path);
      console.log('post', req.body);

      const { boardName } = req.params;
      const query = {
        // give the query a unique name
        name: 'create-board',
        text: 'INSERT INTO boards (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 returning id',
        values: [boardName],
      }
      const result = await client.query(query);
      const board_id = result.rows[0].id;
      const { text, delete_password } = req.body;
      const query2 = {
        // give the query a unique name
        name: 'create-thread',
        text: 'INSERT INTO threads (text, delete_password, board_id) VALUES ($1, $2, $3)',
        values: [text, delete_password, board_id],
      }
      await client.query(query2);
      res.sendStatus(201);
    })
    .delete(function (req, res, next) {
      console.log('delete', req.path);
      console.log('delete', req.body);

      const { boardName } = req.params;
      const { thread_id, delete_password } = req.body;
      const query = {
        // give the query a unique name
        name: 'delete-thread',
        text: 'DELETE FROM threads where id = $1 and delete_password = $2',
        values: [thread_id, delete_password],
      }
      client.query(query, (err, result) => {
        res.send(result.rowCount > 0 ? 'success' : 'incorrect password');
      });
    })
    .put(function (req, res, next) {
      console.log('update', req.path);
      console.log('update', req.body);

      const { thread_id } = req.body;
      const query = {
        // give the query a unique name
        name: 'update-thread',
        text: 'update threads set reported = true where thread_id = $1',
        values: [thread_id],
      }
      client.query(query, (err, result) => {
        res.send('reported');
      });
    });

  app.route('/api/replies/:boardName')
    .get(function (req, res, next) {
      const { boardName } = req.params;
      const query = "select threads.id as _id, text, created_on, bumped_on::text, (select coalesce(json_agg(r), '[]'::json) from (select id as _id, text, created_on::text from replies where replies.thread_id = threads.id) as r) as replies from threads where threads.id = $1 group by threads.id";
      client.query(query, [req.query.thread_id], (err, result) => {
        if (err) next(err);
        res.json(result.rows[0]);
      });
    })
    .post(async function (req, res, next) {
      console.log('post', req.path);
      console.log('post', req.body);

      const { boardName } = req.params;
      const { text, delete_password, thread_id } = req.body;
      /**
       * You can send a POST request to /api/replies/{board} with form data including text, delete_password, & thread_id. This will update the bumped_on date to the comment's date. In the thread's replies array, an object will be saved with at least the properties _id, text, created_on, delete_password, & reported.
       */

      try {
        await client.query('BEGIN')
        const now = new Date();
        const query = {
          // give the query a unique name
          name: 'create-replies',
          text: 'INSERT INTO replies(text, delete_password, thread_id, created_on) values($1, $2, $3, $4)',
          values: [req.body.text, req.body.delete_password, req.body.thread_id, now],
        }
        const result = await client.query(query)

        const update = 'UPDATE threads SET bumped_on=$1 where id=$2'
        await client.query(update, [now, req.body.thread_id])
        await client.query('COMMIT')
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      }
      res.sendStatus(201);
    })
    .delete(async function (req, res, next) {
      console.log('delete', req.path);
      console.log('delete', req.body);

      const { boardName } = req.params;
      const { thread_id, delete_password, reply_id } = req.body;

      try {
        await client.query('BEGIN')

        // const query = {
        //   // give the query a unique name
        //   name: 'delete-reply',
        //   text: 'DELETE FROM replies where id = $1 and delete_password = $2',
        //   values: [reply_id, delete_password],
        // }
        // await client.query(query);

        const query2 = {
          // give the query a unique name
          name: 'delete-reply',
          text: 'UPDATE replies SET text = \'[deleted]\' where id = $1 and thread_id = $2 and delete_password = $3',
          values: [reply_id, thread_id, delete_password],
        }
        await client.query(query2);
        await client.query('COMMIT')
        res.send('success');
      } catch (e) {
        console.log(e);
        await client.query('ROLLBACK')
        res.send('incorrect password');
      }
    })
    .put(function (req, res, next) {
      console.log('update', req.path);
      console.log('update', req.body);

      const { thread_id, reply_id } = req.body;
      const query = {
        // give the query a unique name
        name: 'update-reply',
        text: 'update replies set reported = true where id = $1',
        values: [reply_id],
      }
      client.query(query, (err, result) => {
        res.send('reported');
      });
    });

};
