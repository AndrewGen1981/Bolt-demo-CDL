// @TUITION Center

// Handles all user/tuition routes
// used in userRouter.JS with DEFAUL authentication

const express = require('express')
const tuitionRouter = express.Router()
const path = require('path')

// MODELS for mongoose
const { User, Student } = require('../userModel')
const { Tuition } = require('./tuitionModel')

const fs = require('fs')

// YouTube Lessons
const listOfLessons = [
    // -10
    "OW58-9AaxcU", "zO12lt1JOsw",
    "FxUw2p1cpEA", "QReTAmyhABU",
    "2zjXAsviNVQ", "ibBc6D2MCts",
    "I02mnwJu8mI", "SXl8uqr0cLw",
    "8gvLVTnSt60", "CzR1v_5nRX4",

    // 11-20
    "1sv1mR2UeIU", "3_KP-GPyDcU",
    "aCdWWoNdBX0", "bCUP1Z1pjpQ",
    "8fuJ0FBdq54", "f8EA9uk7CPA",
    "PLYqcKEFJEw", "SoLWvPT0HLQ",
    "k9uJrEoRZlw", "_pX_GZcMfis",

    // 21-30
    "hXJ62EgUqKI", "KM-Up3EOJUQ",
    "PS3laxM-IaU", "_FlT36Uiux8",
    "W2lKfbsk_ng", "3OHQvK_E1Sg",
    "J64XZolAgZw", "P8kCJ5-VkPg",
    "9gNvH_VYygA", "tfTUgM8eaqs",

    // 31-35
    "jcK2c3lxdU4", "hOSsBNAkIgM",
    "mNkFdvY8fVM", "5sB1_fe-IVo",
    "xHRLptSZZss"
]

const listOfTitles = [
    "Orientation", "Control Systems/Dashboard",
    "Pre- and Post-Trip Inspections", "Basic Control",
    "Shifting/Operating Transmissions", "Backing And Docking",
    "Coupling and Uncoupling", "Visual Search",
    "Communication", "Distracted Driving",
    "Speed Management", "Space Management",
    "Night Operations", "Extreme Driving Conditions",
    "Hazard Perception", "Skid Control/Recovery, Jackknifing, and Other Emergencies",
    "Railroad-Highway Grade Crossings", "Identification and Diagnosis of Malfunctions",
    "Roadside Inspections", "Maintenance",
    "Handling and Documenting Cargo", "Environmental Compliance Issues",
    "Hours of Service Requirements", "Fatigue and Wellness Awareness",
    "Post-Crash Procedures", "External Communications",
    "Whistleblower/Coercion", "Trip Planning",
    "Drugs/Alcohol", "Medical Requirements",
    "Human Trafficking", "CSA",
    "Special Rigs", "Crossing the Canadian Border",
    "Basic Business Practices",
]


// user/tuition
tuitionRouter.get('/', async(req, res) => {
    const user = await User.findById(req.session._id)
    if (user) {
        if (user.student) {
            const student = await Student.findById(user.student)
            .select("tuition fullName")
            .populate([
                { path: "tuition" },
                { path: "user", select: "balance"}
            ])
            if (student.tuition) {
                if (student.tuition.isAllowed) {
                    return res.render(path.join(__dirname + '/tuition-center.ejs'), {
                        listOfLessons, listOfTitles,
                        tuition: student.tuition,
                        fullName: student.fullName,
                        balance: student.user.balance
                    })
                }
            }
            // if !student.tuition OR !student.tuition.isAllowed
            return res.status(404).send('Tuition Center is not available: lessons were not scheduled for you by our manager')
        }
        return res.status(404).send('You are not a Student yet. Tuition Center is not available')
    } else {
        res.status(404).send('Unknown user. Try to login again')
    }
})


tuitionRouter.post('/', async(req, res) => {
    const user = await User.findById(req.session._id)
    .select("balance")
    .populate({ path: "student", select: "fullName" })

    if (!user) { return res.status(404).send(`No user found with ${req.session.userId}`) }

    const { video, videoProgress, testProgress } = req.body    // video id is being passed in body
    const testFileName = listOfLessons.indexOf(video) + 1   // try to find id in video IDs array
    if (testFileName) {
        const testFilePath = testFileName < 10 ? `0${testFileName}.json` : `${testFileName}.json`   //  adding '0' to filename ans extention
        fs.readFile(path.join(__dirname+`/tuition-tests/${testFilePath}`), (err, data) => {     // adding folder to a path
            if (err) {
                res.status(500).send(`Cannot open test file ${testFilePath}`)       //  show error msg if needed
            } else {
                const videoData = JSON.parse(data)
                // modifying videoData object
                videoData.questions.forEach(que => {    // shufling answers options inside question
                    if (!que.fixedOrder) {      // if not fixed order is required
                        que.answers = que.answers.sort(() => Math.random() - 0.5);   // shuffeling answers
                    }
                })
                videoData.videoProgress = parseFloat(videoProgress) || 0
                videoData.testProgress = parseFloat(testProgress) || 0

                res.render(path.join(__dirname + '/tuition-player.ejs'), {
                    user, videoData, video,
                    fullName: user.student.fullName,
                    balance: user.balance,
                })
            }
        })
    }
})



// without this BODY is empty when just fetching from client-side
tuitionRouter.use(express.json({
    type: ['application/json', 'text/plain']
 }))

tuitionRouter.put('/update', async(req, res) => {
    let user
    // TODO: check if 1st try - catch works
    try {
        user = await User.findById(req.session._id).select('name student').populate({
            path: 'student', select: 'tuition'
        })
    } catch(e) {
        return res.status(404).end(`Issue when searching your record: ${e.message}`)
    }

    const { userId, videoId, lesson, lessonTitle, currentRatio, currentTime, testProgress } = req.body

    if (user) {
        // extra safety step, should be equal. Check if it is needed
        if (user._id.toString() === userId) {
            if (!user.student) { return res.status(400).end(`Looks like You are not a Student ${user.name}`) }
            if ( videoId && currentRatio) {
                try {
                    if (user.student.tuition) {
                        const tuition = await Tuition.findById(user.student.tuition).select('lessons')

                        //  tuition is assigned, now check if lesson exists
                        let done = false
                        tuition.lessons.forEach(lesson => {
                            if(lesson.videoID === videoId) {
                                // updating video ratio
                                if(lesson.videoProgress < currentRatio) {
                                    lesson.videoProgress = currentRatio
                                }
                                // updating quiz result
                                if(testProgress > 0 && lesson.testProgress != testProgress) {
                                    lesson.testProgress = testProgress
                                }
                                done = true
                            }
                        })
                        // new lesson
                        if (!done) {
                            tuition.lessons.push({
                                watchDate: new Date(),
                                videoID: videoId,
                                lesson,
                                lessonTitle,
                                videoProgress: currentRatio,
                                testProgress
                            })
                            // sort lessons by module id
                            tuition.lessons.sort((a,b) => {
                                return a.lesson > b.lesson ? 1 : a.lesson < b.lesson ? -1 : 0
                            })
                        }
                        
                        // recalc average progress
                        let score = 0
                        tuition.lessons.forEach(lesson => {
                            score += lesson.videoProgress
                            score += lesson.testProgress > 0 ? 1 : 0
                        })
                        const maxScore = listOfLessons.length * 2   // for ex. 35 lessons + 35 tests = maxScore = 70
                        tuition.avLessonsRate = Math.round(score*1000 / maxScore) / 1000

                        await tuition.save()
                        return res.status(200).end()
                    }
                    return res.status(400).end(`You don't have any lessons yet. Contact your administrator`)
                } catch(e) {
                    return res.status(500).end(`Oooppps... Database issue`)
                }
            }
            return res.status(404).end(`Lesson is not defined: LESSON=${videoId} COVERED=${currentRatio}`)
        }
        return res.status(404).end(`User mismatch`)
    } else {
        return res.status(400).end("You are logged out...")
    }    
})


module.exports = tuitionRouter