const axios = require('axios');

const getUser = async (id) => {
  try {
    const response = await axios.get(`${process.env.BACK_URL}/api/user-create/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return undefined;
    } else {
      console.error("An error occurred while fetching user data", error.message);
      throw error;
    }
  }
};

module.exports = getUser