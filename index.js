require("dotenv").config();

const axios = require("axios");
const delay = require("delay");
const beep = require("beepbeep");

//Appointments already found
const foundTors = [];

/**
 * Every 500 ms fetches the 3rd vaccine shots appointments, filters based on location and date.
 * Prints out the relevnt appointments.
 */
const main = async () => {
  while (true) {
    let torim = await axios.get(
      "https://torim.prat.idf.il/api/calendar-slots/available?serviceTypeId=110",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
          authorization: process.env.BEARER,
          "sec-ch-ua":
            '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          soldier: process.env.SOLIDER,
          cookie: process.env.COOKIES,
        },
      }
    );

    if (torim.status !== 200 || torim.data.length == 0) {
      console.log("Error!");
    }

    torim = torim.data.filter(
      (tor) =>
        tor.service.clinic.geoAreaId === 2 &&
        !foundTors.includes(tor.slotId) &&
        new Date(tor.appointmentTime) > new Date()
    );

    if (torim.length > 0) {
      print(torim);
    }

    await delay(500);
  }
};

/**
 * Prints out the location, date and link of filtered list of appointments.
 * Also adds the new appointments to foundTors.
 * @param {Array} torim Appointments array
 */
function print(torim) {
  torim.forEach((tor) => {
    foundTors.push(tor.slotId);
    beep(2);
    console.log(
      `Found a tor in: ${tor.service.clinic.fullClinicName} \n Date: ${new Date(
        tor.appointmentTime
      ).getDate()}/${
        new Date(tor.appointmentTime).getMonth() + 1
      } \n Link: https://torim.prat.idf.il/make-appointment/choose-appointment?slotId=${
        tor.slotId
      }`
    );
  });
}

main();
