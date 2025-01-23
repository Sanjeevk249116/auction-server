const moment = require("moment-timezone");
const { upload } = require("./middleware/multer.middleware");
const addDateAndTime = (auctionDate, time) => {
  const timeString = time;
  const [hours, minutes] = timeString.split(":").map(Number);
  const istDate = moment.tz(auctionDate, "Asia/Kolkata");
  istDate.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
  return istDate.utc().toDate();
};

const handleDynamicFields = (req, res, next) => {
  const fields = [];
  const fileKeys = Object.keys(req.body).filter((key) =>
    key.startsWith("photo")
  );

  fileKeys.forEach((key) => {
    fields.push({ name: key, maxCount: 1 });
  });

  // Add multer fields dynamically
  upload.fields(fields)(req, res, next);
};

module.exports = { addDateAndTime, handleDynamicFields };
