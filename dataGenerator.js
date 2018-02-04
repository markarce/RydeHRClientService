//Data Generator
//node --max-old-space-size=4096 dataGenerator.js
var faker = require('faker');
var fs = require('fs');
var uuidv4 = require('uuid/v4');

/* Create the users we'll use for the fake data in multiple tables */
var createUsers = (number) => {
  var userList = [
  //hardcode 4 users for testing purposes
    ['111111111','Dillon'],
    ['222222222','Jackie'],
    ['333333333','Mark'],
    ['444444444','Nick']
  ];
  for (let i = 4; i < number; i++) {
    var dateSeed = Date.now();
    dateSeed = dateSeed.toString().slice(-5);
    var id = dateSeed + faker.random.number({min: 1000, max: 9999});
    var name = faker.name.firstName();
    userList.push([id, name]);
  }
  return userList;
};

var riders = createUsers(100000);
var drivers = createUsers(10000);

/* Output rider list to file to later add as table in db */
var createRiderTable = (riderList) => {
  var output = '';
  for (var i = 0; i < riderList.length; i++) {
    output += `${riderList[i][0]},${riderList[i][1]} + \n`;
  }

  return output;
};

var formattedRiders = createRiderTable(riders);
writeData(formattedRiders, 'riderTable', '');

/* Generates a single fake event object using faker */
var createEvent = () => {
  var eventObject = {};
  /* project requirement is dates from the past 3 months, so this will
   * use that timeframe on creation of data 
   */
  var threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  var now = new Date();

  var rideLength = faker.random.number({min: 10*60*1000, max: 30*60*1000});
  var pickupWait = faker.random.number({min: 4*60*1000, max: 10*60*1000});
  var eventLength = faker.random.number({min: pickupWait + rideLength, max: pickupWait + rideLength + 5*60*1000});

  var rider = riders[faker.random.number({min: 0, max: riders.length - 1})];
  var driver = drivers[faker.random.number({min: 0, max: drivers.length - 1})];

  eventObject.eventId = uuidv4();
  eventObject.eventStart = Date.parse(faker.date.between(threeMonthsAgo, now));
  eventObject.eventEnd = eventObject.eventStart + eventLength;
  eventObject.eventIsClosed = 'true';
  eventObject.riderId = rider[0];
  eventObject.riderName = rider[1];
  eventObject.driverId = driver[0];
  eventObject.driverName = driver[1];
  eventObject.driverIsAvailable = 'true';
  eventObject.timestampPickup = eventObject.eventStart + pickupWait;
  eventObject.timestampDropoff = eventObject.timestampPickup + rideLength;
  eventObject.geolocationPickup = `[${faker.address.latitude()}, ${faker.address.longitude()}]`;
  eventObject.geolocationDropoff = `[${faker.address.latitude()}, ${faker.address.longitude()}]`;
  eventObject.surgeZone = faker.random.number({min: 0, max: 200});
  eventObject.surgeMulti = faker.finance.amount(0, 8, 2);
  eventObject.price = faker.finance.amount(0, 200, 2);
  eventObject.success = 'true';

  return eventObject;
};

//Creates a generated data object collection with event ids between min (inclusive) and max
var generateEvents = (min, max) => {
  var generatedData = '';
  for (let i = min; i <= max; i++) {
    var ev = createEvent();
    generatedData += `${ev.eventId},`+
      `${ev.eventStart},`+
      `${ev.eventEnd},`+
      `${ev.eventIsClosed},`+
      `${ev.riderId},`+
      `${ev.riderName},`+
      `${ev.driverId},`+
      `${ev.driverName},`+
      `${ev.driverIsAvailable},`+
      `${ev.timestampPickup},`+
      `${ev.timestampDropoff},`+
      `"${ev.geolocationPickup}",`+
      `"${ev.geolocationDropoff}",`+
      `${ev.surgeZone},`+
      `${ev.surgeMulti},`+
      `${ev.price},`+
      `${ev.success}\n`;
    // Logs every 100000 generations to console to quickly detect failures
    if(i % 100000 === 0) {
      console.log(`${i} completed...`)
    }
  }

  return generatedData;
};

// Takes the generated object and writes it to a data file template with an incremented number at the end
var writeData = function (data, fileName, fileNum) {
  console.log(`Attempting write of 1M objects to /data/dataOutput${fileNum}.csv`);
  fs.writeFileSync(`./data/${filename}${fileNum}.csv`, data,);
  console.log(`dataOutput${fileNum}.csv written successfully`);
};

// Writes generated data in 1M record chunks to avoid running out of memory
var writeDataChunks = function(chunks) {
  var start = new Date();
  var min = 1;
  var max = 1000000;
  for (let i = 0; i < chunks; i++) {
    console.log(`Generating File ${i}...`);
    var data = generateEvents(min, max)
    writeData(data, 'dataOutput', `${i}`);
    min += 1000000;
    max += 1000000;
  }
  var end = new Date();
  var duration = end - start;
  var minutes = Math.floor(duration / 60000);
  var seconds = ((duration % 60000) / 1000).toFixed(0);
  console.log(`Completed in ${(seconds == 60 ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds)}`)
};

writeDataChunks(10);
