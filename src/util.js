// Utility functions
module.exports = {
  // Create a DOM element
  createElement: function(typeOfElement = 'div', classes = '') {
    const element = document.createElement(typeOfElement);
    if (classes === '') return element;
    if (Array.isArray(classes)) classes.forEach(cssClass => element.classList.add(cssClass));
    if (!Array.isArray(classes)) element.classList.add(classes);
    return element;
  },

  // Prints out error nessage as an alert and to the console
  error: (message) => {
    alert(message);
    console.error(message);
  },

  // checks to see if given parameter is equal to undefined, null, '', or NaN
  // if it's equal to either of those return false
  // else return true
  isValid: (thingToValidate) => {
    if (thingToValidate === '' ||
        thingToValidate === undefined ||
        thingToValidate === null ||
        isNaN(thingToValidate)) {
      return false;
    }

    return true;
  },

  // Sum everything within the given array and returns the value
  // (array contents have to be numbers)
  sumContentsOfArray: (array) => {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    return array.reduce(reducer);
  },

  // You pass it a node you want to append and the node that item is getting appended to
  // nodeToAppend can be an array of nodes or just a singular node
  appendToNode: (node = '', nodeToAppend = '') => {
    if (Array.isArray(nodeToAppend)) {
      nodeToAppend.forEach(item => node.appendChild(item));
      return;
    }

    node.appendChild(nodeToAppend);
  }
};
