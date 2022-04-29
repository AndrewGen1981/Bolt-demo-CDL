const mongoose = require('mongoose')

// @schBlockedSchema - Blocked of closed cells
const schBlockedSchema = new mongoose.Schema({
    schType: String,
    schTransmission: String,
    schLocation: String,
    schBlockedDays: []      //  "col:row"
}, {
    collection: 'ScheduleBlocked'
})


module.exports = {
    ScheduleBlocked: mongoose.model("schBlockedSchema", schBlockedSchema)
}