// This router module will be used for users (applicants, students and etc.) account creating
// for admin, instuctors and Users other routes will be created

const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')     //  express-session will use mongo vs MemoryStore for datause, prevent memory leaks
const path = require('path')

const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')


// node-fetch from v3 is an ESM-only module - you are not able to import it with require().
// If you cannot switch to ESM, please use v2
// npm install node-fetch@2
// const fetch = require('node-fetch')


// MODELS for mongoose
const { User, Student, Schedule, tools } = require('./userModel')
const { dataCollectionForm, getForm1Object } = require('./applicants/form1Model')
const { applicationForm, getForm2Object } = require('./applicants/form2Model')
const { agreementForm, getForm3Object } = require('./applicants/form3Model')
const { StudentScoring } = require('../admin/instructors/scoringModel')

// POSTMAN and messages
const { getInfoMessage, getIssueMessage } = require('./_messages')
const postman = require('./postman/postman')

// use config for allowOnlyOne_USER_ActiveSession
const { allowOnlyOne_USER_ActiveSession, SCHOOL_DATA } = require("../admin/config")

// @SESSION setup
const SESS_DURATION = 1000 * 60 * 60 * 6    //  6 hours for Applicants and Students

// extracting from process.env
const {
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = 'CDLSchoolSecretString2022!',
    SESS_LIFETIME = SESS_DURATION
} = process.env

const IN_PROD = NODE_ENV === 'production'


const userRouter = express.Router()

// adding session configuration
userRouter.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI_SESSU }),        // use mongo for amdins sessions

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


userRouter.use((req, res, next) => {   // !!! general middleware - will be used before EACH ROUTE!!!
    res.locals.SCHOOL_DATA = SCHOOL_DATA,
    next()
})


// middleware
function redirectToLogin (req, res, next) {
    // if user is NOT logged in, then redirect user to Login page
    if (!req.session.userId) {
        res.redirect('/user')
    } else { next() }
}
function redirectToHome (req, res, next) {
    // if user is logged in, then redirect user to Home page
    if (req.session.userId) {
        res.redirect('/user/home')
    } else { next() }
}


// *ROUTES FOR USERS (applicants and Students)
// @GET REQUESTS
userRouter.get('/', redirectToHome, (req, res) => {
    // checking for income messages
    const { status, e } = req.query
    res.render(path.join(__dirname+'/login.ejs'), {
        baseRoute: "USER",      // used for redirect if admin
        error: status === 'issue' ? getIssueMessage(e) : false,
        info: status === 'info' ? getInfoMessage(e) : false,
        isThereErrors: false,   // no errors yet
        errors: []
    })
})

userRouter.get('/issue', async(req, res) => {
    res.render(path.join(__dirname+'/issue-page.ejs'), {
        msg: "You are blocked. Refer to a school manager"
    })
})

userRouter.get('/home', redirectToLogin, async(req, res) => {
    try {
        const user = await User.findById(req.session._id).select('-__v -password').populate({ path: 'agreement', select: 'visiting' })
        if (!user) { return res.status(404).redirect('/user/logout') }      //  logs user out if user is undefined
    
        if (user.student) {
            user.student = await Student
            .findById(user.student)
            .select('-__v -user')
            .populate([
                { path: 'tuition', select: 'created isAllowed avLessonsRate lessons' },
                { path: 'scoring' },
                { path: 'schedule', select: 'appointments' }
            ])
        }

        // checking for income messages
        const { status, e } = req.query
    
        user.msg = status === 'issue' ? { class: 'issue', txt: getIssueMessage(e), e }
        : status === 'ok' ? { class: 'success', txt: getInfoMessage(e), e }
        : status === 'info' ? { class: 'info', txt: getInfoMessage(e), e }
        : { class: 'info', txt: "Welcome back" }

        // if Student, then show TTT and Clocks
        // if user is a student and has clocks array already, then get student clocks's array - check tools to find out what is that
        if (user.agreement && user.student) {       // only when Agreement is signed and full/part is determined AND user is a Student
            // check if blocked
            if (user.student.status != "unblock") {
                return res.render(path.join(__dirname+'/issue-page.ejs'), {
                    name: user.student.fullName,
                    msg: "You are blocked. Refer to a school manager"
                })
            }
            // check if graduate/withdraw
            if (user.student.graduate != "no") {
                return res.render(path.join(__dirname+'/issue-page.ejs'), {
                    name: user.student.fullName,
                    msg: `You status is "${user.student.enrollmentStatus}"`
                })
            }
            if (user.agreement.visiting && user.student.clocks) {
                // just an Agreement perspective about full or part-time. And tools.reCalculateTTT will determine if it counts at all
                const minVisitingRequirements = user.agreement.visiting.toLowerCase().includes("full time") ? 6 : 4
                const { TTT, studentClocks } = tools.reCalculateTTT(user.student.clocks, minVisitingRequirements)       //  destructuring results

                return res.render(path.join(__dirname+'/home.ejs'), { 
                    user, SESS_EXP: req.session.cookie._expires,
                    tuition: user.student.tuition,

                    verTTT: TTT / (1000 * 60 *60),
                    verClocks: studentClocks,
                    visiting: user.agreement.visiting,

                    scorings: user.student.scoring
                })
            }   //  type is determined AND clocks are present
        }   //  Agreement is signed AND user is a Student
        return res.render(path.join(__dirname+'/home.ejs'), { user, SESS_EXP: req.session.cookie._expires })
    } catch(e) {
        return res.status(400).send(`Ooppps... ${e.message}`)
    }
})


userRouter.get('/register', redirectToHome, (req, res) => {
    res.render(path.join(__dirname+'/register.ejs'), {
        isThereErrors: false,   // no errors yet
        errors: []
    })
})


// @POST REQUESTS
userRouter.post('/', redirectToHome, async (req, res) => {
    const { email, password } = req.body
    if (email && password) {
        const user = await User.findOneAndUpdate({ email }, { lastSESS: new Date }) // updating last session time
        if (!user) {    //  no user with such an email
            return res.redirect('/user?status=issue&e=wrongUserOrPassword')  // can not find a user
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                // cut-off extra sessions
                await allowOnlyOne_USER_ActiveSession(user._id.toString())
                // saving data to a session
                req.session.userId = email
                req.session.email = user.email
                req.session._id = user._id
                return res.redirect('/user/home')
            }
        } catch(e) { res.status(500).end() }
    } 
    res.redirect('/user?status=issue&e=wrongUserOrPassword')  // wrong password
})


userRouter.post('/register', redirectToHome, body("email")
    .isLength({ min: 1 }).trim().withMessage("Email must be specified")
    .isEmail().withMessage("Email must be a valid email address")
    .custom( (value) => {
        return User.findOne({email : value}).then((user) => {
            if (user) {
                return Promise.reject("Email already in use");
            }
        })
    }),    
    body('password').isLength({ min: 5 }).withMessage("Minimum length is 5 symbols"),     // password must be at least 5 chars long
    async (req, res) => {
    
    // Finds the validation errors in this request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render(path.join(__dirname+'/register.ejs'), {
            isThereErrors: true,
            errors: errors.array()
        })
    }

    // Request is ok, can create a user
    const { name, email, password } = req.body
    const token = postman.generateAToken()      //  as default token was "not sent", now it will be generated automatically

    // creating token link depends on is in production
    const tokenLink = IN_PROD ?
    `https://${req.headers.host}/user/token/${token}?email=${email}` :     // should be HTTPS for Production
    `http://${req.headers.host}/user/token/${token}?email=${email}`        // should be HTTP for Dev

    try {
        // SAVING to a USERs collection
        new User({                  
                name,
                email,
                password: await bcrypt.hash(password, 10),   // hashing password, salt 10
                token                               // TODO: hash it
            }).save().then(async(newUser) => {
                // saving is OK
                postman.sendATokenLetter(name, email, token, tokenLink)     // #1 Sending a token-letter
                req.session.userId = newUser.email                          // #2 Saving for short-cut in session object to notify software that we have logged in user
                // test lines to speedup DB operations, for findById instead of find({ email })
                req.session.email = newUser.email
                req.session._id = newUser._id

                return res.status(200).redirect('/user/home?status=info&e=verTokenSent')    // #3 redirects to HOME with token sent notification
            })
        }
    catch(e) {
        return res.status(500).send("Server error, try later please...", e.message)
    }
})


// @ LOGOUT routes
// using this one to log user out from server side
userRouter.get('/logout', redirectToLogin, (req, res) => {
    // deleting session 
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/user/home')
        }
    })
    res.clearCookie(SESS_NAME)
    res.redirect('/user')
})
// using this one to log user out from client side
userRouter.post('/logout', redirectToLogin, (req, res) => {
    // deleting session 
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/user/home')
        }
    })
    res.clearCookie(SESS_NAME)
    res.redirect('/user')
})



// *REQUESTS for applicants
// requests of forms for filling-in

userRouter.get('/form1', redirectToLogin, async(req, res) => {
    try {
        const user = await User.findById(req.session._id).select('dataCollection')
        if (!user) { return res.status(404).send(`Cannot find a user ${req.session._id}`) }

        if (user.dataCollection) {      // check if exists already
            res.redirect('/user/print-form/1')     // exist, redirect to print
        } else {
            res.render(path.join(__dirname+'/applicants/form1.ejs'))    // doesn't exist, fill-in
        }
    } catch(e) {
        return res.status(404).send(`Issue: ${e}`)
    }
})
userRouter.get('/form2', redirectToLogin, async(req, res) => {
    try {
        const user = await User.findById(req.session._id).select('dataCollection application').populate('dataCollection')
        if (!user) { return res.status(404).send(`Cannot find a user ${req.session._id}`) }

        if (user.application) {      // check if exists already
            res.redirect('/user/print-form/2')     // exist, redirect to print
        } else {    // doesn't exist, fill-in
            if (user.dataCollection) {  // form #2 can be filled in only if dataCollection is finished
                res.render(path.join(__dirname+'/applicants/form2.ejs'), { form1: user.dataCollection })
            } else {
                res.redirect('/user/home?status=issue&e=form1Read')
            }
        }
    } catch(e) {
        return res.status(404).send(`Issue: ${e}`)
    }
})
userRouter.get('/form3', redirectToLogin, async(req, res) => {
    try {
        const user = await User.findById(req.session._id).select('dataCollection application agreement').populate('dataCollection')
        if (!user) { return res.status(404).send(`Cannot find a user ${req.session._id}`) }

        if (user.agreement) {      // check if exists already
            res.redirect('/user/print-form/3')     // exist, redirect to print
        } else {    // doesn't exist, fill-in
            if (user.dataCollection && user.application) {  // form #3 can be filled in only if dataCollection and application are finished
                res.render(path.join(__dirname+'/applicants/form3.ejs'), { form1: user.dataCollection })
            } else {    // applicant is trying to skip, define what exactly
                if (user.dataCollection) {
                    res.redirect('/user/home?status=issue&e=form2Read')
                } else {
                    res.redirect('/user/home?status=issue&e=form1Read')
                }
            }
        }
    } catch(e) {
        return res.status(404).send(`Issue: ${e}`)
    }
})


// @ SAVING filled-in forms

userRouter.post('/form1', redirectToLogin, async(req, res) => {
    // checking if exists
    try {
        const user = await User.findById(req.session._id).select('dataCollection')
        if (user.dataCollection) {
            return res.redirect('/user/home?status=issue&e=formAlreadyExists')
        }
    } catch(e) {
        return res.status(404).send(`Issue: ${e}`)
    }

    const form1Object = getForm1Object(req.body, req.session.userId)
    if (form1Object) {
        try {
            new dataCollectionForm(form1Object)
            .save()
            .then(async(newForm) => {
                await User.findOneAndUpdate({ email: req.session.userId }, { dataCollection: newForm._id })        // saving backlink in User model
                res.redirect('/user/home?status=ok&e=okForm1')
            })
        } catch(e) {
            console.log(e)
            res.redirect('/user/home?status=issue&e=savingIssue')
        }
    } else {
        res.redirect('/user/home?status=issue&e=dataIssue')
    }
})


userRouter.post('/form2', redirectToLogin, async(req, res) => {
    // checking if exists
    try {
        const user = await User.findById(req.session._id).select('application')
        if (user.application) {
            return res.redirect('/user/home?status=issue&e=formAlreadyExists')
        }
    } catch(e) {
        return res.status(404).send(`Issue: ${e}`)
    }

    const form2Object = getForm2Object(req.body, req.session.userId)
    if (form2Object) {
        try {
            new applicationForm(form2Object)
            .save()
            .then(async(newForm) => {
                await User.findOneAndUpdate({ email: req.session.userId }, { application: newForm._id })        // saving backlink in User model
                res.redirect('/user/home?status=ok&e=okForm2')
            })
        } catch(e) {
            console.log(e)
            res.redirect('/user/home?status=issue&e=savingIssue')
        }
    } else {
        res.redirect('/user/home?status=issue&e=dataIssue')
    }
})


userRouter.post('/form3', redirectToLogin, async(req, res) => {
    // checking if exists
    try {
        const user = await User.findById(req.session._id).select('agreement')
        if (user.agreement) {
            return res.redirect('/user/home?status=issue&e=formAlreadyExists')
        }
    } catch(e) {
        return res.status(404).send(`Issue: ${e}`)
    }

    const form3Object = getForm3Object(req.body, req.session.userId)
    if (form3Object) {
        try {
            new agreementForm(form3Object)
            .save()
            .then(async(newForm) => {
                await User.findOneAndUpdate({ email: req.session.userId }, { agreement: newForm._id })        // saving backlink in User model
                res.redirect('/user/home?status=ok&e=okForm3')
            })
        } catch(e) {
            console.log(e)
            res.redirect('/user/home?status=issue&e=savingIssue')
        }
    } else {
        res.redirect('/user/home?status=issue&e=dataIssue')
    }
})



// @PASSWORDs routes

userRouter.post('/password', redirectToLogin, async (req, res) => {
    // user is authorized, otherwise they will be redirected to LOGIN with middleware
    const { currentPassword, newPassword } = req.body
    const email = req.session.userId

    if(!email) { return  res.status(400).redirect('/user?status=issue&e=sessionTimeout')}
    if(!currentPassword) { return  res.status(400).redirect('/user/home?status=issue&e=blankCurrentPassw')}
    if(!newPassword) { return  res.status(400).redirect('/user/home?status=issue&e=blankNewPassword')}
    if(newPassword.length < 5) { return  res.status(400).redirect('/user/home?status=issue&e=newPasswLen')}
    if(currentPassword === newPassword) { return  res.status(400).redirect('/user/home?status=issue&e=equalCurrentNew')}

    // checking if current password passed id valid
    const user = await User.findOne({ email })
    if (!user) { return res.status(400).redirect('/user?status=issue&e=sessionTimeout')}

    try {
        if (await bcrypt.compare(currentPassword, user.password)) {
            const user = await User.findOneAndUpdate({ email }, { password: await bcrypt.hash(newPassword, 10) })
            postman.sendNewPasswordLetter(user.name, email, newPassword, 'change')
            // req.session.userId = email           DO I need this here?
            return res.redirect('/user/home?status=info&e=passwChanged')   //  successfuly updated
        }
        return res.status(400).redirect('/user/home?status=issue&e=wrongCurrentPassw')
    } catch(e) { res.status(500).send("Server error, try later please...") }
 
})


userRouter.post('/passwordreset', redirectToHome, body("email")
    .isLength({ min: 1 }).trim().withMessage("Email must be specified")
    .isEmail().withMessage("Email must be a valid email address")
    .custom( (email) => {
        return User.findOne({ email }).then((user) => {
            if (!user) {
                return Promise.reject(`There is no user with ${email} in our database`)
            }
        })
    }), async(req, res) => {
    
    // user has to provide us with personal login-email
    const errors = validationResult(req);       // is email valid and is it a login? via 'express-validator'
    if (!errors.isEmpty()) {
        return res.render(path.join(__dirname+'/login.ejs'), {
            error: false,
            info: false,
            isThereErrors: true,
            errors: errors.array()
        })
    }

    // Request is ok, can change a user
    const { email } = req.body

    // Reseting Password
    const newPassword = postman.generateNewPassword()
    try {
        const user = await User.findOneAndUpdate({ email }, { password: await bcrypt.hash(newPassword, 10) })
        postman.sendNewPasswordLetter(user.name, email, newPassword, 'reset')
        res.status(200).redirect('/user?status=info&e=passwEmailed')
    } catch(e) {
        console.log(e)
        res.status(500).redirect('/user?status=issue&e=savingIssue')
    }
})


// WORKING with TOKENS
userRouter.post('/sendToken', redirectToLogin, async (req, res) => {
    const { name, email } = req.body
    if (email) {

        const token = postman.generateAToken()

        // creating token link depends on is in production
        const tokenLink = IN_PROD ?
        `https://${req.headers.host}/user/token/${token}?email=${email}` :     // should be HTTPS for Production
        `http://${req.headers.host}/user/token/${token}?email=${email}`        // should be HTTP for Dev

        try {
            if ( await User.findOneAndUpdate({ email }, { token }) ) {      // TODO: has token here
                postman.sendATokenLetter(name, email, token, tokenLink)
                return res.status(200).redirect('/user/home?status=info&e=verTokenSent')
            }
            return res.status(400).redirect('/user/home?status=issue&e=wrongCurrentPassw')
        } catch(e) { return res.status(500).send("Server error, try later please...") }
    }
    res.status(400).redirect('/user/home?status=issue&e=wrongCurrentPassw')
})


// for email verification we use 2 routes: GET and POST. Some browsers and mobile browsers do not allow post requests from emails
userRouter.get('/token/:token', async (req, res) => { 
    let { email, token } = req.query

    if (!email) {
        email = req.session.userId
    }
    if (!token) {
        token = req.params.token
    }
    
    if (email && token) {
        try {
            if ( await User.findOneAndUpdate({ email, token }, { token: 'verified' }) ) {      // successfuly VERIFIED email!
                
                return res.status(200).send('Your email was successfuly verified. Now you can close this page and get back to your profile')
            }
            return res.status(400).send('Wrong credentials have been sent. Try again please')
        } catch(e) { return res.status(500).send("Server error, try later please...") }
    }

    if (!token) {
        return res.status(400).send(`We got an invalid TOKEN, when verified your email. You sent a TOKEN=${token}`)
    }
    if (!email) {
        return res.status(400).send('Looks like you are logged out already. Please login on the same device you are currently using for email verification with the credentials you already have and click verification link one more time. Sorry for that, we just have to know if that were you.')
    }
})


userRouter.post('/token/:token', async(req, res) => { 
    const { email, token } = req.body
    
    if (email && token) {
        try {
            if ( await User.findOneAndUpdate({ email, token }, { token: 'verified' }) ) {      // successfuly VERIFIED email!
                
                return res.status(200).send('Your email was successfuly verified. Now you can close this page and get back to your profile')
            }
            return res.status(400).send('Wrong credentials have been sent. Try again please')
        } catch(e) { return res.status(500).send("Server error, try later please...") }
    }
    res.status(500).send("Sorry, email verification was unsuccessful. Try again later")
})



// copy of admin's method, prints a form for student
userRouter.get('/print-form/:id', redirectToLogin, async(req, res) => {
    
    const formID = req.params.id

    if (!formID) { return res.status(400).send(`Wrong form # request: ${formID}`) }

    try {

        const user = await User.findOne({ email: req.session.userId })
        .populate('dataCollection')
        .populate('application')
        .populate('agreement')

        if (user === null) { return res.status(400).send(`Wrong request: ${formID}`) }

        const signer = {
            name: "CDL School Signer",
            title: "Manager",
            last: "Siger",
            first: "Manager"
        }

        if (formID === '1') {
            return res.render(path.join(global.__basedir+'/admin/views/_view-form1.ejs'), { user, signer })
        } else {
            if (formID === '2') {
                return res.render(path.join(global.__basedir+'/admin/views/_view-form2.ejs'), { user, signer })
            } else {
                if (formID === '3') {
                    return res.render(path.join(global.__basedir+'/admin/views/_view-form3.ejs'), { user, signer })
                } else {
                    return res.status(400).send(`Wrong request: ${formID}`)
                }
            }
        }
    } catch(e) {
        res.status(500).send(`Something is happened... ${e.message}. Try later please.`)
    }
})



// printable scoring view
// prints a scoring for student without comments
// uses QUERY ?scoring={scoring._id}&scoringform={_id of a particular scor.form inside scoring arrays}
userRouter.get('/scoring-print', redirectToLogin, async(req, res) => {
    const { scoring, scoringform } = req.query
    if (!scoring || !scoringform) { return res.status(400).send(`Bad request. Please specify what scoring to find`) }
    try {

        const scorings = await StudentScoring.findById(scoring)
        if (!scorings) { return res.status(404).send(`Student scoring with id ${scoring} is not found`) }

        const scoringGroups = [scorings.scoringsInCab, scorings.scoringsOutCab, scorings.scoringsBacking, scorings.scoringsCity]

        let foundScoring = undefined

        scoringGroups.map(scoringGroup => {
            if (scoringGroup) {
                scoringGroup.map(scor => {
                    if (!foundScoring && scor._id.toString() === scoringform) {
                        foundScoring = scor
                    }
                })
            }
        })
        
        if (foundScoring) {
            return res.render(path.join(global.__basedir+'/admin/instructors/scoring-printable-view.ejs'), { 
                scoring: JSON.parse(foundScoring.details),
                scoringCertificate: foundScoring.certificate,
                allowComments: false,    //  comments can be hidden if needed
                scoringComment: "",
                backlink: undefined // will just go back with browser history
            })
        }

        return res.status(404).send(`We've found a scorings group, but didn't find a scoring with id ${scoringform} inside of it`)

    } catch(e) {
        return res.status(404).send(`Error: ${e.message}`)
    }
})


// schedule comtroller
const { getCalendarDataForStudent } = require('../admin/schedule/schedule')

// schedule more...
// @GET /user/schedule
// ?appType= backing1/backing2/backing3/city
userRouter.get('/schedule', redirectToLogin, async(req, res) => {
    const appType = req.query.appType || "backing1"
    try {
        const user = await User.findById(req.session._id)
        .select("_id").populate([
            { path: "agreement", select: "transmission" },
            { path: "student", select: "status location graduate schedule" }
        ])

        if (!user) { return res.status(400).send('User not found') }
        if (!user.student) { return res.status(400).send('Student not found') }
        if (user.student.status != "unblock") { return res.status(404).send('Student is blocked') }
        if (user.student.graduate != "no") { return res.status(404).send('Student graduated') }

        const schTransmission = user.agreement.transmission === "Automatic Transmission" ? "AUTO" : "MANUAL"
        const dataObj = await getCalendarDataForStudent(appType, schTransmission, user.student.location, user.student._id, 14)        

        return res.render(path.join(__dirname+'/student-schedule.ejs'), dataObj)
    } catch(e) {
        return res.status(404).send(`Error: ${e.message}`)
    }
})



// without this BODY is empty when just fetching from client-side
userRouter.use(express.json({
    type: ['application/json', 'text/plain']
}))

userRouter.put('/schedule', redirectToLogin, async(req, res) => {
    const { action } = req.body
    try {
        // delete scheduled action
        if (action === "DELETE SCHEDULED") {
            const { scheduleId, appointmentId } = req.body
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
        if (action === "ADD APPOINTMENT") {
            const { appDate, appType, appTransmission, appLocation } = req.body

            if (appDate && appType && appTransmission && appLocation) {
                const user = await User.findById(req.session._id).select('student')
                if (!user) { return res.status(404).json({ issue: "User not found" }) }

                const student = await Student.findById(user.student).select("schedule").populate("schedule")
                if (!student) { return res.status(404).json({ issue: "Student not found" }) }

                if (student.schedule) {
                    // check if scheduled appointment exist, if not - add
                    await Schedule.findByIdAndUpdate(
                        student.schedule,
                        { $push: { 
                            appointments: {
                                appDate,
                                appType,
                                appTransmission,
                                appLocation,
                            }
                        }},
                    )
                } else {
                    const schedule = await new Schedule({
                        student: student._id,
                        appointments: [{
                            appDate,
                            appType,
                            appTransmission,
                            appLocation,
                        }]
                    }).save()
                    student.schedule = schedule._id
                    await student.save()
                }
                return res.status(200).end()
            } else { return res.status(400).json({ issue: "Not enough data to save" }) }
        }

    } catch(e) {
        return res.status(500).json({ issue: e.message })
    }

    return res.status(400).json({ issue: "Action not found" })
})



// Inquire Form
userRouter.post('/inquire', async(req, res) => {
    const { inquireFirstName, inquireLastName, inquirePhone, inquireEmail, inquireZip, inquireCourse, inquireLocation } = req.body
    if (!inquireFirstName || !inquireLastName || !inquirePhone || !inquireEmail || !inquireZip || !inquireCourse || !inquireLocation ) { return res.send('email send issue') }

    let txt = `New INQUIRY received.\n`
    txt += `Sender: ${inquireFirstName} ${inquireLastName}, zip: ${inquireZip}\n`
    txt += `about course: ${inquireCourse}\n`
    txt += `to location: ${inquireLocation}\n`
    txt += `Please get in touch with person. Phone: ${inquirePhone}, email: ${inquireEmail}`

    const letter = {
        email: inquireEmail,
        body: txt,            
        title: "NEW INQUIRY"
    }

    try {
        postman.sendALetter(letter)
        return res.status(200).redirect('/')
    } catch(e) {
        return res.status(500).send(`Email sending issue: ${e.message}`)
    }
})



// @ user/tuituion routes
userRouter.use('/tuition', redirectToLogin, require('./tuition/tuitionRouter'))



module.exports = userRouter