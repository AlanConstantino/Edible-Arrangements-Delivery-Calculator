// our utility functions
const util = require('./util.js');

// our json zip code data
const zipCodes = require('./zip-codes.json');

// forms
const daysOfWorkForm = document.forms[0];
const individualDayForm = document.forms[1];
const totalForm = document.forms[2];

// global variables
let dayCounter = 1;
const moneyMadeEachDay = [];
const messagesForEachDay = [];
let daysOfWork = 0;

// References to DOM elements
const totalDiv = document.getElementById('total');
const daysInput = document.getElementById('days');
const dayNumberSpan = document.getElementById('day-number');
const rawZipCodesTextArea = document.getElementById('raw-zip-codes');

daysOfWorkForm.addEventListener('submit', e => {
  e.preventDefault();
  daysOfWork = parseInt(daysInput.value);

  if (!util.isValid(daysOfWork)) {
    const message = 'Number of days is invalid. Try again.';
    util.error(message);
    return;
  }

  toggleFormVisibility([daysOfWorkForm, individualDayForm]);
  updateDayNumberSpan(dayCounter); // <span> of second form
});

individualDayForm.addEventListener('submit', e => individialDayFormHandler(e));

function individialDayFormHandler(e) {
  e.preventDefault();
  const userZips = rawZipCodesTextArea.value
    .replace(/\n+/g, '\n')
    .split('\n');
  const { deliveriesMade, total } = getDeliveriesMadeAndTotal(userZips);
  const productOfEachDay = calculateProductOfEachDay(total);
  const moneyFromDeliveries = util.sumContentsOfArray(productOfEachDay);
  const gasMoney = calculateGasMoney(deliveriesMade);
  const totalMoneyMade = moneyFromDeliveries + gasMoney;

  // pushing to a global variable
  moneyMadeEachDay.push(totalMoneyMade);

  // daily message the user will see when at the total screen
  const messageForTheDay =
    `
    You made '${deliveriesMade}' deliveries.\n
    Therefore, you earned $${gasMoney} in gas.\n
    You made $${moneyFromDeliveries} in deliveries.\n
    Your total amount earned is $${totalMoneyMade}.\n
    `;
  messagesForEachDay.push(messageForTheDay);

  // if you reach the max daysOfWork, then proceed to show the total screen with all the calculations
  if (dayCounter === daysOfWork) {
    displayBreakdownOfTotal();
  }

  // however, if you haven't reached the last dayOfWork, reset the form for the next day
  if (dayCounter !== daysOfWork) {
    individualDayForm.reset();
    dayCounter++;
    updateDayNumberSpan(dayCounter);
  }
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

// Updates the span tag with the id of 'day-number'
function updateDayNumberSpan(day) {
  dayNumberSpan.textContent = day;
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
function displayBreakdownOfTotal() {
  toggleFormVisibility([individualDayForm, totalForm]);
  const totalForEachDay = util.sumContentsOfArray(moneyMadeEachDay);
  displayMessagesForEachDay();
  displayTotalMoneyMade(totalForEachDay, daysOfWork);
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
    const paragraphElement = util.createElement('p');
    const fullMessage = `\nDay ${day + 1}:\n\n${messagesForEachDay[day]}\n\n`;
    paragraphElement.innerText = fullMessage;
    util.appendToNode(totalDiv, paragraphElement);
  }
}

// display total amount of money made
function displayTotalMoneyMade(totalForEachDay, daysOfWork) {
  const totalElement = util.createElement('p');
  totalElement.innerText = `\nTotal:\n\nYou made $${totalForEachDay} for working ${daysOfWork} day(s).`;
  util.appendToNode(totalDiv, totalElement);
}
