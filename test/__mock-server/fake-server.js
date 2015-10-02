'use strict';
var express = require('express'),
    app = express(),
    $port = process.env.PORT || 3001,
    server;


exports.start = (cb) => {
    server = app.listen($port, () => {
        console.log('fake server started');
        return cb && cb();
    });
};

exports.stop = (cb) => {
    server.close(() => {
        console.log('fake server stopped');
        return cb && cb();
    });
};

app.route('/nscabinet-reslet').post((req, res) => {
    console.log('fake reslet', req.query);
    res.end();
});