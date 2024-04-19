const jwt = require("jsonwebtoken")
const jsrsaSign = require("jsrsasign")
const crypto = require("crypto")
const SHA256 = require("crypto-js/sha256")

module.exports.isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/
module.exports.emailAddressPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*$/i

/**
 * Generates a JSON Web Token (JWT) with the provided data and secret.
 *
 * @param {object} data - The data to be included in the JWT payload.
 * @param {string} secret - The secret key used to sign the JWT.
 * @param {number} [expiresIn=120] - The expiration time of the JWT in seconds (default is 120 seconds).
 * @returns {Promise<string|boolean>} A promise that resolves with the generated JWT or `false` if an error occurs.
 */
module.exports.generateToken = function (data, secret, expiresIn = 120) {
  return new Promise(async (resolve) => {
    try {
      // Asynchronously sign the provided data with the given secret and set the expiration time.
      let jwtSign = await jwt.sign(data, secret, { expiresIn })

      // Resolve the promise with the generated JWT.
      resolve(jwtSign)
    } catch (error) {
      // If an error occurs during JWT generation, log the error and resolve the promise with `false`.
      console.error(error)
      resolve(false)
    }
  })
}

/**
 * Verifies a JSON Web Token (JWT) using the provided secret.
 *
 * @param {string} token - The JWT string to be verified.
 * @param {string} secret - The secret key used to verify the JWT signature.
 * @returns {Promise<object>} A promise that resolves with the decoded payload if the token is valid,or rejects with an error message if the token is invalid.
 */
module.exports.verifyToken = function (token, secret) {
  return new Promise(async (resolve, reject) => {
    try {
      // Asynchronously verify the JWT using the provided secret.
      let jwtDecoded = await jwt.verify(token, secret)

      // Resolve the promise with the decoded payload if the token is valid.
      resolve(jwtDecoded)
    } catch (error) {
      // If an error occurs during token verification, log the error to the console.
      console.error(error)

      // Reject the promise with a custom error message indicating an invalid token.
      reject("Invalid token")
    }
  })
}