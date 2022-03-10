const CryptoJS = require('crypto-js');
const { Admin } = require('../models');

exports.createAdmin = async () => {
  const username = process.env.DAFAULT_ADMIN_USERNAME;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  try {
    const adminUser = await Admin.findOne({username: username});
    if (adminUser !== null)
      return true;
    const newAdminUser = new Admin({
      username: username,
      password: CryptoJS.AES.encrypt(
        password,
        process.env.PASSWORD_SECRET_KEY
      )
    });
    await newAdminUser.save();
  } catch (err) {
    console.error(err);
    return false;
  }
};
