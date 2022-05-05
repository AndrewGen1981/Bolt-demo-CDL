const express = require('express')
const app = express()

const path = require('path')

let HTTPDOMAIN

if (process.env.NODE_ENV === 'production') {
    // redirects HTTP to HTTPS
    app.enable('trust proxy')
    app.use((req, res, next) => {
        HTTPDOMAIN = `https://${req.headers.host}${req.url}`
        req.secure ? next() : res.redirect(HTTPDOMAIN)
    })
} else {
    require('dotenv').config() // set .ENV
    HTTPDOMAIN = 'http://localhost'
}

// saving ROOT DIR into globals to use in other routes
global.__basedir = __dirname


// MONGO db via MONGOOSE
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI_USERS)


// set the view engine to ejs
app.set('view engine', 'ejs')

app.use(express.static(__dirname+'/'))
// uses URLENCODED for body parsing
app.use(express.urlencoded({ extended: true }))

// main redirect
app.get('/', (req, res) => {
    res.redirect('/user')
})
// company catalog
app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname+'/static/catalog/Toro Catalog WA 2021 Dec17.pdf'))
})

// USERS (Applicants and Students) ROUTES
app.use('/user', require('./users/userRouter'))

// ADMINS ROUTES
app.use('/admin', require('./admin/admin'))


const PORT = process.env.PORT || 5000
const server = app.listen(PORT, console.log(`${HTTPDOMAIN}:${PORT}`))

// @SOCKET.IO setup for HEROKU: server passed as a parametr to socket constructor to assing a PORT to socket
// PORT has to be different from one APP is listening on
const io = require('socket.io')(server, {
    cors: {
        origin: [`${HTTPDOMAIN}:${PORT}`]       // CORS policy - allowing data exchange between diff. ports
    }
})

// Has to bring in a MODELS here, just to create a WATCHER with SOCKET inside
const { User, Student, Schedule } = require('./users/userModel')
const { dataCollectionForm } = require('./users/applicants/form1Model')
const { applicationForm } = require('./users/applicants/form2Model')
const { agreementForm } = require('./users/applicants/form3Model')
const { Tuition } = require('./users/tuition/tuitionModel')
const { StudentScoring } = require('./admin/instructors/scoringModel')
const { ScheduleBlocked } = require('./admin/schedule/schTemplateModel')

// turning on USER changes watch with mongoose
User.watch().on('change', data => {
    io.emit('users-collection-update', data)
})
Student.watch().on('change', data => {
    io.emit('students-update', data)
})
dataCollectionForm.watch().on('change', data => {
    io.emit('dataCollections-update', data)
})
applicationForm.watch().on('change', data => {
    io.emit('applications-update', data)
})
agreementForm.watch().on('change', data => {
    io.emit('agreements-update', data)
})
Tuition.watch().on('change', data => {
    io.emit('tuition-update', data)
})
StudentScoring.watch().on('change', data => {
    io.emit('scoring-update', data)
})
Schedule.watch().on('change', data => {
    io.emit('schedule-update', data)
})
ScheduleBlocked.watch().on('change', data => {
    io.emit('schedule-blocked-update', data)
})
