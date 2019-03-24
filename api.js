const express = require('express');
const app = express();
const redis = require('redis').createClient();
const {promisify} = require('util');
const get = promisify(redis.get).bind(redis);
const cities = require('./cities.json').reverse();

app.get('/cities', (req, res) => {
    return res.json(cities);
});

app.get('/paq', (req, res) => {
  return res.json({foo: 'bar'})

})

app.get('/', (req, res) => {
  return res.json({hello: 'world'})
})

const server = app.listen(8081, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log("Air quality app listening at http://%s:%s", host, port)
});
