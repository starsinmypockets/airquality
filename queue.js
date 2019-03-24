const axios = require('axios');
const redis = require('redis').createClient();
const {promisify} = require('util');
const kue = require('kue');
const basePath = 'http://api.airvisual.com/v2/';
const jobs = kue.createQueue();
const cities = require('./cities.json').reverse();
const jobType = 'fetch';
const redis = require('redis').createClient();
const {promisify} = require('util');
const set = promisify(redis.set).bind(redis);

console.log(cities.length);

const addJobs = () => {
  cities.forEach((def, i) => {
    const city = def.city;
    const url = `${basePath}city?city=${city}&state=Pennsylvania&country=USA&key=${
      process.env.AQI_KEY
    }`;
    const date = new Date().toISOString();
    // @TODO set future ms per job
    jobs
      .create(jobType, {url, city, date})
      .delay(i * 10000)
      .attempts(5)
      .priority('high')
      .save();
  });

  jobs.on('job enqueue', function(id, type) {
    console.log('Job %s got queued of type %s', id, type);
  });

  jobs.process(jobType, 1, async (job, done) => {
    try {
      console.log('JOB data', job.data);
      const res = await axios.get(job.data.url);
      await set(`pa:${job.data.city}`, JSON.stringify(res.data));
      // @@TODO save to redis
      console.log('SAVED API RES', res.data);
      done();
    } catch (e) {
      console.log('ERROR SAVING API RES', e);
      done();
    }
  });
};

addJobs();
