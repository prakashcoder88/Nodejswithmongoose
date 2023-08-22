const jwt = require("jsonwebtoken");

const { key_Token,adminkey_Token} = process.env;




const options = {
    expiresIn: "24h",
  };
  
  async function generateJwt(_id) {
    try {
      const payload = {_id };
      const token = await jwt.sign(payload, key_Token, options);
      return { error: false, token };
    } catch (error) {
      return { error: true };
    }
  }


  async function admingenerateJwt(_id){
    try {
      const payload = {_id};
      const token = await jwt.sign(payload, adminkey_Token, options);
      return { error: false, token };
    } catch (error) {
      return { error: true };
    }
  }
  
  module.exports =  {generateJwt,admingenerateJwt};


