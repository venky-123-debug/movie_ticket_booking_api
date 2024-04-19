
/**
 * An asynchronous function that handles error responses and notifications.
 *
 * @param {Object|string} error - The error object or error message.
 * @param {Object} response - The response object to be modified with error details.
 * @param {string} route - The route associated with the error.
 * @returns {Object} - The modified response object with error details.
 */
module.exports = async (error, response) => {
  // Set the 'error' property of the 'response' object to true, indicating that an error occurred.
  response.error = true;

  // Check if the 'error' parameter is an object (like an Error object).
  if (typeof error == "object") {
    // Log the error object to the console.
    console.error(error);

    // Set a specific error code for the response.
    response.errorCode = "error is not catched";

  } else {
    // If 'error' is not an object, convert it to a string and use it as the error code.
    response.errorCode = error.toString();
  }

  // Log the modified 'response' object to the console.
  console.log(response);

  // Return the modified 'response' object with error details.
  return response;
};

