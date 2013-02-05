# logreplayer #

## What?

__logreplayer__ is a (very) simple Node.js application which replayes simplified logs, in real time, against a target server.

## Why?

__nodejs-logreplay__ was developed to assist in load testing web server(s) by replicating the same request pattern that production systems experience.  This helps us determine how code modifications will perform in production before they are deployed.

It was forked to __logreplayer__, to replay simplified logs, which are stripped of useless information (like User Agent).

## Simplified logs?

Just the date, taken directly from Apache logs, separated by a pipe "|", followed by Path+Query.

It required some preprocessing, but logs are much smaller, which make difference, when Apache logs are measured in GB.

## How?

Easy:

1. Install Node.js, npm

2. Clone this repository onto the server you wish to launch your load test requests from

3. Run
       ```npm install``` 

4. Read help

       ```./replay.js --help```

5. Run!

       ```./replay.js <something>```

## Copyrights

* nodejs-logreplay: adamlundrigan
* logreplayer: tr00per

Use this script under The BSD 2-Clause License http://opensource.org/licenses/BSD-2-Clause
