const moment = require("moment-timezone");
const addDateAndTime = (auctionDate, time) => {
  const timeString = time;
  const [hours, minutes] = timeString.split(":").map(Number);
  const istDate = moment.tz(auctionDate, "Asia/Kolkata");
  istDate.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  return istDate.utc().toDate();
};

module.exports = { addDateAndTime };
