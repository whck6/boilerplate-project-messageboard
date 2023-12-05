const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test("Creating a new thread: POST request to", function () {
        chai.request(server)
            .post('/api/threads/test')
            .send({
                text: 'text',
                delete_password: 'delete_password',
            })
            .end(function (err, res) {
                assert.equal(res.status, 201);
            });
    });
    test("Viewing the 10 most recent threads with 3 replies each: GET request to", function () {
        chai.request(server)
            .get('/api/threads/test')
            .end(function (err, res) {
                assert.equal(res.status, 200);
            });
    });
    test("Deleting a thread with the incorrect password: DELETE request to", function () {
        chai.request(server)
            .delete('/api/threads/test')
            .send({
                thread_id: 1,
                delete_password: 'wrong_password',
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
            });
    });
    test("Deleting a thread with the correct password: DELETE request to", function () {
        chai.request(server)
            .delete('/api/replies/test')
            .send({
                thread_id: 1,
                delete_password: 'delete_password',
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
            });
    });
    test("Reporting a thread: PUT request to", function () {
        chai.request(server)
            .put('/api/threads/test')
            .send({
                thread_id: 1,
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
            });
    });
    test("Creating a new reply: POST request to", function () {
        chai.request(server)
            .post('/api/replies/test')
            .send({
                text: 'text',
                delete_password: 'delete_password',
                thread_id: 1,
            })
            .end(function (err, res) {
                assert.equal(res.status, 201);
            });
    });
    test("Viewing a single thread with all replies: GET request to", function() {
        chai.request(server)
            .get('/api/replies/test?thread_id=1')
            .end(function(err, res) {
                assert.equal(res.status, 200);
            });
    });
    test("Deleting a reply with the incorrect password: DELETE request to", function () {
        chai.request(server)
            .delete('/api/threads/test')
            .send({
                thread_id: 1,
                delete_password: 'wrong_password',
                reply_id: 1,
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
            });
    });
    test("Deleting a reply with the correct password: DELETE request to", function () {
        chai.request(server)
            .delete('/api/replies/test')
            .send({
                thread_id: 1,
                delete_password: 'delete_password',
                reply_id: 1,
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
            });
    });
    test("Reporting a reply: PUT request to", function () {
        chai.request(server)
            .put('/api/threads/test')
            .send({
                thread_id: 1,
                reply_id: 1,
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
            });
    });
});
