# logreplayer #

Previously: nodejs-logreplayer

Original author: adamlundrigan

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

## Disclaimer

This code is provided AS-IS, with no warranty (explicit or implied) and has not been vetted or tested for deployment in a production environment. Use of this code at your own risk.
