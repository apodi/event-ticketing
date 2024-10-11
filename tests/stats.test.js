const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const transactionRoutes = require('../src/routes/transactionRoutes');
const Event = require('../src/models/Event'); // Adjust the path as necessary
const Transaction = require('../src/models/Transaction'); // Adjust the path as necessary
const eventRoutes = require('../src/routes/eventRoutes');
const statsRoutes = require('../src/routes/statsRoutes');

let server;
let replSet;
let agent;

const startServer = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api/v1', transactionRoutes);
  app.use('/api/v1', eventRoutes);
  app.use('/api/v1', statsRoutes);
  return app;
};

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 3 },
    instanceOpts: [ { port: 27228 } ],
  });
  const uri = replSet.getUri();

  await mongoose.connect(uri, {});

  server = startServer().listen(8888);
  agent = supertest(server);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) {
    await replSet.stop();
  }
  await server.close();
  
});

describe('Transaction Handler', () => {
  it('should add a transaction successfully', async () => {
    const newEvent = {
        name: 'Concert',
        date: '1/05/2024',
        capacity: 500,
        costPerTicket: 50,
      };
    const newEvent2 = {
        name: 'Concert2',
        date: '10/07/2024',
        capacity: 50,
        costPerTicket: 5,
      };
    const event1 = await agent.post('/api/v1/events').send(newEvent).expect(201);
    const event2 = await agent.post('/api/v1/events').send(newEvent2).expect(201);
  

    const transactionData1 = {
      event: event1.body.eventId,
      nTickets: 5,
    };
    const transactionData2 = {
        event: event2.body.eventId,
        nTickets: 15,
      };

    await agent
      .post('/api/v1/transactions')
      .send(transactionData1)
      .expect(201);

    await agent
      .post('/api/v1/transactions')
      .send(transactionData2)
      .expect(201);

    const response = await agent
        .get('/api/v1/statistics')
        .expect(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].revenue).toBe(250);
  });

});