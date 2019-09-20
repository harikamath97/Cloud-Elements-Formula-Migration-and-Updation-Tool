const https = require('https');
var request = require('request');
const fs = require('fs');
var Readconfig = require('./Readinputfile');
const JSONStream = require('JSONStream');

async function upload(options, file) {
    return new Promise(async (resolve, reject) => {
        let map = {};
        let test;
        var data = await Readconfig('dev/' + file).catch(err => {
            console.log("failed to read file");
        });
        let config = await Readconfig('Input.json').catch(err => {
            console.log("failed to read config");
        });
        data = JSON.stringify(data);
        options['Content-Length'] = Buffer.byteLength(data)
        let result = await writer(options, file);
        resolve(result);
    })
}
async function writer(options, file) {
    let map = {};
    return new Promise(async (resolve, reject) => {
        var data = await Readconfig('dev/' + file).catch(err => {
            console.log("failed to read file");
        });
        data = JSON.stringify(data);
        let req = https.request(options, async (res) => {
            console.log('statusCode:', res.statusCode);
            res.setEncoding('utf8');
            await res.pipe(JSONStream.parse()).on('data', (chunk) => {
                map[JSON.parse(data).id] = chunk.id;
                // process.stdout.write(chunk);

            });
            resolve(map);
        });

        req.on('error', (e) => {
            console.log("getting error");
            console.error(e);
            reject(false);
        });

        req.write(data);
        req.end();

    })
}
module.exports = upload;