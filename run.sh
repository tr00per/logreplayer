#!/bin/bash -uE
set -o pipefail
trap 'echo "$BASH_SOURCE: ${FUNCNAME[0]:-line} $LINENO: ABORTED ON ERROR" 1>&2; exit 1' ERR
[[ "${DEBUG:-}" ]] && set -x

# Get User Data
curl -o userdata.txt http://169.254.169.254/latest/user-data/
INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)

# Configure
INPUT_FILE=$(sed -n '1p' userdata.txt)
HOST=$(sed -n '2p' userdata.txt)
BUCKET=$(sed -n '3p' userdata.txt)
ACCESS=$(sed -n '4p' userdata.txt)
SECRET=$(sed -n '5p' userdata.txt)
echo -e "[default]\naccess_key = $ACCESS\nsecret_key = $SECRET" > ~/s3cmd.conf

# Download input file
INPUT_DATA=$(basename $INPUT_FILE)
s3cmd -c ~/s3cmd.conf --force get "s3://$BUCKET/input/$INPUT_FILE" ~/$INPUT_DATA

# Replay each split file
NOW=$(date +%s)
LOGFILE="replayer-$NOW.log"
./replay.js --source ~/$INPUT_DATA --host "$HOST" > ~/$LOGFILE

# Upload output to S3
s3cmd -c ~/s3cmd.conf put ~/$LOGFILE "s3://$BUCKET/output/$INSTANCE_ID/"
