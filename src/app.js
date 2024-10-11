const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes');

const app = express();
app.use(bodyParser.json());

// Create a router
const apiRouter = express.Router();
// Mount the router at the base URL
app.use('/api/v1', apiRouter);
apiRouter.get("/", (req, res) => {
  res.send("Event Ticketing API V1.0");
});
app.use('/api/v1', apiRoutes);


module.exports = app;