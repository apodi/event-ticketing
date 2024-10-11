const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const transactionRoutes = require('../src/routes/transactionRoutes');
const Event = require('../src/models/Event'); // Adjust the path as necessary
const Transaction = require('../src/models/Transaction'); // Adjust the path as necessary
const eventRoutes = require('../src/routes/eventRoutes');

let server;
let replSet;
let agent;

const startServer = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api/v1', transactionRoutes);
  app.use('/api/v1', eventRoutes);
  return app;
};

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 3 },
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
        date: '1/12/2024',
        capacity: 500,
        costPerTicket: 50,
      };
    const event = await agent.post('/api/v1/events').send(newEvent).expect(201);

    const transactionData = {
      event: event.body.eventId,
      nTickets: 5,
    };

    const response = await agent
      .post('/api/v1/transactions')
      .send(transactionData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Transaction added successfully');

    const updatedEvent = await Event.findById(event.body.eventId);
    expect(updatedEvent.ticketsSold).toBe(5);

    const transaction = await Transaction.findOne({ eventId: event.body.eventId });
    expect(transaction).not.toBeNull();
    expect(transaction.nTickets).toBe(5);
  });

  it('should return 400 if event not found', async () => {
    const transactionData = {
      event: '612f1b3b3b3b3b3b3b3b3b3b',
      nTickets: 5,
    };

    const response = await agent
      .post('/api/v1/transactions')
      .send(transactionData)
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Event not found');
  });

  it('should return 400 if not enough tickets available', async () => {
    const newEvent = {
        name: 'Concert',
        date: '10/12/2024',
        capacity: 500,
        costPerTicket: 50,
      };
    const event = await agent.post('/api/v1/events').send(newEvent).expect(201);

    const transactionData = {
      event: event.body.eventId,
      nTickets: 300,
    };

    await agent
      .post('/api/v1/transactions')
      .send(transactionData)
      .expect(201);


    const response = await agent
    .post('/api/v1/transactions')
    .send(transactionData)
    .expect(400);

    expect(response.body).toHaveProperty('error', 'Not enough tickets available');
  });
});