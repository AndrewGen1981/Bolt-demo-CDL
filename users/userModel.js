const mongoose = require('mongoose')

// Bringing Models to setup backlinks on other models
// this approach makes search faster
const { dataCollectionForm } = require('./applicants/form1Model')     // FORM1 Model
const { applicationForm } = require('./applicants/form2Model')     // FORM2 Model
const { agreementForm } = require('./applicants/form3Model')     // FORM3 Model
const { qrCONFIG } = require('../admin/config-qr')


// @HOW TO USE:
// const appl = await User.findOne({ email: req.session.userId })
//     .populate('dataCollection')
//     .populate('application')
//     .populate('agreement')
//     .populate('student')

// OR
// await Student.findById(id).select(studentPopulated).populate([
//    {
//        path: 'user', select: userPopulated,
//        populate: { path: 'agreement', select: dataAgrPopulated },
//    },
//    {
//        path: 'user', select: userPopulated,
//        populate: { path: 'dataCollection', select: dataCollPopulated }
//    }
// ])

// select: '-key -_-d -__v' - for excluding fields from request

// BEST approach is to use STRINGS (faster) when selecting, not arrays
// const user = await User.findById(userId).populate({
//     path: 'agreement', select: 'tuitionCost regisrFee supplyFee otherFee'
// })



// @UserSchema for mongoose
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, lowercase: true, required: true },
    password: { type: String, required: true },
    created: { type: Date, default: new Date },
    lastSESS: { type: Date, default: new Date },
    token: { type: String, default: "not sent" },

    // payments should be here, because not only Student can pay, User can pay too
    payments: [{
        type: { type: String, default: 'UNSET' },
        whenPaid: { type: Date, default: new Date },
        ammount: { type: Number, default: 0.00 },
        notes: String,
    }],
    balance: { type: Number, default: 0.00 },

    // @Applicant part, refrences on FORMS
    dataCollection: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: dataCollectionForm
    },
    application: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: applicationForm
    },
    agreement: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: agreementForm
    },
    student: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Student'
    },
}, {
    collection: 'users'
})



// __CONFIG collection is user for configurations
const configSchema = new mongoose.Schema({
    configType: { type: String, required: true },
    lastStudentKey: Number      // autoINC pre.save
}, {
    collection: "__CONFIG"
})


const studentSchema = new mongoose.Schema({
    key: { type: Number, required: true },
    email: { type: String, lowercase: true, required: true },
    created: { type: Date, default: new Date() },
    fullName: String,       //  first & last names, makes selection faster, allows to get rid of couple 'populates'
    
    location: {type: String, default: "UNSET"},
    // 'status' is for show current status of the student
    status: {type: String, default: "unblock"},         // unblock/block
    graduate: {type: String, default: "no", lowercase: true, required: true},           // no/passed/failed/declined/military
    enrollmentStatus: {type: String, default: "Still enrolled in the program"},
    // 'enrollmentStatus' is for specifying the reason of graduating
    // Still enrolled in the program
    // Graduated from the program
    // Withdrew/terminated from the program
    // Withdrew/terminated from the program (Declined) - my status, to track all terminated voluntarily at the initiative of the student
    // Military leave of absence
    enrollmentStatusUpdate: { type: Date, default: new Date() },

    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'userSchema'
    },

    TTT: { type: Number, default: 0 },
    
    clocks: [{
        date: Date,
        key: String,
        lat: String,
        lon: String,
        location: String,
        doneByAdmin: String,
        updatedByAdmin: String
    }],

    tuition: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'tuitionSchema'
    },
    scoring: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'studentScoringSchema'
    },
    skillsTest: [{
        testLocation: String,
        testType: String,
        vehicleType: String,
        endorsements: String,
        brakes: String,
        strf: String,
        scheduledDate: { type: Date, default: new Date() }
    }],
    schedule: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Schedule'
    },
}, {
    collection: "Student List"
})


// scheduleSchema for handling schedule
const scheduleSchema = new mongoose.Schema({
    student: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Student'
    },
    appointments: [{
        appDate: { type: Date, default: new Date() },
        appType: String,
        appTransmission: String,
        appLocation: String,
    }]
}, {
    collection: "Schedule"
})




// @TOOLS SECTION
function getDatePrefix(date) {
    //  returns date-prefix due to LA time zone
    // used for clock INs & OUTs
    const timezoneOffset = (12 - 8) * 3600000       //  8h diff with LA time zone
    const diffTime = Math.abs(date - new Date("1900-01-01T00:00:00+00:00")) + timezoneOffset
    return Math.round(1 + diffTime / 86400000)
}
function getDatePrefixZeroZone(date) {
    //  returns date-prefix for clock update operations
    // ignore time zones, because -08:00 is hardcoded at server side
    const diffTime = Math.abs(date - new Date("1900-01-01T00:00:00+00:00"))
    return Math.round(2 + diffTime / 86400000)
}


function sortClocksArray(clocksArray) {
    return clocksArray.sort((a, b) => {
        if (parseInt(a.key) > parseInt(b.key)) { return 1 }
        if (parseInt(a.key) < parseInt(b.key)) { return -1 }
        // if keys are equal, then compare by clock time
        if (new Date(a.date) > new Date(b.date)) { return 1 }
        if (new Date(a.date) < new Date(b.date)) { return -1 }
        return 0; // impossble variant, but has to be mentioned here if minTime will be set=0, default 5 mins
    })
}


function getTodayClocksInfo(clocks) {
    // returns info object about last Clock

    const todDatePrefix = getDatePrefix(new Date())     // getting today's date-prefix in LA time zone
    
    const todayClocks = sortClocksArray( clocks.filter(clock => clock.key == todDatePrefix) )
    if (todayClocks.length === 0) { return false }

    let lastClockIN

    todayClocks.map((clock, index) => {
        if (index % 2 === 0) {      // this is IN, because startiung from 0
            clock.type = 'Clock IN'
            lastClockIN = clock.date
        } else {
            clock.type = 'Clock OUT'
            clock.duration = new Date(clock.date) - new Date(lastClockIN)
        }
    })

    return {
        lastClock: todayClocks[todayClocks.length - 1],
        todayClocks
    }

}



function reCalculateTTT(clocksArray, minVisitingRequirements) {      // minVisitingRequirements has to be 4 or 6 for part and full-time respectively
    // recalculates TTT, uses array of clocks as a base
    // RULE: todays clocks will be encounted only tommorow
    
    // clocks should be a sorted array, because clocks appear one by one. But I'm sorting them one more time
    const clocks = sortClocksArray(clocksArray)

    let studentClocks = []   // structured array of clock objects [{ date, dateKey, in, out, duration, location }]
    let TTT = 0
    if (clocks.length === 0) { return { TTT, studentClocks } }     // studentClocks length will be 0 when no clocks!!! check this before use

    const minSessionDuration = qrCONFIG.checkFullPartTimeStudents ? minVisitingRequirements * 1000 * 60 * 60 : 1 * 1000 *60 *60      // 1h, if checkFullPartTimeStudents = false and 4/6 if true
    
    let sessionDuration = 0
    let dayClocksCount = 0
    let todaysKey = clocks[0].key
    let lastClockIN
    

    for(let i=0; i < clocks.length; i++) {
        dayClocksCount += 1     // found a clock
        if (clocks[i].key === todaysKey) {      // still in the same day
            if (dayClocksCount % 2 === 1) {     // this is a clock IN
                lastClockIN = clocks[i].date    // saving last clock IN
                sessionDuration = minSessionDuration    // and assume there will be no clock OUT
                
                // init new clock object
                studentClocks.push({ 
                    date: clocks[i].date, dateKey: clocks[i].key, 
                    
                    in: clocks[i].date, inlat: clocks[i].lat, inlon: clocks[i].lon, inlocation: clocks[i].location,
                    inDoneByAdmin: clocks[i].doneByAdmin, inUpdatedByAdmin: clocks[i].updatedByAdmin,
                    
                    out: '-', outlat: '-', outlon: '-', outlocation: 'none',
                    outDoneByAdmin: '-', outUpdatedByAdmin: '-',
                    
                    duration: minSessionDuration
                })

            } else {    // this is a clock OUT
                let timeDelta = new Date(clocks[i].date) - new Date(lastClockIN)
                TTT += timeDelta
                sessionDuration = 0

                // updating last clock object
                let n = studentClocks.length - 1
                studentClocks[n].out = clocks[i].date
                studentClocks[n].outlat = clocks[i].lat
                studentClocks[n].outlon = clocks[i].lon
                studentClocks[n].outlocation = clocks[i].location
                studentClocks[n].outDoneByAdmin = clocks[i].doneByAdmin
                studentClocks[n].outUpdatedByAdmin = clocks[i].updatedByAdmin
                studentClocks[n].duration = timeDelta
            }
        } else {  // next day
            
            if (sessionDuration > 0) {      // there was no clock OUT
                TTT += sessionDuration
            }
            
            dayClocksCount = 1  // not 0, because this is a 1st clock - clock IN
            lastClockIN = clocks[i].date    // saving last clock IN
            sessionDuration = minSessionDuration    // and assume there will be no clock OUT
            todaysKey = clocks[i].key

            // init new clock object
            studentClocks.push({ 
                date: clocks[i].date, dateKey: clocks[i].key, 

                in: clocks[i].date, inlat: clocks[i].lat, inlon: clocks[i].lon, inlocation: clocks[i].location,
                inDoneByAdmin: clocks[i].doneByAdmin, inUpdatedByAdmin: clocks[i].updatedByAdmin,

                out: '-', outlat: '-', outlon: '-', outlocation: 'none',
                outDoneByAdmin: '-', outUpdatedByAdmin: '-',

                duration: minSessionDuration
            })
        }
        
    }   //  end of for

    if (sessionDuration > 0) {      // there was no LAST clock OUT
        TTT += sessionDuration
    }

    return { TTT, studentClocks }

}





module.exports = { 
    User: mongoose.model('userSchema', userSchema),
    Student: mongoose.model('Student', studentSchema),
    StudentCONFIG: mongoose.model('StudentCONFIG', configSchema),
    Schedule: mongoose.model('Schedule', scheduleSchema),
    tools: {
        getDatePrefix,
        getDatePrefixZeroZone,
        getTodayClocksInfo,
        reCalculateTTT,
        enrollmentStatusesArray: [
            { key: 'no', value: 'Still enrolled in the program'},
            { key: 'passed', value: 'Graduated from the program'},
            { key: 'failed', value: 'Withdrew/terminated from the program'},
            { key: 'declined', value: 'Withdrew/terminated from the program (Declined)'},
            { key: 'military', value: 'Military leave of absence'},
        ]
    }
}

