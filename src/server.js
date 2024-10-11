const app = require('./app');
const { connectDatabase } = require('./utils/db');
const { getEnvironmentVariables } = require('./utils/environment');
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    const envConfig = await getEnvironmentVariables();
    app.locals.envConfig = envConfig;
    const { DB_USER, DB_PASS, DB_NAME, DB_HOSTS, REPLCA_SET_NAME } = envConfig;
    await connectDatabase({ DB_USER, DB_PASS, DB_NAME, DB_HOSTS, REPLCA_SET_NAME });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing the server: ', error);
    process.exit(1);
  }
})();