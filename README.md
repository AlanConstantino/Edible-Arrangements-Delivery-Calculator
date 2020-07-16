# [Edible-Arrangements-Delivery-Calculator](https://calc.alanconstantino.com/)

I made this calculator to help me get the total amount of money earned by making Edible Arrangements deliveries.

You can view the website [here](https://calc.alanconstantino.com/).


### Technologies used:
- Node.js
  - To manage packages and dependecies such as ESLint, Babel, and Webpack.
- Webpack
  - For bundling all JavaScript files into a single file.
- Babel
  - For cross-browser compatible JavaScript.

## TODO:
- [x] Add new styles to the forms.
- [ ] See if it's viable to add a button that allows you to download all the data either as a PDF or an excel sheet which mimics the Edible Arrangements sheet.

## Bugs
- [x] When entering zip codes for each day of work, you are able to submit the form without zip codes. Should prompt the user for an error telling them to enter a zip code. Should also not move on to next day until zip codes for the current day are given.
- [x] Having a newline after the final zip code in "Enter zip codes for day X" form shouldn't give an error.
      - If you have a newline, or multiple newlines after the final zipcode, it should just ignore them, not prompt you with an error.
- [x] In Microsoft Edge, the button for the "days-of-work" form and "individual-day" form have the text "Submit Query" instead of "Submit".
