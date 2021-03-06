const express = require('express');

const cache = require('./lib/cache/cacheClient');
const redis = require('./lib/cache/RedisCache');
const requestHandler = require('./lib/api/requestHandler');
const apiClient = require('./lib/api/apiClient');
const routes = require('./routes/index');

if (!process.env.NODE_ENV || !process.env.PORT || !process.env.REDIS_URL) {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('dotenv').config();
}

const app = express();
const mainPageHtml = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Bob's Drones API</title>
  <meta name="description" content="Bob's Drones API">
  <meta name="author" content="George Kaniouris">
</head>
<body>
  <a href="/api/v0/drones">See all drones</a>
</body>
</html>       
`;
// Initialize the cache client
cache.initialize(redis.createCache(process.env.REDIS_URL));
// Initialize the api client
apiClient.initialize(cache, requestHandler);
// Attempt to pull an initial set of values from the api and initialize the cache
// with them.
apiClient.initializeCacheValues()
  .then((isCacheInitialized) => {
    if (!isCacheInitialized) {
      console.log('Cache has not been initialized with Bob\'s drones.');
    }
    app.use('/api/v0', routes);
    app.get('/', (req, res) => {
      res.send(mainPageHtml);
    });

    app.listen(process.env.PORT, () => {
      console.log(`Bob's drones proxy listening on port ${process.env.PORT}!`);
    });
  }).catch((error) => {
    console.error(error);
  });
