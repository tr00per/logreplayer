#!/usr/bin/env node
/* Logreplayer
 * Use this script under The BSD 2-Clause
 * Copyright (c) 2012 by adamlundrigan
 * Copyright (c) 2013 by tr00per
 */
'use strict';

var possibleMethods = ['HEAD', 'GET', 'POST'];

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({description: 'Log replayer'});
parser.addArgument(['--source'], {help:'Path to input file. Gzipped file can be used.', required:true});
parser.addArgument(['--host'], {help:'Target host', required:true});
parser.addArgument(['--port'], {help:'Port number. Default: 80', defaultValue:80, type:"int"});
parser.addArgument(['--speedup'], {help:'Speed up factor. Default: 1', defaultValue:1, type:"int"});
parser.addArgument(['--method'], {help:'HTTP method to use. Default: HEAD', defaultValue:'HEAD', choices:possibleMethods});
var args = parser.parseArgs();

// Require the necessary module
var http = args.port == '443' ? require('https') : require('http');
var Lazy = require('lazy');
var spawn = require('child_process').spawn;
var feeder = 'cat';
if (args.source.substr(-3, 3) == '.gz') {
    feeder = 'zcat';
}
var logfile = spawn(feeder, [args.source]);

// Set up some variables
var httpMethod = args.method.toUpperCase();
// Regex: (date):(time)\|(path?query)
var regexLogLine = /^([0-9]{2}\/[a-z]{3}\/[0-9]{4}):([0-9]{2}:[0-9]{2}:[0-9]{2}[^\|]*)\|([^\"]+)$/i;
var dtStart = Date.now();
var dtDuration = 0;

console.log('Loading access log...');

// Initiate ze process! 
Lazy(logfile.stdout)
    .lines
    .map(String)
    .map(function (line) {
        // Chop the line
        var parts = regexLogLine.exec(line);

        if ( parts != null ) { 
            var recDate = Date.parse(new Date(parts[1]+' '+parts[2]));

            // Determine the earliest datetime covered by log
            if (recDate < dtStart ) {
                dtStart = recDate;
            }

            // Process the HTTP request portion
            var httpRec = parts[3];
            if ( httpRec != null ) {
                return {
                    datetime: recDate,
                    method: httpMethod,
                    http: '1.1',
                    uri: httpRec
                };
            }
        } 
    }).filter(function(item){
        // Filter out any invalid records
        return ( typeof item != 'undefined' )
    }).join(function(f) {
        console.log('Determining execution order and offset...');

        // Compile a requestSet array which holds the requests in the correct order
        var requestSet = new Array();
        f.forEach(function(item) {
            // Calculate # of seconds past start we should fire request
            var offset = Math.round(((item.datetime - dtStart) / 1000) / args.speedup);
            if (offset > dtDuration) dtDuration = offset;

            if ( typeof requestSet[offset] == 'undefined' ) {
                requestSet[offset] = new Array();
            }
            requestSet[offset].push(item);
        });

        console.log("Executing...\n\n");

        var timings = new Array();
        var reqSeq = 0;

        // RUN ZE TEST!
        var execStart = Date.now();
        var interval = setInterval(function() {

            // Determine how much time has passed
            var runOffsetMS = (Date.now() - execStart);
            var runOffset = Math.round(runOffsetMS / 1000);

            // Is the test over yet?  How about now? now?
            if ( runOffset > dtDuration ) {
                clearInterval(interval);
            }

            // Have we got some requests to fire?
            if ( typeof requestSet[runOffset] != 'undefined' ) {
                console.log('['+new Date(dtStart + runOffsetMS)+'] '+requestSet[runOffset].length+' Requests' );

                // FIRE ZE MISSILES!!...er, requests, I mean
                requestSet[runOffset].forEach(function(item){
                    var reqNum = reqSeq++;
                    var req = http.request({
                            host: args.host,
                            port: args.port,
                            path: item.uri,
                            method: item.method,
                            reqStart: new Date().getTime()
                        }, 
                        function(resp) {}
                    )
                    .on('socket', function() { timings[reqNum] = new Date().getTime(); })
                    .on('response', function(resp) {
                        var diff = (new Date().getTime()) - timings[reqNum];
                        console.log(' - #' + reqNum + ' [DT=' + diff + 'ms, R=' + resp.statusCode + ']'); }
                    );
                    req.end();
                });

                // Discard the request info so we don't process it again
                delete requestSet[runOffset];
            }

        }, 100);

    });
