// get LOCATION from CONFIG
const { LOCATION } = require('./config')
const { User, Student } = require('../users/userModel')
const { InstructorScoring } = require('./instructors/scoringModel')

// Constants for charts
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


async function newStudentsInvolvingChart(deltaMonth) {
    // preparing Start Date, deltaMonth is a period in month
    const date = new Date()
    // current Year and start Year
    const currentYear = date.getFullYear()
    const startYear = currentYear - Math.trunc(deltaMonth / 12)
    // current month and start Month
    const month = date.getMonth()
    const startMonth = month + 1 + deltaMonth % 12
    // leading zero
    const textStartDate = startMonth > 9 ? `${startYear}-${startMonth}-01T00:00:00+00:00` : `${startYear}-0${startMonth}-01T00:00:00+00:00`
    const startDate = new Date(textStartDate)       // all dates are in 0-timezone in Mongo
    // getting students due criterias 
    const students = await Student.where("created").gt(startDate).select("created location")
    // results to return
    let analyticsArray = []
    // initing: LOCATION to array and locationValues will be 0 array with the same length as LOCATION
    const locations = Object.values(LOCATION)
    // creating blank array with correct item names
    for (let i=0; i <= deltaMonth; i++){
        let index = (month + i) % 12     // index can be greater than monthNames length
        let year = startYear + Math.trunc((month + i) / 12)
        analyticsArray.push({  // correct item names
            month: monthNames[index],
            year,
            newStudents: 0,
            locations,      // works like a pointer!!! if 1 element will change, each will change in entire array !!!
            locationValues: locations.map(l => { return 0 })      // Creating an array with the same dimension as 'locations'. This will be values. Cannot !!! assign some constant here, IT WILL work like a POINTER!!!
        })
    }
    // filling in blank array with data
    students.forEach(student => {
        let created = new Date(student.created)
        let i = (created.getFullYear() - startYear)*12 + created.getMonth() + 1 - startMonth
        analyticsArray[i].newStudents += 1
        let loc = locations.indexOf(student.location)
        if (loc > -1) {
            analyticsArray[i].locationValues[loc] += 1
        }
    })
    return analyticsArray
}



async function accountsReceivableChart() {
    try {
        const allUsers = await User.where("agreement").select("name balance payments").populate([
            { path: "agreement", select: "tuitionCost regisrFee supplyFee otherFee -_id" },
            { path: "student", select: "location -_id" },
        ])

        // init data per locations
        let data = []
        Object.values(LOCATION).filter(location => {
            if (location != LOCATION.All) {
                data.push({
                    location,
                    totalCost: 0,
                    totalPaid: 0,
                    totalDebt: 0,
                    users: []
                })
            }
        })

        if (allUsers) {
            allUsers.forEach(user => {
                if(user.agreement) {
                    let cost = user.agreement.tuitionCost ? user.agreement.tuitionCost : 0
                    cost += user.agreement.regisrFee ? user.agreement.regisrFee : 0
                    cost += user.agreement.supplyFee ? user.agreement.supplyFee : 0
                    cost += user.agreement.otherFee ? user.agreement.otherFee : 0

                    let paid = 0
                    if(user.payments) {
                        user.payments.forEach(pmt => {
                            paid += pmt.ammount
                        })
                    }

                    let debt = cost - paid
    
                    if (debt) {
                        let location = user.student ? user.student.location : LOCATION.Unset
                        for (let i=0; i<data.length; i++) {
                            if(data[i].location === location) {
                                data[i].users.push({
                                    _id: user._id, 
                                    name: user.name,
                                    cost, paid, debt,
                                    location
                                })
                                data[i].totalCost += cost
                                data[i].totalPaid += paid
                                data[i].totalDebt += debt
                                break
                            }
                        }
                    }
                }
            })
            // calculating average data
            data.map(locationData => {
                let n = locationData.users.length

                locationData.avCost = n ? locationData.totalCost / n : 0
                locationData.avPaid = n ? locationData.totalPaid / n : 0
                locationData.avDebt = n ? locationData.totalDebt / n : 0

                locationData.ratioPaid = locationData.totalCost ? locationData.totalPaid / locationData.totalCost : 0
                locationData.ratioDebt = locationData.totalCost ? locationData.totalDebt / locationData.totalCost : 0
            })
            return {
                result: true,
                data
            }
        } else {
            return {
                result: false,
                message: 'no users found'
            }
        }
    } catch(e) {
        return {
            result: false,
            message: e.message
        }
    }
}


// biulding a dynamic chart of enrollment statuses for the period
async function enrollmentStatusesChart(deltaMonth) {
    // preparing Start Date, deltaMonth is a period in month
    const date = new Date()
    // current Year and start Year
    const currentYear = date.getFullYear()
    const startYear = currentYear - Math.trunc(deltaMonth / 12)
    // current month and start Month
    const month = date.getMonth()
    const startMonth = month + 1 + deltaMonth % 12
    // leading zero
    const textStartDate = startMonth > 9 ? `${startYear}-${startMonth}-01T00:00:00+00:00` : `${startYear}-0${startMonth}-01T00:00:00+00:00`
    const startDate = new Date(textStartDate)       // all dates are in 0-timezone in Mongo
    // getting students due criterias 
    const students = await Student
        .where("enrollmentStatusUpdate").gt(startDate)
        .where("graduate").ne("no")
        .select("enrollmentStatusUpdate location graduate skillsTest -_id")
    // results to return
    let analyticsArray = []
    // initing: LOCATION to array and locationValues will be 0 array with the same length as LOCATION
    const locations = Object.values(LOCATION)
    // creating blank array with correct item names
    for (let i=0; i <= deltaMonth; i++){
        let index = (month + i) % 12     // index can be greater than monthNames length
        let year = startYear + Math.trunc((month + i) / 12)
        analyticsArray.push({  // correct item names
            indexMonth: index,
            month: monthNames[index],
            year,
            graduatedStudents: 0,   // for general statistic about all locations
            locations,      // works like a pointer!!! if 1 element will change, each will change in entire array !!!
            locationPassed: locations.map(l => { return 0 }),      // Creating an array with the same dimension as 'locations'. This will be values. Cannot !!! assign some constant here, IT WILL work like a POINTER!!!
            locationFailed: locations.map(l => { return 0 }),      // Creating an array of Failed
            locationDeclined: locations.map(l => { return 0 }),      // Creating an array of Declined
            locationMilitary: locations.map(l => { return 0 }),      // Creating an array of Military
            
            // skills test
            locationInitial: locations.map(l => { return 0 }),      // Creating an array of 'Initial' skills test
            locationRetest: locations.map(l => { return 0 }),      // Creating an array of 'Retest' skills test NOT INCLUDES next 2 types
            locationRetestBKnRD: locations.map(l => { return 0 }),      // Creating an array of 'Retest Bk & Rd' skills test
            locationRetestRDonly: locations.map(l => { return 0 }),      // Creating an array of 'Retest Rd only' skills test
        })
    }
    // filling in blank array with data
    students.forEach(student => {
        let graduated = new Date(student.enrollmentStatusUpdate)
        let i = (graduated.getFullYear() - startYear)*12 + graduated.getMonth() + 1 - startMonth
        analyticsArray[i].graduatedStudents += 1
        let loc = locations.indexOf(student.location)
        if (loc > -1) {
            switch (student.graduate) {
                case "passed":
                    analyticsArray[i].locationPassed[loc] += 1
                break;
                case "failed":
                    analyticsArray[i].locationFailed[loc] += 1
                break;
                case "declined":
                    analyticsArray[i].locationDeclined[loc] += 1
                break;
                case "military":
                    analyticsArray[i].locationMilitary[loc] += 1
                break;
            }
        }   //  loc > -1
    })      //  students.forEach


    // gathering skills test info
    const stds = await Student
    .find({ skillsTest: {$exists: true, $ne: []} })
    .select("key location skillsTest -_id")

    // "date" is not good as a right limit, because there some tests scheduled on dates after today
    const endDate = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)); //  day = 0 - last day of prev.month

    stds.forEach(student => {
        let loc = locations.indexOf(student.location)
        if (loc > -1) {
            if (student.skillsTest) {
                if (student.skillsTest.length) {
                    student.skillsTest.forEach(test => {
                        if (test.scheduledDate >= startDate && test.scheduledDate <= endDate) {
                            let m = (test.scheduledDate.getFullYear() - startYear)*12 + test.scheduledDate.getMonth() + 1 - startMonth
                            switch (test.testType) {
                                case "Initial":
                                    analyticsArray[m].locationInitial[loc] += 1
                                break;
                                case "Retest":
                                    analyticsArray[m].locationRetest[loc] += 1
                                break;
                                case "Retest Bk & Rd":
                                    analyticsArray[m].locationRetestBKnRD[loc] += 1
                                break;
                                case "Retest Rd only":
                                    analyticsArray[m].locationRetestRDonly[loc] += 1
                                break;
                            }
                        }
                    })
                }
            }
        }   //  loc > -1
    })      //  students.forEach

    return analyticsArray
}


// biulding a dynamic chart of enrollment statuses for the period
async function instructorsActivityChart(deltaMonth) {
    // preparing Start Date, deltaMonth is a period in month
    const date = new Date()
    // current Year and start Year
    const currentYear = date.getFullYear()
    const startYear = currentYear - Math.trunc(deltaMonth / 12)
    // current month and start Month
    const month = date.getMonth()
    const startMonth = month + 1 + deltaMonth % 12
    // leading zero
    const textStartDate = startMonth > 9 ? `${startYear}-${startMonth}-01T00:00:00+00:00` : `${startYear}-0${startMonth}-01T00:00:00+00:00`
    const startDate = new Date(textStartDate)       // all dates are in 0-timezone in Mongo
    // getting instructorScorings due criterias 
    const instructorScorings = await InstructorScoring
        .where("created").gt(startDate)
        .select("created instructorId instructorName scoringType scoring_certificate -_id")
    // results to return
    let analyticsArray = []
    // gather instructors
    const _instructorIds = []
    const _instructorNames = []
    const _scoringTypes = []
    instructorScorings.forEach(instructorScoring => {
        if (!_instructorIds.includes(instructorScoring.instructorId)) {
            _instructorIds.push(instructorScoring.instructorId)
            _instructorNames.push(instructorScoring.instructorName)
        }
        if (!_scoringTypes.includes(instructorScoring.scoringType)) {
            _scoringTypes.push(instructorScoring.scoringType)
        }
    })
    // creating blank array with correct item names
    for (let i=0; i <= deltaMonth; i++){
        let index = (month + i) % 12     // index can be greater than monthNames length
        let year = startYear + Math.trunc((month + i) / 12)
        analyticsArray.push({  // correct item names
            // period info
            month: monthNames[index],
            year,
            // general info about scorings
            scorings: 0,
            // scorings per instructors
            instructorIds: _instructorIds,
            instructorNames: _instructorNames,
            scoringsDoneByInstructors: _instructorIds.map(instId => { return 0 }),
            // scorings per their types
            scoringTypes: _scoringTypes,
            scoringsDoneByType: _scoringTypes.map(scoringType => { return 0 }),
        })
    }
    // filling in blank array with data
    instructorScorings.forEach(instructorScoring => {
        let created = new Date(instructorScoring.created)
        let i = (created.getFullYear() - startYear)*12 + created.getMonth() + 1 - startMonth
        // gather general info about scorings 
        analyticsArray[i].scorings += 1
        // gather statistic about Scorings Done By Instructors
        let inst = _instructorIds.indexOf(instructorScoring.instructorId)
        if (inst > -1) {
            analyticsArray[i].scoringsDoneByInstructors[inst] += 1
        }
        // gather statistic about Scorings Done By Types 
        let scoringType = _scoringTypes.indexOf(instructorScoring.scoringType)
        if (scoringType > -1) {
            analyticsArray[i].scoringsDoneByType[scoringType] += 1
        }
    })
    return analyticsArray
}


module.exports = {
    newStudentsInvolvingChart,
    accountsReceivableChart,
    enrollmentStatusesChart,
    instructorsActivityChart,
    monthNames
}