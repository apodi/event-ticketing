#!/bin/bash

# Define variables
MONGO_PATH=~/mongodb
RS_NAME="rs0"
DB_NAME="event_ticketing"

# Create data directories
echo "Creating data directories..."
mkdir -p $MONGO_PATH/rs0-0 $MONGO_PATH/rs0-1 $MONGO_PATH/rs0-2

# Start MongoDB instances without authentication
echo "Starting MongoDB instances..."
mongod --replSet $RS_NAME --port 27017 --dbpath $MONGO_PATH/rs0-0 --bind_ip localhost --fork --logpath $MONGO_PATH/rs0-0/mongod.log
mongod --replSet $RS_NAME --port 27018 --dbpath $MONGO_PATH/rs0-1 --bind_ip localhost --fork --logpath $MONGO_PATH/rs0-1/mongod.log
mongod --replSet $RS_NAME --port 27019 --dbpath $MONGO_PATH/rs0-2 --bind_ip localhost --fork --logpath $MONGO_PATH/rs0-2/mongod.log

sleep 5

# Initialize the replica set
echo "Initializing the replica set..."
mongosh --eval "
  rs.initiate({
    _id: '$RS_NAME',
    members: [
      { _id: 0, host: 'localhost:27017' },
      { _id: 1, host: 'localhost:27018' },
      { _id: 2, host: 'localhost:27019' }
    ]
  });
" --quiet

sleep 5

echo "MongoDB replica set setup without authentication is complete."

# Instructions for the user
echo "
You can now connect your Node.js application to the MongoDB replica set.

For MongoDB Native Driver:
--------------------------
const uri = 'mongodb://localhost:27017,localhost:27018,localhost:27019/$DB_NAME?replicaSet=$RS_NAME';

For Mongoose:
-------------
const uri = 'mongodb://localhost:27017,localhost:27018,localhost:27019/$DB_NAME?replicaSet=$RS_NAME';
"
