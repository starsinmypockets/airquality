const axios = require('axios')
const kue = require('kue');
const fs = require('fs')
const basePath = "http://api.airvisual.com/v2/"
const jobs = kue.createQueue()
const cities = require('./cities.json').slice(0,4)
const jobType = 'fetch'
const wait = 10000
console.log(cities)

cities.forEach(def => {
  const city = def.city
  const url = `${basePath}city?city=${city}&state=Pennsylvania&country=USA&key=${process.env.AQI_KEY}`
  const date = new Date().toISOString()
  // @TODO set future ms per job
  jobs.create(jobType, {url, city, date}).save()
})

jobs.on('job enqueue', function(id, type){
  console.log( 'Job %s got queued of type %s', id, type );
})

jobs.process(jobType, 1, async (job, done) => {
  try {
    console.log('JOB data', job)
    const res = await axios.get(job.data.url)
    // @@TODO save to redis
    fs.writeFileSync(`paq_${job.data.city}_${job.data.date}.JSON`, JSON.stringify(res.data))
    console.log('SAVED API RES', res.data)
    setTimeout(done(), wait)
  } catch (e) {
    console.log ('ERROR SAVING API RES', e)
  }
})
