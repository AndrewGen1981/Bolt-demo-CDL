const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const path = require('path')

// CONFIG
const admin = require('./config')

// MODELS for mongoose
const { User, Student, tools } = require('../users/userModel')
const { dataCollectionForm } = require('../users/applicants/form1Model')
const { applicationForm } = require('../users/applicants/form2Model')
const { agreementForm } = require('../users/applicants/form3Model')
const { Tuition } = require('../users/tuition/tuitionModel')
const { StudentScoring, InstructorScoring } = require('./instructors/scoringModel')

const { qrCONFIG } = require('./config-qr')

// Charts
const chart = require('./adminProfileCharts')

// @SESSION config
const ADM_SESS_DURATION = 1000 * 60 * 60 * 12    //  12 hours

// extracting from process.env
const {
    NODE_ENV = 'development',

    SESS_NAME = 'ADMSID',
    SESS_SECRET = '!GODMODE_FORADMINS_NOmoreWar2022',
    SESS_LIFETIME = ADM_SESS_DURATION
} = process.env

const IN_PROD = NODE_ENV === 'production'

// ./admin
const admRouter = express.Router()



// adding session configuration
admRouter.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI_SESSA }),        // use mongo for amdins sessions

    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))



function extractAdminFields(adminProfile) {
    return {
        id: adminProfile.id,
        name: adminProfile.name,
        first: adminProfile.name.split(' ')[0],
        last: adminProfile.name.split(' ')[1],
        title: adminProfile.title,
        location: adminProfile.location
    }
}



// @MIDDLEWARE
function redirectToLogin (req, res, next) {
    // if user is NOT logged in, then redirect user to Login page
    if (!req.session.userId) {
        res.redirect('/admin')
    } else { next() }
}
function redirectToHome (req, res, next) {
    // if user is logged in, then redirect user to Home page
    if (req.session.userId) {
        res.redirect('/admin/profile')
    } else { next() }
}
admRouter.use(async(req, res, next) => {   // !!! general middleware - will be used before EACH ROUTE!!!
    res.locals.user = req.session.adminData
    next()
})

// @Auth check middleware
function ifCanRead (req, res, next) {
    // check Admin's Auth - if can READ
    if (!admin.checkAdminsAuth(req.session.adminData, 'read')) {
        return res.render(path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"), { auth: "read" })
    } else { next() }
}
function ifCanWrite (req, res, next) {
    // check Admin's Auth - if can WRITE
    if (!admin.checkAdminsAuth(req.session.adminData, 'write')) {
        return res.render(path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"), { auth: "write" })
    } else { next() }
}
function ifCanReadOrInstructor (req, res, next) {
    // check Admin's Auth - if INSTRUCTOR
    if (admin.checkAdminsAuth(req.session.adminData, 'read')) { return next() }
    if (admin.checkAdminsAuth(req.session.adminData, 'instructor')) { return next() }
    return res.render(path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"), { auth: "read or instructor" })
}
function ifCanWriteOrInstructor (req, res, next) {
    if (admin.checkAdminsAuth(req.session.adminData, 'write')) { return next() }
    if (admin.checkAdminsAuth(req.session.adminData, 'instructor')) { return next() }
    return res.render(path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"), { auth: "write or instructor" })
}
function ifSuperAdmin (req, res, next) {
    if (admin.checkAdminsAuth(req.session.adminData, 'share')) { return next() }
    return res.render(path.join(global.__basedir + "/static/general-pages/NEA/NEA.ejs"), { auth: "super-admin" })
}


// LOGIN, MAIN, PROFILE ROUTES
admRouter.get('/', redirectToHome, (req, res) => {
    res.render(path.join(__basedir+'/users/login.ejs'), {
        id: req.session.userId,
        issue: admin.ISSUES[req.query.logIssue],
        baseRoute: "ADMIN",
    })
})

admRouter.get('/profile', redirectToLogin, async(req, res) => {
    res.render(path.join(__dirname+'/admProfile.ejs'), {
        user: res.locals.user,
        analyticsArray: await chart.newStudentsInvolvingChart(12)
    })
})


admRouter.post('/', redirectToHome, async(req, res) => {
    const { id, password } = req.body
    const adm = await admin.checkCredentials(id, password)
    if (adm) {
        req.session.userId = id
        req.session.adminData = adm
        // if role is "instructor", then redirect to INs, otherwise - to admin profile
        if (adm.authString === "instructor") {
            return res.redirect("/admin/student")
        } else {
            return res.redirect("/admin/profile")
        }
    } else {
        res.status(400).redirect('/admin?logIssue=wrongIDPASS')
    }
})

admRouter.post('/logout', redirectToLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin/profile')
        }
    })
    res.clearCookie(SESS_NAME)
    res.redirect('/admin')
})


// @USERS AREA Routes
admRouter.get('/user-area', redirectToLogin, ifCanRead, async (req, res) => {
    // shows users area with all registered students and applicants
    try {
        const adminProfile = req.session.adminData
        if (adminProfile) {
            // find, sort in descending order and populate if students to get a location
            const allUsers = await User.find()
            .sort({ created: -1 })
            .select('-balance -__v -payments -password')
            .populate({path: 'student', select: 'location graduate'})
            // filtering only students due to admin's lcation + all UNSET + all, who are not students yet
            const users = allUsers.filter(user => {
                if (!user.student) {
                    return user
                } else {
                    if (user.student.graduate === "no") {
                        let location = user.student.location
                        if (adminProfile.location === admin.LOCATION.All || location === admin.LOCATION.Unset || location === adminProfile.location || !location) {
                            return user
                        }
                    }
                }
            })
            return res.render(path.join(__dirname + '/views/userArea.ejs'), { 
                admName: adminProfile.name,
                admLocation: adminProfile.location,
                users
            })
        }
        return res.status(404).send('Admin is not identified')
    } catch (e) {
        res.status(400).send(`Cannot retrieve users, issue is: ${e.massage}`)
    }
})


// @USERS/APPLICANTS/STUDENTS profiles form admin
admRouter.get('/user/:id', redirectToLogin, ifCanReadOrInstructor, async(req, res) => {
    const id = req.params.id    //  user id
    const tab = req.query.activatetab       // what tab to show at start
    const open = req.query.open             // what details group to open

    try {
        const user = await User.findById(id).populate([
            { path: 'dataCollection' },
            { path: 'application' },
            { path: 'agreement' },
            {
                path: 'student', 
                populate: [
                    { path: 'tuition', select: '-key -email -student_id_string -__v' },  // excluding fields from query
                    { path: 'scoring', select: '-key -email -student_id_string -__v' },  // excluding fields from query
                    { path: 'schedule', select: 'appointments' }
                ]
            },
        ])

        if (user === null) { return res.status(400).send(`Wrong request: ${id}`) }

        // Preparing updaters fields - original from db have only admin's id, I'd like to pass a name instead
        const forms = ['dataCollection', 'application', 'agreement']
        forms.forEach(async(form) => {
            if (user[form]) {
                if (user[form].updatedAdmin) {
                    let updater = await admin.findAdminById(user[form].updatedAdmin)
                    if (updater) { user[form].updatedAdmin = updater.name }      //  getting an admin's name by id
                }
            }
        })

        // current admin will sign or, if Agreement is signed alredy, the one in the agreement
        const loggedAdmin = req.session.adminData
        let adm = loggedAdmin
        if (user.agreement) {
            if (user.agreement.schoolSignRep) {
                adm = await admin.findAdminById(user.agreement.schoolSignRep)
            }
        }

        const signer = extractAdminFields(adm)

        // if user is a student and has clocks array already, then get student clocks's array - check tools to find out what is that
        if (user.agreement && user.student) {       // only when Agreement is signed and full/part is determined AND user is a Student
            if (user.agreement.visiting && user.student.clocks) {
                
                // just an Agreement perspective about full or part-time. And tools.reCalculateTTT will determine if it counts at all
                const minVisitingRequirements = user.agreement.visiting.toLowerCase().includes("full time") ? 6 : 4
                const { TTT, studentClocks } = tools.reCalculateTTT(user.student.clocks, minVisitingRequirements)       //  destructuring results

                return res.render(path.join(__dirname+'/views/userInfo.ejs'), {
                    loggedAdmin, user, signer,
                    verTTT: TTT / (1000 * 60 *60),
                    verClocks: studentClocks,
                    tab, open,
                    enrollmentStatuses: tools.enrollmentStatusesArray,
                    allLocations: admin.getAllLocations(),
                })
                            
            }   //  type is determined AND clocks are present
        }   //  Agreement is signed AND user is a Student
        
        res.render(path.join(__dirname+'/views/userInfo.ejs'), { 
            loggedAdmin, user, signer, tab, open,
            enrollmentStatuses: tools.enrollmentStatusesArray,
            allLocations: admin.getAllLocations(),
        })

    } catch(e) {
        res.status(500).send(`Something is happened... ${e.message}. Try later please.`)
    }

})



// without this BODY is empty when just fetching from client-side
admRouter.use(express.json({
    type: ['application/json', 'text/plain']
}))

// for user data updating (block/unblock/archive/delete)
admRouter.put('/user', redirectToLogin, ifCanWrite, async(req, res) => {
    const { studentId, userId, action } = req.body
    if (!action) { return res.status(400).json({ issue: 'Action is not defined' }) }

    if (action === "block" || action === "unblock") {
        try {
            if (!studentId) { return res.status(400).json({ issue: 'Not A Student' }) }
            await Student.findByIdAndUpdate(studentId, { status: action })
            return res.status(200).end()
        } catch(e) {
            return res.status(500).json({ issue: e.message })
        }
    }

    // action === archive TODO: should it transfer all archived data to other collection? or just filter data when showing student list

    // Changes Graduate stauses
    async function updateGraduateStauses(studentId, enrollmentStatus, graduate) {
        // TOOL for statuses updating
        try {
            await Student.findByIdAndUpdate(studentId, { graduate, enrollmentStatus, enrollmentStatusUpdate: new Date() })
            return 200
        } catch(e) { return e.message }
    }
    // working with Statuses
    if (action === "Still enrolled in the program") {
        if (!studentId) { return res.status(400).json({ issue: 'Not A Student' }) }
        let result = await updateGraduateStauses(studentId, action, 'no')
        if (result === 200) { return res.status(200).end() }
        return res.status(404).json({ issue: result })
    }
    if (action === "Graduated from the program") {
        if (!studentId) { return res.status(400).json({ issue: 'Not A Student' }) }
        let result = await updateGraduateStauses(studentId, action, 'passed')
        if (result === 200) { return res.status(200).end() }
        return res.status(404).json({ issue: result })
    }
    if (action === "Withdrew/terminated from the program") {
        if (!studentId) { return res.status(400).json({ issue: 'Not A Student' }) }
        let result = await updateGraduateStauses(studentId, action, 'failed')
        if (result === 200) { return res.status(200).end() }
        return res.status(404).json({ issue: result })
    }
    if (action === "Withdrew/terminated from the program (Declined)") {
        if (!studentId) { return res.status(400).json({ issue: 'Not A Student' }) }
        let result = await updateGraduateStauses(studentId, action, 'declined')
        if (result === 200) { return res.status(200).end() }
        return res.status(404).json({ issue: result })
    }
    if (action === "Military leave of absence") {
        if (!studentId) { return res.status(400).json({ issue: 'Not A Student' }) }
        let result = await updateGraduateStauses(studentId, action, 'military')
        if (result === 200) { return res.status(200).end() }
        return res.status(404).json({ issue: result })
    }

    // Deleting a record and all related
    if (action === "delete") {
        if (!userId) { return res.status(404).json({ issue: 'User is not defined' }) }
        const user = await User.findById(userId)
        if (!user) { return res.status(404).json({ issue: 'User is not defined' }) }

        try {
            // deliting student info
            if (user.student) {
                const student = await Student.findById(user.student)
                if (student) {
                    if (student.tuition) { await Tuition.findByIdAndDelete(student.tuition) }   // deliting Tuition info
                    if (student.scoring) { 
                        // deleting { StudentScoring, InstructorScoring }
                        await StudentScoring.findByIdAndDelete(student.scoring)
                        await InstructorScoring.deleteMany({ 'examinedStudent_str_ref' : student._id })
                    }
                    await student.remove()
                }
            }

            // deleting forms data
            if (user.agreement) {
                await agreementForm.findByIdAndDelete(user.agreement)
            }
            if (user.application) {
                await applicationForm.findByIdAndDelete(user.application)
            }
            if (user.dataCollection) {
                await dataCollectionForm.findByIdAndDelete(user.dataCollection)
            }

            // TODO: delete Graduation data and etc. here too !!!

            // deleting a user
            await user.remove()

            return res.status(200).end()
        } catch(e) {
            return res.status(500).json({ issue: e.message })
        }
    }

    // action was not found
    res.status(404).json({ issue: "Action is not defined" })
})



// Generating a view to print (NOT a PDF one)
admRouter.get('/print-form/:id', redirectToLogin, ifCanRead, async(req, res) => {
    const id = req.params.id
    const form = req.query.form
    if (!id || !form) { return res.status(400).send(`Wrong request: ${id} : ${form}`) }

    try {

        const user = await User.findById(id)
        .populate('dataCollection')
        .populate('application')
        .populate('agreement')

        if (user === null) { return res.status(400).send(`Wrong request: ${id}`) }

        // current admin will sign or, if Agreement is signed alredy, the one in the agreement
        let adm = req.session.adminData
        if (user.agreement) {
            if (user.agreement.schoolSignRep) {
                adm = await admin.findAdminById(user.agreement.schoolSignRep)
            }
        }
        const signer = extractAdminFields(adm)

        if (form === 'form1') {
            return res.render(path.join(__dirname+'/views/_view-form1.ejs'), { user, signer })
        } else {
            if (form === 'form2') {
                return res.render(path.join(__dirname+'/views/_view-form2.ejs'), { user, signer })
            } else {
                if (form === 'form3') {
                    return res.render(path.join(__dirname+'/views/_view-form3.ejs'), { user, signer })
                } else {
                    return res.status(400).send(`Wrong request: ${form}`)
                }
            }
        }

    } catch(e) {
        res.status(500).send(`Something is happened... ${e.message}. Try later please.`)
    }
})




// @FORMS UPDATING

// middleware for updating dataCol, Application and Agreement
async function checkAndUpdate(req, res, next) {
    const id = req.params.id    //  _id of updated Model
    const url = req.url     // url contains form's reference, used to undestand what form is being updated
    const { whatWasUpdated } = req.body     // string with updated Model fields - userInfo.ejs defines what fields to update

    if (whatWasUpdated && id && url) {

        const form = url.replace(`/${id}`, '').replace('/', '')     // substructing form type from url
        
        const Model = form === 'update-form1' ? dataCollectionForm
        : form === 'update-form2' ? applicationForm
        : form === 'update-form3' ? agreementForm
        : undefined

        if (Model) {    // if we found a Model, then update it with given fields
            try {
                let updatedRecord = {}
                whatWasUpdated.split(',').map(fieldName => {
                    updatedRecord[fieldName] = Array.isArray(req.body[fieldName]) ? req.body[fieldName].toString() : req.body[fieldName]
                })
                updatedRecord.updatedAdmin = req.session.userId
                updatedRecord.updatedDate = new Date()

                await Model.findByIdAndUpdate(id, updatedRecord)

                // updating BALANCE if cost params were updated
                if (form === 'update-form3') {  // cost can be changed only from agreement page
                    let updatedCost = 0
                    updatedCost += updatedRecord.tuitionCost ? parseFloat(updatedRecord.tuitionCost) : 0
                    updatedCost += updatedRecord.regisrFee ? parseFloat(updatedRecord.regisrFee) : 0
                    updatedCost += updatedRecord.supplyFee ? parseFloat(updatedRecord.supplyFee) : 0
                    updatedCost += updatedRecord.otherFee ? parseFloat(updatedRecord.otherFee) : 0
                    if (updatedCost) {  //  if at least some cost param was updatet, then recalc balance
                        // user id is in 'postedPath'
                        const { userId } = req.body
                        const user = await User.findById(userId).populate({
                            path: 'agreement', select: 'tuitionCost regisrFee supplyFee otherFee'
                        })
                        user.balance = calculateBalance(user, user.payments)
                        await user.save()
                    }
                }

                next()  // updatet successfully
            } catch(e) {
                res.send(`Oops... We almost did it! Issue: ${e.message}`)
            }
        } else {
            res.send(`Issue: cannot define Model to update... URL='${url}'. Form '${form}'`)
        }
    } else {
        res.send("Issue: nothing to update. Check fields you've updated... ")
    }
}


admRouter.post('/update-form1/:id', redirectToLogin, ifCanWrite, checkAndUpdate, async(req, res) => {
    const { postedPath } = req.body
    res.status(200).redirect(postedPath)    // redirecting back to the posting page
})

admRouter.post('/update-form2/:id', redirectToLogin, ifCanWrite, checkAndUpdate, async(req, res) => {
    const { postedPath } = req.body
    res.status(200).redirect(postedPath)    // redirecting back to the posting page
})

admRouter.post('/update-form3/:id', redirectToLogin, ifCanWrite, checkAndUpdate, async(req, res) => {
    const { postedPath } = req.body
    res.status(200).redirect(postedPath)    // redirecting back to the posting page
})




// @SIGNING of the agreement

admRouter.post('/sign/:id', redirectToLogin, ifCanWrite, async(req, res) => {
    // signs Agreement with Admin's credentials passed from client side
    const agreementId = req.params.id

    if(await admin.checkCredentials(req.session.userId, req.body.signerPassword)) {
        // credentials are correct
        try {
            const agreement = await agreementForm.findByIdAndUpdate(agreementId, {
                tuitionCost: req.body.tuitionCostItem,
                regisrFee: req.body.regisrFeeItem,
                supplyFee: req.body.supplyFeeItem,
                otherFee: req.body.otherFeeItem,
                schoolSignRep: req.session.userId,
                schoolSignDate: new Date()
            })
    
            if (agreement === null) { return res.status(400).send(`Wrong request: ${agreementId}`) }
    
            const { postedPath } = req.body
            return res.status(200).redirect(postedPath)    // redirecting back to the posting page
    
        } catch(e) {
            res.status(500).send(`Signing issue... ${e.message}. Try later please.`)
        }
    } else {
        return res.status(400).redirect('back')     // password not belongs to current logged admin
    }

})



// @QR-codes work - NOT in specific module, becauses uses same session identification for assignWithAdminsMachine option
// * main principle is - to enable qr work admin has to login first, this defines location as well
// * this is why /qr/:id route requires admins auth first of all

// Middleware due to qrCONFIG.assignWithAdminsMachine
function qrRedirectToLogin (req, res, next) {
    // if user is NOT logged in, then redirect user to Login page if qrCONFIG.assignWithAdminsMachine
    if (!qrCONFIG.assignWithAdminsMachine) { return next() }

    if (!req.session.userId) {
        res.redirect('/admin')
    } else { next() }
}


// route /admin/qr/:id
admRouter.get('/qr/:id', qrRedirectToLogin, ifCanRead, async (req, res) => {
    const studentId = req.params.id    // receiving user _id from posting form
    const currentAdmin = req.session.adminData
    let location    // this will be passed as 'location' to a clock
    try {
        //  getting today's date-prefix
        const diffDays = tools.getDatePrefix(new Date())
        //  clocks are allowed only to students, get student and check one
        const student = await Student.findById(studentId).select('-tuition -scoring -skillsTest -__v')
        const user = await User.findById(student.user).populate('agreement').select('visiting')

        if (!student) { return res.status(400).send(`Issue: Cannot find a Student with id ${studentId}`) }
        // check location and qrCONFIG.assignWithAdminsMachine
        if (qrCONFIG.assignWithAdminsMachine) {     // allowed from admin's machine only?
            // let's check machine, if admin authorized
            if (!currentAdmin) { return res.status(400).send("Issue: Unrecognized admin. Login and try again.") }
            if (currentAdmin.location != admin.LOCATION.All) {  
                if (student.location != currentAdmin.location) { 
                    return res.status(400).send(`Clocks are forbidden, wrong location. Student assigned to ${student.location}`)
                }
            }
            location = currentAdmin.location
        } else {    // or allowed from any machine?
            location = 'TURNED OFF'
        }
        // can be in status of: block, unblock, archive, delete
        // only 'unblock' and not graduated student is good for Clocking
        if (student.status != "unblock") { return res.status(200).send(`Forbidden: Student status is ${student.status}`) }
        if (student.graduate != "no") { return res.status(200).send(`Forbidden: Student enrollment status is ${student.enrollmentStatus}`) }
        
        // check min time after last clock - 5 min to avoid doubling
        // counting todays clocks
        let todaysClocks = []
        student.clocks.map(clock => {
            if (clock.key == diffDays) {
                todaysClocks.push(clock)
            }
        })

        if (todaysClocks.length > 0) {    // if this is NOT a 1st clock for today, then go further, if not - check 5 mins and full/part option
            const time1 = new Date(todaysClocks[todaysClocks.length-1].date)
            const time2 = new Date()
            const hours_between_clocks = Math.abs(time2 - time1) / (3600000)

            // check if less, than 5 mins - DOUBLING
            if (hours_between_clocks < 0.08333) {   // double clock, less than 5 mins
                return res.status(200).send("Less than 5 mins from last one. Ignored")
            }
            
            let minTime = 0     // there are no restrictions when to Clock OUT

            // checking if passed 4/6 hours if qrCONFIG.checkFullPartTimeStudents && this is Clock OUT
            if (qrCONFIG.checkFullPartTimeStudents && ((todaysClocks.length % 2) !== 0)) { 
                minTime = user.agreement.visiting.toLowerCase().includes("full time") ? 6 : 4
                
                if (hours_between_clocks < minTime*0.97) {    //    duration is LESS, than minimum required time * 0.97(ratio to skip last minutes)
                    const h = Math.trunc(hours_between_clocks)
                    const m = Math.round((hours_between_clocks - h) * 60)
                    const mt = m === 1 ? `0${m} minute` : m < 10 ? `0${m} minutes` : `${m} minutes`
                    const ht = h > 0 ? `only ${h} hour(s) and ${mt}` : `less than hour - ${mt} only`
                    
                    let minTimeMsg = `According to the Agreement, this student minimum attendance at classes must be at least ${minTime} hours.`
                    minTimeMsg += ` ${user.agreement.visiting.toUpperCase()}. `
                    minTimeMsg += `Student is trying to make a clock OUT on the passage ${ht}. ClockOUT is NOT added, try later please.`

                    return res.status(200).send(minTimeMsg)
                }
            }
        }

        if(qrCONFIG.requiresGeoLocationCheck) {
            // GEO required, if forbiden by client, then 'na' will return to /admin/geo-update
            student.clocks.push({ date: new Date(), key: diffDays, lat: 'na', lon: 'na', location })
        } else {
            // GEO NOT required, 'nr' will return to /admin/geo-update
            student.clocks.push({ date: new Date(), key: diffDays, lat: 'nr', lon: 'nr', location })
        }

        // just an Agreement perspective about full or part-time. And tools.reCalculateTTT will determine if it counts at all
        const minVisitingRequirements = user.agreement.visiting.toLowerCase().includes("full time") ? 6 : 4
        student.TTT = tools.reCalculateTTT(student.clocks, minVisitingRequirements).TTT / (1000 * 60 *60)

        await student.save()

        const clockBacklink = student.clocks[student.clocks.length-1]._id

        return res.render(path.join(__dirname+'/views/qr.ejs'), { 
            student,
            qrCONFIG,
            key: diffDays,
            clockBacklink
        })

    } catch(e) {
        return res.status(400).send(`Issue occursed: ${e.message}`)
    }

})


// receives "callback" from page after /admin/qr/:id with geo data
admRouter.post('/qr-update-geo', async (req, res) => {
    const { studentId, clockBacklink, error, lat, lon } = req.body

    if (qrCONFIG.requiresGeoLocationCheck) {     //   if GEO required, then check result
        if (error != 'ok') { return res.status(400).send(`GEO location issue: ${error}`) }
    }
    if (error === 'ok') {   // can be 'not required' also
        try {
            const student = await Student.findById(studentId).populate([
                { path: 'user', populate: { path: 'dataCollection' } },
                { path: 'user', populate: { path: 'agreement' } }
            ])

            for(let i=0; i<student.clocks.length; i++) {    // updates lat and lon in a clock referred as 'clockBacklink'
                if(student.clocks[i]._id.toString() === clockBacklink) {
                    student.clocks[i].lat = lat
                    student.clocks[i].lon = lon
                    await student.save()
                    break
                }
            }

            return res.status(200).render(path.join(__dirname+'/views/qr_success-clock.ejs'), { 
                student,
                TODClocks: tools.getTodayClocksInfo(student.clocks)
            })

        } catch(e) {
            return res.status(400).send(`Issue occursed in UPDATE-GEO: ${e.message}`)
        }
    }    
})



// @CLOCKs work - showing and updating

// ROUTE POST /admin/clocks for updating clocks
admRouter.post('/clocks', redirectToLogin, ifCanWrite, async(req, res) => {
    const {studentId, userId, studentKey, studentName, visiting} = req.body
    try {
        const student = await Student.findById(studentId).select("email TTT clocks")
        if (student) {

            // just an Agreement perspective about full or part-time. And tools.reCalculateTTT will determine if it counts at all
            const minVisitingRequirements = visiting.toLowerCase().includes("full time") ? 6 : 4
            const { TTT, studentClocks } = tools.reCalculateTTT(student.clocks, minVisitingRequirements)       //  destructuring results

            return res.render(path.join(__dirname+'/views/userInfoClocks.ejs'), { 
                studentId, userId, studentKey, studentName, visiting,
                verTTT: TTT / (1000 * 60 *60),
                verClocks: studentClocks,
                admin: req.session.userId
            })
        }
        return res.status(404).send(`Student with ID#${studentId} not found`)
    } catch(e) {
        res.status(500).send(`Something is happened... ${e.message}. Try later please.`)
    }
})


// Calculating 'timeZoneHourDiff'
// Pacific Standard Time varies between UTC-08 and UTC-07
// this function defines exac hour difference 'America/Los_Angeles' from UTC-Z
function timeZoneHourDiff(date) {
    const iso = `${date.toLocaleString('en-CA', { timeZone: 'America/Los_Angeles', hour12: false }).replace(', ', 'T')}.000Z`
    const lie = new Date(iso)
    return -(lie - date) / 3600000
}


// for clocks updating
admRouter.post('/clocks-update', redirectToLogin, ifCanWrite, async(req, res) => {
    const {
        clockDate, studentId, 
        clockIN, latIN, lonIN, locationIN,
        doneByAdminIN, updatedByAdminIN,
        clockOUT, latOUT, lonOUT, locationOUT,
        doneByAdminOUT, updatedByAdminOUT,
    } = req.body

    // tool, converting strings to date with time
    function settime(dateString, timeString) {
        if (timeString.length < 6) { timeString += ':00' }
        // calculating timeZone difference due to summer/winter time
        const timeZoneDiff = timeZoneHourDiff(new Date(`${dateString}T${timeString}-08:00`))
        return new Date(`${dateString}T${timeString}-0${timeZoneDiff}:00`)
    }

    const newClocks = []
    let clIN, clOUT
    let TTT = 0

    const clockDates = Array.isArray(clockDate) ? clockDate : [clockDate]
    clockDates.forEach((dateString, index) => {
        clIN = settime(dateString, clockIN[index])
        clOUT = settime(dateString, clockOUT[index])
        
        if ((clOUT - clIN) > 0) {    // skip empty
            TTT += clOUT - clIN
            // adding clockIN
            newClocks.push({
                date: clIN,
                key: tools.getDatePrefixZeroZone(new Date(dateString)),
                lat: latIN[index],
                lon: lonIN[index],
                location: locationIN[index],
                doneByAdmin: doneByAdminIN[index],
                updatedByAdmin: updatedByAdminIN[index]
            })
            // adding clockOUT
            newClocks.push({
                date: clOUT,
                key: tools.getDatePrefixZeroZone(new Date(dateString)),
                lat: latOUT[index],
                lon: lonOUT[index],
                location: locationOUT[index] != 'none' ? locationOUT[index] : locationIN[index],
                doneByAdmin: doneByAdminOUT[index],
                updatedByAdmin: updatedByAdminOUT[index]
            })
        }
    })

    try {
        const student = await Student.findById(studentId)
        if (student) {
            student.TTT = TTT / (1000 * 60 *60)
            student.clocks = newClocks
            await student.save()
            return res.status(200).redirect(`/admin/user/${student.user}?activatetab=4`)
        }
        res.send('student is not defined')
    } catch(e) {
        res.send(`Issue: ${e.message}`)
    }
})


// for updating payment
admRouter.post('/update-payments', redirectToLogin, ifCanWrite, async(req, res) => {
    const { userId, paymentType, paymentDate, paymentAmount, paymentNotes } = req.body
    // updating to arrays if not
    const arrPmtTypes = Array.isArray(paymentType) ? paymentType : [paymentType]
    const arrPmtDates = Array.isArray(paymentDate) ? paymentDate : [paymentDate]
    const arrPmtAmounts = Array.isArray(paymentAmount) ? paymentAmount : [paymentAmount]
    const arrPmtNotes = Array.isArray(paymentNotes) ? paymentNotes : [paymentNotes]
    // amount - is the main array, so go with one to create newPaymentsArray
    const newPaymentsArray = []
    arrPmtAmounts.forEach((amount, index) => {
        // calculating timeZone difference due to summer/winter time
        let timeZoneDiff = timeZoneHourDiff(new Date(`${arrPmtDates[index]}:00-08:00`))
        if(parseFloat(amount)) {
            newPaymentsArray.push({
                type: arrPmtTypes[index],
                whenPaid: new Date(`${arrPmtDates[index]}:00-0${timeZoneDiff}:00`),
                ammount: parseFloat(amount),
                notes: arrPmtNotes[index]
            })
        }
    })
    try {
        // getting data about cost of tuition
        const user = await User.findById(userId).populate({
            path: 'agreement', select: 'tuitionCost regisrFee supplyFee otherFee'
        })
        // calculating the balance
        let balance = calculateBalance(user, newPaymentsArray)
        // updating user record
        await User.findByIdAndUpdate(userId, {payments: newPaymentsArray, balance})
        res.redirect(`/admin/user/${userId}?activatetab=3&open=payments`)
    } catch(e) {
        res.send(`Issue: ${e.message}`)
    }
})

// TOOL: calculates balance
function calculateBalance(user, payments) {
    // user should contain agreement with costs data
    // payments should be an array of payments like in UserModel
    let balance = 0
    if (user) {
        if (user.agreement) {
            balance -= parseFloat(user.agreement.tuitionCost) > 0 ? parseFloat(user.agreement.tuitionCost) : 0
            balance -= parseFloat(user.agreement.regisrFee) > 0 ? parseFloat(user.agreement.regisrFee) : 0
            balance -= parseFloat(user.agreement.supplyFee) > 0 ? parseFloat(user.agreement.supplyFee) : 0
            balance -= parseFloat(user.agreement.otherFee) > 0 ? parseFloat(user.agreement.otherFee) : 0
        }
    }
    if (payments) {
        payments.forEach(payment => {
            balance += payment.ammount
        })
    }
    return balance
}



// @ admin/student routes
admRouter.use('/student', redirectToLogin, require('../users/students/studentRouter'))
// @ admin/inst routes
admRouter.use('/inst', redirectToLogin, require('./instructors/instructorsRouter'))
// @ admin/charts routes
admRouter.use('/charts', redirectToLogin, ifCanRead, require('./charts/chartsRouter'))
// @ admin/schedule
admRouter.use('/schedule', redirectToLogin, ifCanWriteOrInstructor, require('./schedule/scheduleRouter'))
// @ Super Admin routes
admRouter.use("/super-admin", redirectToLogin, ifSuperAdmin, require("./super-admin/superAdmin"))


module.exports = admRouter