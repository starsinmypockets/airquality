const express = require('express');
const app = express();
const redis = require('redis').createClient();
const {promisify} = require('util');
const get = promisify(redis.get).bind(redis)
const keys = promisify(redis.keys).bind(redis)
const cities = require('./cities.json').reverse();
const fs = require('fs');

app.get('/cities', (req, res) => {
    return res.json(cities);
});

app.get('/data', async (req, res) => {
  const ks = await keys('pa*')
  const data = await Promise.all(ks.map(k => {
    return get(k)
  }))
  return res.json(data)
})

app.get('/', (req, res) => {
  return res.json({hello: 'world'})
})

const server = app.listen(8081, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Air quality app listening at http://%s:%s", host, port)
});
