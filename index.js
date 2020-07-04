const form = document.forms[0];
const [textarea] = form;
const zipCodeValues = {
    // first column
    90002: 8,
    90003: 8,
    90044: 8,
    90045: 8,
    90047: 8,
    90059: 8,
    90061: 8,
    90220: 7,
    90221: 8,
    90222: 8,
    90245: 7,
    90247: 7,
    90248: 7,
    90249: 7,
    90250: 7,
    90254: 6,
    90260: 7,
    90261: 7,
    90262: 8,

    // second column
    90266: 7,
    90274: 6,
    90275: 5,
    90277: 6,
    90278: 7,
    90280: 8,
    90293: 8,
    90301: 8,
    90303: 8,
    90304: 8,
    90305: 8,
    90501: 6,
    90502: 6,
    90503: 6,
    90504: 7,
    90505: 5,
    90506: 6,
    90710: 6,
    90717: 5,

    // third column
    90723: 8,
    90731: 6,
    90732: 5,
    90744: 6,
    90745: 6,
    90746: 7,
    90747: 7,
    90755: 7,
    90802: 7,
    90803: 8,
    90804: 8,
    90805: 8,
    90806: 8,
    90807: 7,
    90808: 8,
    90810: 7,
    90813: 7,
    90814: 8,
    90815: 8,
    90822: 6,
};
const zipCodeTotal = {
    5: 0,
    6: 0,
    7: 0,
    8: 0
};
let days = [];

const totalContainer = document.getElementsByClassName('total-container')[0];
const totalDiv = totalContainer.children[0];
const restartButton = document.querySelector('input[value="Restart"]');
restartButton.addEventListener('click', (e) => location.reload());

function isValidText(unformattedText) {
    const text = unformattedText.trim();
    if (text === '' || text === undefined || text === null) {
        alert('Text is not valid, try again.');
        return false;
    }

    return true;
}

function getFuelTotal(days) {
    let fuelTotal = 0;
    const stats = [];
    days.forEach(index => {
        if (index.length <= 10) fuelTotal += 10;
        if (index.length >= 11) fuelTotal += 20;
    });
    stats.push(fuelTotal);
    return { fuelTotal, stats };
}

function getValueForEachDay(days) {
    let eachDay = [];
    let total = {
        5: 0,
        6: 0,
        7: 0,
        8: 0
    };
    days.forEach((index) => {
        index.forEach(zip => {
            const value = zipCodeValues[zip];
            total[value]++;
        });
        eachDay.push(total);
        total = {
            5: 0,
            6: 0,
            7: 0,
            8: 0
        };
    });
    return eachDay;
}

// Doesn't make sense to have an instance just to use this method therefore, it's static.
// 'classes' can either be a single css class or an array of multiple css classes
function createElement(typeOfElement = 'div', classes = '') {
    const element = document.createElement(typeOfElement);
    if (classes === '') return element;
    if (Array.isArray(classes)) classes.forEach(cssClass => element.classList.add(cssClass));
    if (!Array.isArray(classes)) element.classList.add(classes);
    return element;
}

// appends an item to a node
// itemToAppend can be an array of items or 1 singular item
function appendToNode(node = '', itemToAppend = '') {
    if (Array.isArray(itemToAppend)) {
        itemToAppend.forEach(item => node.appendChild(item));
        return;
    }

    node.appendChild(itemToAppend);
}


// save all zip codes into a variable
// for each '' it gets skipped and that means a new day has started
let counter = 0;
form.addEventListener('submit', e => {
    e.preventDefault();
    if (isValidText(textarea.value)) {
        const arrayText = textarea.value
            .trim()
            .split('\n')
            .filter(string => string.match(/^[0-9]*$/));
        let temp = [];
        console.log(arrayText)

        // loop through each zip code in the array
        for (let i = 0; i < arrayText.length; i++) {
            // if there is a '', save temp to days and skip to next item in loop
            if (arrayText[i] === '') {
                days.push(temp);
                temp = [];
                continue;
            }

            // push data to temp
            temp.push(arrayText[i]);

            // if you are on the last element, save it
            if (arrayText.length - 1 === i) {
                days.push(temp);
                temp = [];
            }
        }

        const eachDay = getValueForEachDay(days);
        let deliveriesMade = 0;
        let deliveryTotal = 0;

        eachDay.forEach(item => {
            for (const property in item) {
                deliveriesMade += item[property];
                deliveryTotal += property * item[property];
            }
        });

        // stats isn't used for anything
        const { fuelTotal, stats } = getFuelTotal(days);
        const total = fuelTotal + deliveryTotal;
        const deliveriesMadeTag = createElement('p');
        const deliveryTotalTag = createElement('p');
        const fuelTotalTag = createElement('p');
        const totalTag = createElement('p');
        deliveriesMadeTag.innerText = 'You did "' + deliveriesMade + '" deliveries!';
        deliveryTotalTag.innerText = 'Deliveries: $' + deliveryTotal;
        fuelTotalTag.innerText = 'Fuel Total: $' + fuelTotal;
        totalTag.innerText = 'Total: $' + total;
        appendToNode(totalDiv, [deliveriesMadeTag, fuelTotalTag, deliveryTotalTag, totalTag]);
        totalContainer.style.visibility = 'visible';
    } else {
        // fix this else statement or just get rid of it
        alert('One of the zip codes entered is not valid!');
        console.log('not valid text');
    }
});