// our table functionality
const table = require('./table.js');

// our utility functions
const util = require('./util.js');

// our json zip code data
const zipCodes = require('./zip-codes.json');

// References to forms
const daysOfWorkForm = document.getElementById('days-of-work');
const individualDayForm = document.getElementById('individual-day');
const subtotalForm = document.getElementById('subtotal-for-day');
const totalForm = document.getElementById('total-breakdown');

// global counter
let dayCounter = 1;
let daysOfWork = 0;

// global variables where we will save our data to
const moneyMadeEachDay = [];
const messagesForEachDay = [];
const subtotal = [];
const totalDeliveriesEachDay = [];
const zipsAndDeliveries = {};
const dailyAmountOfDeliveriesToZips = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }; // contains zip codes for each day

// References to DOM elements
const daysInput = document.getElementById('days');
const dayNumberSpan = document.getElementById('day-number');
const rawZipCodesTextArea = document.getElementById('raw-zip-codes');
const subtotalDiv = document.getElementById('subtotal');
const subtotalDayCounterSpan = document.getElementById('subtotal-day-counter');

daysOfWorkForm.addEventListener('submit', e => {
  e.preventDefault();
  daysOfWork = parseInt(daysInput.value);

  if (!util.isValid(daysOfWork)) {
    const message = 'Number of days is invalid. Try again.';
    util.error(message);
    return;
  }

  // hide current form and display individualDayForm
  toggleFormVisibility([daysOfWorkForm, individualDayForm]);
});

// triggered whenever a user clicks 'go back' on a form
subtotalForm.addEventListener('reset', (e) => {
  e.preventDefault();

  // removing saved data
  totalDeliveriesEachDay.pop();
  subtotal.pop();
  moneyMadeEachDay.pop();
  messagesForEachDay.pop();

  toggleFormVisibility([subtotalForm, individualDayForm]);
});

individualDayForm.addEventListener('submit', e => individualDayFormHandler(e));

subtotalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  toggleFormVisibility([subtotalForm, individualDayForm]);
  individualDayForm.reset();
  dayCounter++;
  util.updateElementInnerText(dayNumberSpan, dayCounter);

  // if you reach the max daysOfWork, then proceed to show the total screen with all the calculations
  if (dayCounter === daysOfWork + 1) {
    const subtotalForAllDays = calculateSubtotalForAllDays(subtotal);
    displayBreakdownOfTotal(subtotalForAllDays);
  }
});

function individualDayFormHandler(e) {
  e.preventDefault();

  const userZips = rawZipCodesTextArea.value
    .trim()
    .replace(/\n+/g, '\n')
    .split('\n');

  // Verifying each zip code is valid.
  for (let i = 0; i < userZips.length; i++) {
    const zipIsNotValid = !util.isValid(zipCodes[userZips[i]]);
    if (zipIsNotValid) {
      const message = `The zip code '${userZips[i]}' does not exist. Try again.`;
      util.error(message);
      return;
    }
  }

  // saving data to global variables
  saveAndFormatData(userZips);

  // display subtotal data for the day in the subtotal form
  const totalForCurrentDay = messagesForEachDay[messagesForEachDay.length - 1];
  util.updateElementInnerText(subtotalDiv, totalForCurrentDay);
  util.updateElementInnerText(subtotalDayCounterSpan, dayCounter);
  toggleFormVisibility([individualDayForm, subtotalForm]);
}

// saving and formatting data to global variables that can be accessed later
function saveAndFormatData(userZips) {
  // saves a list of tuple arrays to the global variable dailyAmountOfDeliveriesToZips
  // tuple array consists of the following => [[zip, deliveriesMadeToZip], [..., ...], ...]
  saveZips(userZips);

  const { deliveriesMade, total } = getDeliveriesMadeAndTotal(userZips);
  totalDeliveriesEachDay.push(deliveriesMade);
  subtotal.push(total);
  const productOfEachDay = calculateProductOfEachDay(total);
  const moneyFromDeliveries = util.sumContentsOfArray(productOfEachDay);
  const gasMoney = calculateGasMoney(deliveriesMade);
  const totalMoneyMade = moneyFromDeliveries + gasMoney;

  // pushing to a global variable
  moneyMadeEachDay.push(totalMoneyMade);

  // daily message the user will see when at the total screen
  const messageForTheDay =
    `You made '${deliveriesMade}' deliveries.
    Therefore, you earned $${gasMoney} in gas.
    You made $${moneyFromDeliveries} in deliveries.
    Your total amount earned is $${totalMoneyMade}.\n\n`;
  messagesForEachDay.push(messageForTheDay);
}

// saves a list of tuple arrays to the global variable dailyAmountOfDeliveriesToZips
// the tuple array itself consists of the zip code and how many deliveries were made to that zip code like so:
// tuple array => [zip, deliveriesMadeToZip]
// parameter "userZips" is an array of zip codes which are strings

// This looks gross but it's late, it works, and I want to go to bed.
function saveZips(userZips) {
  const listOfTuples = [];

  // Magic. Do not touch.
  for (let i = 0; i < userZips.length; i++) {
    let deliveriesMadeToZip = 1;
    let zip = '';
    let zipIsPresentInListOfTuples = false;

    for (let j = i + 1; j < userZips.length + 1; j++) {
      zip = userZips[i];
      const zipIsADuplicate = userZips[i] === userZips[j];
      if (zipIsADuplicate) {
        deliveriesMadeToZip++;
      }
    }

    listOfTuples.forEach(tuple => {
      const zipIsPresentInData = tuple[0] === userZips[i];
      if (zipIsPresentInData) {
        zipIsPresentInListOfTuples = true;
      }
    });

    if (zipIsPresentInListOfTuples) continue;
    listOfTuples.push([zip, deliveriesMadeToZip]);
  }

  dailyAmountOfDeliveriesToZips[dayCounter] = listOfTuples;
}


// You calculate gas money by determining the deliveriesMade
// - if you make 10 deliveries or less, you get $10
// - if you make 11 or more deliveries, you get $20
function calculateGasMoney(deliveriesMade) {
  let gasMoney = 0;
  if (deliveriesMade <= 10 && deliveriesMade > 0) gasMoney += 10;
  if (deliveriesMade >= 11) gasMoney += 20;
  return gasMoney;
}

// For each key value pair within total, multiply the value with the key to find out how much
// money you made each day in deliveries and then return an array with those values

// i.e index 0 of the 'productOfEachDay' array is the money you made for your first day of work
function calculateProductOfEachDay(total) {
  let product = 0;
  const productOfEachDay = [];
  for (const key in total) {
    product = key * total[key];
    // console.log(`${product} = ${key} * ${total[key]}`);
    productOfEachDay.push(product);
  }
  return productOfEachDay;
}

// For each userZip, check it' s validitity, if valid, deliveriesMade gets incremented and you save the value of the zip
// to the object named total.
// You return an object containing 'deliveriesMade' and 'total'.
function getDeliveriesMadeAndTotal(userZips) {
  let deliveriesMade = 0;
  const total = {
    5: 0,
    6: 0,
    7: 0,
    8: 0
  };

  userZips.forEach(zip => {
    const value = zipCodes[zip];
    // skip invalid zip codes
    if (!util.isValid(value)) {
      const message = `'${zip}' is not a valid zip code.`;
      util.error(message);
      return;
    }

    deliveriesMade++;
    total[value]++;
  });

  return { deliveriesMade, total };
}

// display the total amount of money made for each day and the total overall for all days
function displayBreakdownOfTotal(subtotalForAllDays) {
  toggleFormVisibility([individualDayForm, totalForm]);
  const totalForEachDay = util.sumContentsOfArray(moneyMadeEachDay);
  displayMessagesForEachDay();
  displayTotalMoneyMade(totalForEachDay, daysOfWork, subtotalForAllDays);
}

// This function toggles form visibility by toggling the 'hide' class
// The 'forms' parameter can be an array of HTML forms or just a singular HTML form
function toggleFormVisibility(forms) {
  if (Array.isArray(forms)) {
    forms.forEach(form => form.classList.toggle('hide'));
    return;
  }

  forms.classList.toggle('hide');
}

// create <p> element for each item within messagesForEachDay and append to totalDiv (global reference)
function displayMessagesForEachDay() {
  const dailyDeliveriesContainer = document.getElementById('daily-deliveries-container');
  for (let day = 0; day < messagesForEachDay.length; day++) {
    // title for each message
    const title = util.createElement('h1');
    title.innerText = `Day ${day + 1}:`;

    // actual message for the day
    const message = util.createElement('p');
    message.innerText = '\n' + messagesForEachDay[day];

    // appending to totalDiv
    util.appendToNode(dailyDeliveriesContainer, [title, message]);
  }
}

// display total amount of money made
function displayTotalMoneyMade(totalForEachDay, daysOfWork, subtotalForAllDays) {
  const subtotalContainer = document.getElementById('subtotal-container');
  const totalContainer = document.getElementById('total-container');


  // subtotal
  const subtotal = util.createElement('p');
  const amount = (
    (5 * subtotalForAllDays[5]) +
    (6 * subtotalForAllDays[6]) +
    (7 * subtotalForAllDays[7]) +
    (8 * subtotalForAllDays[8])
  );

  // You have to sum all the same zip codes in dailyAmountOfDeliveriesToZips; Sum gets saved to zipsAndDeliveries
  const flatArray = getZipsAndValuesFromDailyAmountOfDeliveriesToZips();

  // tuple = [zip, value]
  flatArray.forEach(tuple => {
    const zip = tuple[0];
    const value = tuple[1];

    if (zip in zipsAndDeliveries) {
      zipsAndDeliveries[zip] += value;
      return;
    }

    zipsAndDeliveries[zip] = value;
  });

  // displaying zips and deliveries made to zips on DOM
  for (const zip in zipsAndDeliveries) {
    const singularDeliveryToZip = zipsAndDeliveries[zip] === 1;
    if (singularDeliveryToZip) {
      subtotal.innerHTML += `'${zipsAndDeliveries[zip]}' delivery was made to ${zip}.<br>`
      continue;
    }
    subtotal.innerHTML += `'${zipsAndDeliveries[zip]}' deliveries were made to ${zip}.<br>`
  }

  subtotal.innerHTML += `<br>
  5 x ${subtotalForAllDays[5]} = ${5 * subtotalForAllDays[5]}<br>
  6 x ${subtotalForAllDays[6]} = ${6 * subtotalForAllDays[6]}<br>
  7 x ${subtotalForAllDays[7]} = ${7 * subtotalForAllDays[7]}<br>
  8 x ${subtotalForAllDays[8]} = ${8 * subtotalForAllDays[8]}<br><br>
  Your subtotal is $${amount}.<br>
  `;

  // total paragraph
  const total = util.createElement('p');
  total.innerHTML = 'You made ';

  // actual money made
  const span = util.createElement('span', 'green');
  span.innerHTML = `$${totalForEachDay}`;

  // amount of days worked
  const days = document.createTextNode(` for working ${daysOfWork} day(s).`);

  table.init(dailyAmountOfDeliveriesToZips, zipsAndDeliveries, totalDeliveriesEachDay);

  // appending everything to each other
  util.appendToNode(total, [span, days]);
  util.appendToNode(subtotalContainer, subtotal);
  util.appendToNode(totalContainer, total);
}

// returns a flat array of tuple arrays containing the zip code and deliveries made to the zip code
// i.e. [ [zip1, deliveries], [zip2, deliveries], ... ]
function getZipsAndValuesFromDailyAmountOfDeliveriesToZips() {
  const array = [];
  for (const key in dailyAmountOfDeliveriesToZips) {
    const valueIsEmpty = dailyAmountOfDeliveriesToZips[key] === 0;
    if (!valueIsEmpty) {
      array.push(dailyAmountOfDeliveriesToZips[key]);
    }
  }
  return array.flat();
}

// subtotal is an array
// each element within the subtotal array is an object
// returns an object
function calculateSubtotalForAllDays(subtotal) {
  const subtotalForAllDays = {
    5: 0,
    6: 0,
    7: 0,
    8: 0
  };
  for (const element of subtotal) {
    for (const key in element) {
      if (element[key] === 0) continue;
      subtotalForAllDays[key] += element[key];
    }
  }
  return subtotalForAllDays;
}
