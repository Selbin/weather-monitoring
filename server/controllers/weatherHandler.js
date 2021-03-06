const db = require('../database/database')
const util = require('util')
const logger = require('../config/winston')
const { successMsg, errorMsg, setResponseObj } = require('../helper/constants')

// promisify mongodb find query
const find = util.promisify(db.weatherData.find).bind(db.weatherData)

// controller to check temperature out of range
const checkTempRange = async (req, res) => {
  const location = req.params.location
  const low = Number(req.params.low)
  const high = Number(req.params.high)
  const dateStr = req.params.dateStr
  try {
    const result = await find({
      name: location,
      dateString: dateStr,
      $or: [{ temp: { $lt: Number(low) } }, { temp: { $gt: Number(high) } }]
    })
    res.status(200).json(setResponseObj(true, result, successMsg, null))
  } catch (error) {
    logger.error(req.originalUrl + ' ' + error)
    res.status(500).json(setResponseObj(false, null, errorMsg, errorMsg))
  }
}

// controller to get locations outside temperature range
const getLocation = async (req, res) => {
  const low = Number(req.params.low)
  const high = Number(req.params.high)
  const timeInHour = Number(req.params.timeInHour)

  try {
    const result = await find({
      timeInHour,
      $or: [{ temp: { $lt: low } }, { temp: { $gt: high } }]
    })
    res.status(200).json(setResponseObj(true, result, successMsg, null))
  } catch (error) {
    logger.error(req.originalUrl + ' ' + error)
    res.status(500).json(setResponseObj(false, null, errorMsg, errorMsg))
  }
}

// controller to get all times outside given temperature range
const getTime = async (req, res) => {
  const low = Number(req.params.low)
  const high = Number(req.params.high)
  const location = req.params.location
  try {
    const result = await find({
      name: location,
      $or: [{ temp: { $lt: low } }, { temp: { $gt: high } }]
    })
    res.status(200).json(setResponseObj(true, result, successMsg, null))
  } catch (error) {
    logger.error(req.originalUrl + ' ' + error)
    res.status(500).json(setResponseObj(false, null, errorMsg, errorMsg))
  }
}

// controller to get start and end date
const getDateRange = (req, res) => {
  db.weatherData
    .find({}, { dateString: 1 })
    .sort({ timeStamp: 1 })
    .limit(1, (err, startDate) => {
      if (err) return res.status(500).json(setResponseObj(false, null, errorMsg, errorMsg))
      db.weatherData
        .find({}, { dateString: 1 })
        .sort({ timeStamp: -1 })
        .limit(1, (err, endDate) => {
          if (err) return res.status(500).json(setResponseObj(false, null, errorMsg, errorMsg))
          res.status(200).json(setResponseObj(true, { startDate: startDate[0].dateString.slice(0, 10), endDate: endDate[0].dateString.slice(0, 10) }, successMsg, null))
        })
    })
}

module.exports = {
  checkTempRange,
  getLocation,
  getTime,
  getDateRange
}
