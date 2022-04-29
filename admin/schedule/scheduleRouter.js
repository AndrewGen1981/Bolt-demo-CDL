const express = require('express')
const schRouter = express.Router()
const path = require('path')

// CONFIG
const admin = require('../config')

// MODELS for mongoose
const { Student, Schedule } = require('../../users/userModel')
const { ScheduleBlocked } = require('./schTemplateModel')

// schedule comtroller
const { getCalendarData } = require('./schedule')


function ifCanWrite (req, res, next) {
    // check Admin's Auth - if can WRITE
    const adminId = req.session.userId
    if (!admin.checkAdminsAuth(adminId, 'write')) {
        return res.status(403).json({ issue: "Instructors cannot change schedule" })
    } else { next() }
}


// @GET /schedule
schRouter.get('/', async(req, res) => {
    const locations = Object.values(admin.LOCATION).filter(location => { 
        if(location != admin.LOCATION.All && location != admin.LOCATION.Unset) { 
            return location 
        }
    })
    res.render(path.join(__dirname+'/schedule-center.ejs'), { locations })
})


// @GET /schedule/backing
// schedule, query ?date="2022-02-24"&calendarTransmission="AUTO"&calendarLocation="Tacoma, WA"
schRouter.get('/backing1', async(req, res) => {
    const dataObj = await getCalendarData(req, "backing1", 7)
    res.render(path.join(__dirname+'/schedule-calendar.ejs'), dataObj)
})
schRouter.get('/backing2', async(req, res) => {
    const dataObj = await getCalendarData(req, "backing2", 7)
    res.render(path.join(__dirname+'/schedule-calendar.ejs'), dataObj)
})
schRouter.get('/backing3', async(req, res) => {
    const dataObj = await getCalendarData(req, "backing3", 7)
    res.render(path.join(__dirname+'/schedule-calendar.ejs'), dataObj)
})
schRouter.get('/city', async(req, res) => {
    const dataObj = await getCalendarData(req, "city", 7)
    res.render(path.join(__dirname+'/schedule-calendar.ejs'), dataObj)
})


// @PUT /schedule
schRouter.put('/', ifCanWrite, async(req, res) => {
    const { action } = req.body
    try {
        // delete scheduled action
        if (action === "DELETE SCHEDULED") {
            const { studentId, scheduleId, appointmentId, viewStartDate } = req.body
            if (!studentId) { return res.status(400).json({ issue: "Bad student Id" }) }
            if (!scheduleId) { return res.status(400).json({ issue: "Bad schedule Id" }) }
            if (!appointmentId) { return res.status(400).json({ issue: "Bad appointment Id" }) }
            const schedule = await Schedule.findById(scheduleId)
            if (!schedule) { return res.status(404).json({ issue: `Didn't find schedule with Id ${schedule}` }) } 
    
            const newAppointments = schedule.appointments.filter(appointment => {
                if (appointment._id != appointmentId) {
                    return appointment
                }
            })
    
            schedule.appointments = newAppointments
            await schedule.save()
            return res.status(200).end()
        }
        // add to the schedule
        if (action === "ADD TO SCHEDULE") {
            const { studentId, date, type, transmission, location } = req.body
            if (studentId && date && type && transmission && location ) {
                // extracting date and timestamp
                const dateStr = date.split('@')[0]
                const timeStr = date.split('@')[1].split(":")
                const h = parseInt(timeStr[0]) < 10 ? `0${parseInt(timeStr[0])}` : timeStr[0]
                const m = parseInt(timeStr[1]) < 10 ? `0${parseInt(timeStr[1])}` : timeStr[1]
                // creating date value in UTC Z
                const spotData = new Date(`${dateStr}T${h}:${m}Z`)

                const student = await Student.findById(studentId).populate("schedule")
                if (student.schedule) {
                    // check if scheduled appointment exist, if not - add
                    await Schedule.findByIdAndUpdate(
                        student.schedule,
                        { $push: { 
                            appointments: {
                                appDate: spotData,
                                appType: type,
                                appTransmission: transmission,
                                appLocation: location,
                            }
                        }},
                    )
                } else {
                    const schedule = await new Schedule({
                        student: student._id,
                        appointments: [{
                            appDate: spotData,
                            appType: type,
                            appTransmission: transmission,
                            appLocation: location,
                        }]
                    }).save()
                    student.schedule = schedule._id
                    await student.save()
                }
                return res.status(200).end()
            } else { return res.status(400).json({ issue: "Not enough data to save" }) }
        }
        if (action === "BLOCK SCHEDULE CELL") {
            const { column, row, type, transmission, location } = req.body
            if (column && row && type && transmission && location ) {
                const scheduleBlocked = await ScheduleBlocked.findOne({ type, transmission, location })
                if (!scheduleBlocked) {
                    await new ScheduleBlocked({
                        schType: type,
                        schTransmission: transmission,
                        schLocation: location,
                        schBlockedDays: [`${column}:${row}`]      //  "col:row"
                    }).save()
                } else {
                    const cellCoord = `${column}:${row}`
                    if (!scheduleBlocked.schBlockedDays.includes(cellCoord)) {
                        scheduleBlocked.schBlockedDays.push(cellCoord)
                        await scheduleBlocked.save()
                    }
                }
                return res.status(200).end()
            }
        }
        if (action === "UNBLOCK SCHEDULE CELL") {
            const { column, row, type, transmission, location } = req.body
            if (column && row && type && transmission && location ) {
                const scheduleBlocked = await ScheduleBlocked.findOne({ type, transmission, location })
                if (scheduleBlocked) {
                    if (scheduleBlocked.schBlockedDays) {
                        const newSchBlockedDays = scheduleBlocked.schBlockedDays.filter(schBlockedDay => {
                            if (schBlockedDay != `${column}:${row}`) {
                                return schBlockedDay
                            }
                        })
                        scheduleBlocked.schBlockedDays = newSchBlockedDays
                        await scheduleBlocked.save()
                        return res.status(200).end()
                    }
                }
            }
        }

    } catch(e) {
        return res.status(500).json({ issue: e.message })
    }

    return res.status(400).json({ issue: "Action not found" })

})


module.exports = schRouter