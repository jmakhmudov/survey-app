const axios = require('axios');

const getUser = async (id) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/user-create/${id}`);
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