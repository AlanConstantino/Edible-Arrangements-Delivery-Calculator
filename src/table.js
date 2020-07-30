const util = require('./util.js');

// tbody elements
const tbody = document.getElementById('tbody');
const zipData = document.getElementById('tbody-zip-data');

function cloneTbodyZipData() {
    const clonedData = zipData.cloneNode(true);
    clonedData.removeAttribute('id');
    clonedData.removeAttribute('class');
    return clonedData;
}

function setTotalSum(totalDeliveriesEachDay) {
    const dayOneTotal = document.getElementById('day-1-total');
    const dayTwoTotal = document.getElementById('day-2-total');
    const dayThreeTotal = document.getElementById('day-3-total');
    const dayFourTotal = document.getElementById('day-4-total');
    const dayFiveTotal = document.getElementById('day-5-total');
    const daySixTotal = document.getElementById('day-6-total');
    const daySevenTotal = document.getElementById('day-7-total');

    totalDeliveriesEachDay.forEach((amount, i) => {
        const day = i + 1; // +1 to offset starting at 0
        switch (day) {
            case 1:
                dayOneTotal.innerText = amount;
                break;
            case 2:
                dayTwoTotal.innerText = amount;
                break;
            case 3:
                dayThreeTotal.innerText = amount;
                break;
            case 4:
                dayFourTotal.innerText = amount;
                break;
            case 5:
                dayFiveTotal.innerText = amount;
                break;
            case 6:
                daySixTotal.innerText = amount;
                break;
            case 7:
                daySevenTotal.innerText = amount;
                break;
        }
    });
}

export function init(dailyAmountOfDeliveriesToZips, zipsAndDeliveries, totalDeliveriesEachDay) {
    for (const zip in zipsAndDeliveries) {
        const clonedTbodyZipData = cloneTbodyZipData();
        util.appendToNode(tbody, clonedTbodyZipData);
        const [th, ...tableCells] = [...clonedTbodyZipData.children];
        th.innerText = zip;

        // iterate through each table cell
        tableCells.forEach((cell, i) => {
            const day = i + 1; // +1 to offset starting at 0
            const columnZip = th.innerText;
            console.log(dailyAmountOfDeliveriesToZips[day]);
            const valueIsEmpty = dailyAmountOfDeliveriesToZips[day] === 0;

            if (valueIsEmpty) return;

            const dailyArray = dailyAmountOfDeliveriesToZips[day].flat();
            for (let j = 0; j < dailyArray.length; j++) {
                if (dailyArray[j] === columnZip) {
                    const value = dailyArray[j + 1];
                    cell.innerText = value;
                }
            }
        });
    }
    setTotalSum(totalDeliveriesEachDay);
}