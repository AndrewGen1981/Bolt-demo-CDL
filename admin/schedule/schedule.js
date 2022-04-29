// CONFIG
const admin = require('../config')

// MODELS for mongoose
const { Student, Schedule } = require('../../users/userModel')
const { ScheduleBlocked } = require('./schTemplateModel')

// headers to pass
const spotsArray = ['08:00', '08:45', '09:30', '10:15', '11:00', '12:30', '13:15', '14:00', '14:45', '15:30', '16:15']
const daysOfWeek = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun']

const calendarTitles = {
    "backing1": "STRAIGHT LINE BACKING",
    "backing2": "OFFSET BACKING",
    "backing3": "ALLEY DOCK BACKING",
    "city": "CITY DRIVING", 
}
const calendarLimits = {
    "backing1": 4,
    "backing2": 4,
    "backing3": 4,
    "city": 4, 
}


// TOOL Midleware
async function getCalendarData(req, schType, nDays) {
    const date = req.query.date ? new Date(req.query.date) : new Date()

    const calendarTransmission = req.query.calendarTransmission || "AUTO"
    const calendarLocation = req.query.calendarLocation || admin.LOCATION.Tacoma
    // calendar term
    const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1, 0, 0, 0))
    const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1 + nDays, 0, 0, 0))

    const filter = { 
        location: calendarLocation,
        status: "unblock",
        graduate: "no",
    }

    const scheduleBlocked = await ScheduleBlocked.findOne({
        schType,
        schTransmission: calendarTransmission,
        schLocation: calendarLocation
    })
    const blockedArray = scheduleBlocked ? scheduleBlocked.schBlockedDays : []
        
    const students = await Student.find(filter).select('key').populate([
        { 
            path: "user",
            select: "dataCollection",
            populate: {
                path: "dataCollection",
                select: "firstName lastName",
            },
        },
        { path: 'schedule' }
    ])

    // selecting appointments for this period
    const scheduledAppointments = []
    students.forEach(student => {
        if(student.schedule) {
            student.schedule.appointments.forEach(appointment => {
                if(appointment.appDate >= startDate && appointment.appDate <= endDate) {
                    scheduledAppointments.push({
                        appDate: appointment.appDate,
                        appType: appointment.appType,
                        appTransmission: appointment.appTransmission,
                        appLocation: appointment.appLocation,
                        studentNameKey: `${student.user.dataCollection.firstName} ${student.user.dataCollection.lastName} ${student.key}`,
                        studentId: student._id,
                        scheduleId: student.schedule._id,
                        appointmentId: appointment._id,
                    })
                }
            })
        }
    })
    
    return { 
        students, scheduledAppointments,
        startDate, spotsArray, daysOfWeek,
        calendarTransmission, calendarLocation,
        blockedArray, schType,
        calendarTitles
    }
}


// get info about appointments for student's side
async function getCalendarDataForStudent(schType, schTransmission, schLocation, studentId, nDays) {
    if (!schType || !schTransmission || !schLocation) { return false }
    const date = new Date()
    // calendar term
    const startDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1, 0, 0, 0))
    const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1 + nDays, 0, 0, 0))
    // reading blocked cells
    const scheduleBlocked = await ScheduleBlocked.findOne({
        schType,
        schTransmission: schTransmission,
        schLocation: schLocation
    })
    const blockedArray = scheduleBlocked ? scheduleBlocked.schBlockedDays : []
    // reading scheduled appointments
    const schedules = await Schedule.find({ appointments: { $exists: true, $ne: [] } })
    // selecting appointments for this period
    const scheduledAppointments = []
    schedules.forEach(schedule => {
        if(schedule.appointments) {
            schedule.appointments.forEach(appointment => {
                if(appointment.appDate >= startDate 
                   && appointment.appDate <= endDate
                   && appointment.appType === schType
                   && appointment.appTransmission === schTransmission
                   && appointment.appLocation === schLocation) {
                    scheduledAppointments.push({
                        scheduleId: schedule._id,
                        appointmentId: appointment._id,
                        appDate: appointment.appDate,
                        appType: appointment.appType,
                        appTransmission: appointment.appTransmission,
                        appLocation: appointment.appLocation,
                        isItMe: studentId.toString() === schedule.student.toString()
                    })
                }
            })
        }
    })
    return { 
        scheduledAppointments, nDays,
        startDate, spotsArray, daysOfWeek,
        schTransmission, schLocation,
        blockedArray, schType,
        calendarTitles,
        calendarLimits
    }
}


module.exports = {
    spotsArray,
    daysOfWeek,
    calendarTitles,
    getCalendarData,
    getCalendarDataForStudent
}