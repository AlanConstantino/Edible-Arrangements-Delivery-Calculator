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

// References to DOM elements
const totalDiv = document.getElementById('total');
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

subtotalForm.addEventListener('reset', (e) => {
  e.preventDefault();

  // removing saved data
  subtotal.pop();
  moneyMadeEachDay.pop();
  messagesForEachDay.pop();

  toggleFormVisibility([subtotalForm, individualDayForm]);
});

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

individualDayForm.addEventListener('submit', e => individualDayFormHandler(e));

function individualDayFormHandler(e) {
  e.preventDefault();

  const userZips = rawZipCodesTextArea.value
    .trim()
    .replace(/\n+/g, '\n')
    .split('\n');

  // Verifying each zip code is valid.
  // The following has to be for loop because a for-each loop is treated as a function which means if you
  // were to return out, you return out of the for-each function and not individualDayFormHandler()
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
  const { deliveriesMade, total } = getDeliveriesMadeAndTotal(userZips);
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
  for (let day = 0; day < messagesForEachDay.length; day++) {
    // title for each message
    const title = util.createElement('h1');
    title.innerText = `Day ${day + 1}:`;

    // actual message for the day
    const message = util.createElement('p');
    message.innerText = '\n' + messagesForEachDay[day];

    // appending to totalDiv
    util.appendToNode(totalDiv, [title, message]);
  }
}

// display total amount of money made
function displayTotalMoneyMade(totalForEachDay, daysOfWork, subtotalForAllDays) {
  // subtotal title
  const subtotalTitle = util.createElement('h1');
  subtotalTitle.innerText = 'Subtotal:';

  // subtotal
  const subtotal = util.createElement('p');
  const amount = (
    (5 * subtotalForAllDays[5]) +
    (6 * subtotalForAllDays[6]) +
    (7 * subtotalForAllDays[7]) +
    (8 * subtotalForAllDays[8])
  );
  subtotal.innerText = `
  5 x ${subtotalForAllDays[5]} = ${5 * subtotalForAllDays[5]}
  6 x ${subtotalForAllDays[6]} = ${6 * subtotalForAllDays[6]}
  7 x ${subtotalForAllDays[7]} = ${7 * subtotalForAllDays[7]}
  8 x ${subtotalForAllDays[8]} = ${8 * subtotalForAllDays[8]}
  Your subtotal is $${amount}\n
  `;

  // total title
  const totalTitle = util.createElement('h1');
  totalTitle.innerText = 'Total:';

  // total paragraph
  const total = util.createElement('p');
  total.innerText = '\nYou made ';

  // actual money made
  const span = util.createElement('span', 'green');
  span.innerText = `$${totalForEachDay}`;

  // amount of days worked
  const days = document.createTextNode(` for working ${daysOfWork} day(s).`);

  // appending everything to each other
  util.appendToNode(total, [span, days]);
  util.appendToNode(totalDiv, [subtotalTitle, subtotal, totalTitle, total]);
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
