// -------------  FMCSA  -------------

const express = require("express")
const fmcsaRouter = express.Router()
const path = require("path")

const crypto = require("crypto-js")
const fetch = require('node-fetch')
const jwt = require("jsonwebtoken")

// MODELS for mongoose
const { Student } = require("../userModel")
const { FMCSAModel } = require("./fmcsaModel")
const admin = require("../../admin/config")


// TOOLS
    function formatDate(textDate) {
        return textDate ? new Date(textDate).toLocaleDateString('en-CA', { timeZone: admin.SCHOOL_DATA.tZONE }) : '-'
    }

    const usStates = {"ALASKA":"AK", "ALABAMA":"AL", "ARKANSAS":"AR", "AMERICANSAMOA":"AS", "ARIZONA":"AZ", "CALIFORNIA":"CA", "COLORADO":"CO", "CONNECTICUT":"CT", "DISTRICTOFCOLUMBIA":"DC", "DELAWARE":"DE", "FLORIDA":"FL", "GEORGIA":"GA", "GUAM":"GU", "HAWAII":"HI", "IOWA":"IA", "IDAHO":"ID", "ILLINOIS":"IL", "INDIANA":"IN", "KANSAS":"KS", "KENTUCKY":"KY", "LOUISIANA":"LA", "MASSACHUSETTS":"MA", "MARYLAND":"MD", "MAINE":"ME", "MICHIGAN":"MI", "MINNESOTA":"MN", "MISSOURI":"MO", "MISSISSIPPI":"MS", "MONTANA":"MT", "NORTHCAROLINA":"NC", "NORTHDAKOTA":"ND", "NEBRASKA":"NE", "NEWHAMPSHIRE":"NH", "NEWJERSEY":"NJ", "NEWMEXICO":"NM", "NEVADA":"NV", "NEWYORK":"NY", "OHIO":"OH", "OKLAHOMA":"OK", "OREGON":"OR", "PENNSYLVANIA":"PA", "PUERTORICO":"PR", "RHODEISLAND":"RI", "SOUTHCAROLINA":"SC", "SOUTHDAKOTA":"SD", "TENNESSEE":"TN", "TEXAS":"TX", "UTAH":"UT", "VIRGINIA":"VA", "VIRGINISLANDS":"VI", "VERMONT":"VT", "WASHINGTON":"WA", "WISCONSIN":"WI", "WESTVIRGINIA":"WV", "WYOMING":"WY"}

    function getState(key) {
        return usStates[key.toUpperCase().replace(/ /g, "")] || key
    }
// end of tools


// Middleware, checking if credentials exists
async function checkFMCSACredentials (req, res, next) {
    try {
        const FMCSA = await FMCSAModel.find()
        const allLocation = admin.getAllLocations()

        if (FMCSA) {
            if (FMCSA.length) {
                const lastFMCSARecord = FMCSA[FMCSA.length - 1]
                if (lastFMCSARecord.pemCertificate
                    && lastFMCSARecord.idTPR
                    && lastFMCSARecord.idLocations) {
                    // verifing saved FMCSA record
                    if (allLocation.length === lastFMCSARecord.idLocations.length) {
                        const titles = lastFMCSARecord.idLocations.map(loc => loc.title)
                        // check arrays idenity with reduce
                        if (allLocation.reduce((a, b) => a && titles.includes(b), true)) {
                            // save FMCSA object in locals for GET/PUT /fmcsa
                            res.locals.FMCSA = {
                                pemCertificate: crypto.AES.decrypt(lastFMCSARecord.pemCertificate, process.env.MONGO_URI_USERS).toString(crypto.enc.Utf8),
                                idTPR: crypto.AES.decrypt(lastFMCSARecord.idTPR, process.env.MONGO_URI_USERS).toString(crypto.enc.Utf8),
                                idLocations: lastFMCSARecord.idLocations,
                                updatedAt: lastFMCSARecord.updatedAt,
                            }
                            return next()
                        }
                    }
                }
            }
        }
    
        if(req.method === "PUT") {
            return res.status(403).json({ issue: 'You have to enter your FMCSA credentials first. Launch a "FMCSA Report" from the "Student List"' })
        }
        // defaul is for GET method
        return res.render(path.join(__dirname + "/fmcsa-getCredentials.ejs"), { 
            credentials: false,
            locations: allLocation
        })
    } catch(e) {
        if(req.method === "PUT") {
            res.status(500).json({ issue: `Reading FMCSA credentials issue: ${ e.message }` })
        } else {
            res.status(500).send(`Reading FMCSA credentials issue: ${ e.message }`)
        }
    }
}


// GET
// RENEW FMCSA credentials - admin/student/fmcsa/credentials
fmcsaRouter.get("/credentials", checkFMCSACredentials, async(req, res) => {
    return res.render(path.join(__dirname + "/fmcsa-getCredentials.ejs"), { 
        credentials: res.locals.FMCSA != undefined,
        locations: admin.getAllLocations()
    })
})


// POST
// ENTER new FMCSA Credentials
fmcsaRouter.post("/credentials", async(req, res) => {
    const { pemCertificate, idTPR, idLocations, idTitles } = req.body
    try {
        if (pemCertificate && idTPR && idLocations && idTitles) {
            // Encrypt
            const pemCertificateHashed = crypto.AES.encrypt(pemCertificate, process.env.MONGO_URI_USERS).toString()
            const idTPRHashed = crypto.AES.encrypt(idTPR, process.env.MONGO_URI_USERS).toString()
            // converting to arrays
            const ids = Array.from(idLocations)     // can be just 1
            const titles = Array.from(idTitles)     // can be just 1
            // deleting all prev. and create new one
            await FMCSAModel.deleteMany({})
            await new FMCSAModel({
                pemCertificate: pemCertificateHashed,
                idTPR: idTPRHashed,
                idLocations: ids.map((id, index) => {
                    return {
                        title: titles[index],
                        id
                    }
                })
            }).save()
        }
    } catch(e) {
        res.status(500).send(`Saving FMCSA credentials issue: ${e.message}`)
    }
    return res.redirect("/admin/student/fmcsa")
})


// @GET admin/student/fmcsa
// covers 3 fmcsa's steps
fmcsaRouter.get("/", checkFMCSACredentials, async(req, res) => {
    try {
        const minReq = {
            theoryRate: 0.96,
            rangeTTT: 102,
            cityTTT: 102 + 18,
        }

        const students = (await Student
        .find({ graduate: "no" })
        .select("created location TTT fmcsaSteps")
        .populate({
            path: "user", select: "_id",
            populate: [
                { path: "dataCollection", select: "firstName lastName middleName DOB -_id" },
                { path: "application", select: "vehicle-license vehicle-license-state -_id" },
                { path: "agreement", select: "class transmission -_id" }
            ]
        })
        .populate({
            path: "tuition",
            select: "avLessonsRate -_id"
        }))
        .filter(student => {
            if(student.tuition.avLessonsRate >= minReq.theoryRate) { return student }
        })

        students.sort((a, b) => a.created - b.created)
        return res.status(200).render(path.join(__dirname + "/fmcsa-list.ejs"), { students, minReq })

    } catch (e) {
        res.status(500).send(`Server issue: ${e.message}`)
    }
})


// @PUT admin/student/fmcsa
// updates from cliens side
fmcsaRouter.put("/", checkFMCSACredentials, async(req, res) => {
    const { id, newSteps } = req.body
    const adminAdmin = await admin.findAdminById(req.session.adminData.id)
    try {
        const newFMCSASteps = newSteps.split(",")

        const student = await Student.findById(id)
        .select("location fmcsaSteps")
        .populate({
            path: "user", select: "_id",
            populate: [
                { path: "dataCollection", select: "firstName lastName DOB -_id" },
                { path: "application", select: "vehicle-license vehicle-license-state -_id" },
                { path: "agreement", select: "class transmission -_id" }
            ]
        })
        .populate({
            path: "tuition",
            select: "avLessonsRate -_id"
        })

        // FMCSA
        const FMCSA = res.locals.FMCSA      // passed from checkFMCSACredentials
        if (FMCSA) {
            const payload = {
                "nbf": new Date().getTime(),
                // "exp": end,          //  just does not see this, wants expiration to be in options
                "iss": FMCSA.idTPR,
                "sub": "BoltCDL"
            }
            const privateKEY = FMCSA.pemCertificate
            const options = {
                expiresIn:  "1m",
                algorithm:  "RS256"
            }
            // generating jwtoken with PEM
            const jwtToken = jwt.sign(payload, privateKEY, options)

            // verifing data
            if (!student.user.application['vehicle-license']) {
                return res.status(403).json({ issue: `Driver license if undefined` })
            }
            // drv lic.issued state has to be changed
            const state = getState(student.user.application['vehicle-license-state'])
            if (state.length > 2) {
                return res.status(403).json({ issue: `Cannot identify driver license issuer - ${ state }` })
            }
            if (!student.user.dataCollection.firstName || !student.user.dataCollection.lastName) {
                return res.status(403).json({ issue: `Cannot identify student's first or last name` })
            }
            
            const program = admin.SCHOOL_DATA.PROGRAMS.filter(pro => student.user.agreement.class === pro.title)
            if (!program || !program[0]) {
                return res.status(404).json({ issue: `Cannot identify tuition program. Not among School's programs - ${ student.user.agreement.class }` })
            }

            const classEndorsementCode = program[0].classEndorsementCode
            if (!classEndorsementCode) {
                return res.status(403).json({ issue: `Cannot identify "classEndorsementCode" for ${ student.user.agreement.class }` })
            }

            const applicationType = program[0].applicationType
            if (!applicationType) {
                return res.status(403).json({ issue: `Cannot identify "applicationType" for ${ student.user.agreement.class }` })
            }

            const providerLocation = FMCSA.idLocations.filter(idLocation => idLocation.title === student.location)
            if (!providerLocation[0].id) {
                return res.status(403).json({ issue: `Cannot identify "providerLocationId" for ${ student.location }` })
            }

            const studentObject = {
                "Number": student.user.application['vehicle-license'],
                "State": `US-${ state }`,
                "FirstName": student.user.dataCollection.firstName,
                "LastName": student.user.dataCollection.lastName,
                "DateOfBirth": formatDate(student.user.dataCollection.DOB),
                "ClassEndorsementCode": classEndorsementCode,
                "ApplicationType": applicationType,
                "ProviderLocationId": providerLocation[0].id,
                "TrainingElements": []
            }

            newFMCSASteps.forEach((newFMCSAStep, index) => {
                // init step, if not inited yet
                // create a spot for this step; false as defaul
                if (!student.fmcsaSteps[index]) {
                    student.fmcsaSteps.push({
                        check: false,
                        dateDone: new Date(),
                        adminDone: "AUTO",
                    })
                } 

                // when newFMCSAStep = true, then step has to be saved
                // but only if it where not saved before
                if (newFMCSAStep === "true") {
                    if (!student.fmcsaSteps[index].check) {
                        if (index === 0) {
                            // Theory
                            studentObject.TrainingElements.push({
                                "TrainingType": "Theory",
                                "CompletionDate": formatDate(new Date()),
                                "TrainingMethod": "Online",
                                "Score": Math.round(student.tuition.avLessonsRate * 100)
                            })
                        }
                        if (index === 1) {
                            // Range
                            studentObject.TrainingElements.push({
                                "TrainingType": "Range",
                                "CompletionDate": formatDate(new Date()),
                                "Hours": 102,
                                "InternalId": student.location
                            })
                        }
                        if (index === 2) {
                            // PublicRoad
                            studentObject.TrainingElements.push({
                                "TrainingType": "PublicRoad",
                                "CompletionDate": formatDate(new Date()),
                                "Hours": 18,
                                "InternalId": student.location
                            })
                        }
                        student.fmcsaSteps[index].check = true
                        student.fmcsaSteps[index].dateDone = new Date()
                        student.fmcsaSteps[index].adminDone = adminAdmin.name
                    }
                }
            })

            // if there if something to update
            if(studentObject.TrainingElements.length) {
                const response = await fetch("https://tpr.fmcsa.dot.gov/api/Training/Add", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${ jwtToken }`
                    },
                    body: JSON.stringify(studentObject)
                })
                // reading details or issue
                const text = await response.text()
                if (response.status === 201) {
                    await student.save()
                    return res.status(200).json({ text })
                } else {
                    res.status(response.status).json({ issue: `FMCSA response: ${ text }` })
                }
            }
        }
        
    } catch(e) {
        res.status(500).json({ issue: `Server issue: ${e.message}` })
    }
})


module.exports = fmcsaRouter