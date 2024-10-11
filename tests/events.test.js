const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const SuperTest = require('supertest');
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const eventRoutes = require('../src/routes/eventRoutes');

let agent;
let server;
let replSet;

const startServer = () => {
  const app = express();
   app.use(bodyParser.json());
  app.use('/api/v1', eventRoutes);
  app.get('/test', (req, res) => res.send('hello world'));
  return app;
};

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 3 },
  });
  const uri = replSet.getUri();

  await mongoose.connect(uri, {
  });

  server = startServer().listen(8888);
  agent = SuperTest(server);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) {
    await replSet.stop();
  }
  await server.close();
});

describe('Express and MongoDB Tests', () => {

  it('should connect to MongoDB and perform CRUD operations', async () => {
    const uri = replSet.getUri();
    const conn = await MongoClient.connect(uri, {
    });
    const db = await conn.db('test');
    const col = await db.collection('testCol');

    const dummyBson = { _id: 1, test: 1 };
    await col.insertOne(dummyBson);

    const insertedDoc = await col.findOne({ _id: 1 });
    expect(insertedDoc).toEqual(dummyBson);

    await conn.close();
  });
  it('should create a new event', async () => {
    const newEvent = {
      name: 'Concert',
      date: '31/10/2024',
      capacity: 500,
      costPerTicket: 50,
    };

    const response = await agent
      .post('/api/v1/events')
      .send(newEvent)
      .expect(201);
    expect(response.body).toHaveProperty('eventId');
  });

  it('should return 400 if event already exists on the given date', async () => {
    const newEvent = {
      name: 'Concert',
      date: '28/10/2024',
      capacity: 500,
      costPerTicket: 50,
    };

    await agent.post('/api/v1/events').send(newEvent).expect(201);

    const response = await agent
      .post('/api/v1/events')
      .send(newEvent)
      .expect(400);
  });
});