'use strict';
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    path = require('path'),
    $port = process.env.PORT || 3001,
    server;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

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

var uploadFiles = [],
    downloadFiles = [];

app.route('/nscabinet-reslet').post((req, res) => {
    console.log('fake reslet', req.query, req.body);
    let body = req.body;
    if (body.action === 'download') {
        let file = req.body.filepath,
            name = path.basename(file);

        res.download(file, name)
    } else {
        let content = req.body.content,
            id = uploadFiles.length;
        uploadFiles.push(content);
        res.send({message: 'Uploaded to file id ' + id, fileid: Number(id)});
    }
});