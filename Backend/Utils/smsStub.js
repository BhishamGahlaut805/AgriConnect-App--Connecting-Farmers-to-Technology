exports.sendSMS = async (phone, text) => {
  console.log(`SMS to ${phone}: ${text}`);
  return true;
};
