#!/bin/sh

mongo_host="disposable-iot-mongo"
mongo_port=27017

# Wait for the mongo docker to be running
while ! nc -z $mongo_host $mongo_port; do  
  >&2 echo "Mongodb is unavailable - sleeping"
  sleep 1
done

# Apply database migrations
echo "start UI"  
npm start
