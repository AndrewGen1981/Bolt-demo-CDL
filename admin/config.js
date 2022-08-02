// @ADMIN configuration file
// contains credentials & a list of authorities
const bcrypt = require("bcrypt")

const mongoose = require("mongoose")

// Use more than 1 connection, for different collections
const connAdmin = mongoose.createConnection(process.env.MONGO_URI_SESSA)                // for SESS-AMINS/ADMIN
const sessAdminConnection = mongoose.createConnection(process.env.MONGO_URI_SESSA)      // for SESS-AMINS/session
const sessUsersConnection = mongoose.createConnection(process.env.MONGO_URI_SESSU)      // for SESS-USERS/session

// app domain is used for QR generations
const appDomain = "https://bolt-demo-school.herokuapp.com/"

// @ Model for admin record in SESS-AMINS/ADMIN
const adminSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    idLower: { type: String, lowercase: true, required: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    email: { type: String, lowercase: true, required: true },
    location: { type: String, required: true },
    password: { type: String, required: true },
    authString: { type: String, required: true },
    auth: { type: Number, required: true },
}, {
    collection: "ADMINS"
})

// model for export SESS-AMINS/ADMIN
const Admin = connAdmin.model("adminSchema", adminSchema)


// @ General model for session
// SESS-AMINS/session and SESS-USERS/session
// you don't need it for Mongo session storage,
// but need for read data for analityc from there
const sessionSchema = new mongoose.Schema({
    _id: String,    // should be here, otherwise not reads "_id" when .find()
    expires: { type: Date, required: true },
    session: String,
}, {
    collection: "sessions"
})

// model for export SESS-AMINS/session and SESS-USERS/session
const SessAdmin = sessAdminConnection.model("sessionSchema", sessionSchema)
const SessUsers = sessUsersConnection.model("sessionSchema", sessionSchema)


// School Data Object
const SCHOOL_DATA = {
    TITLE: "Toro Trucking Academy",
    TITLE_SHORT: "TTA",
    PHONE_LINK: "8338676235",
    PHONE: "833-867-6235",
    // CDL school address
    ADDRESS: "1321 109th St.E",
    CITY: "Tacoma",
    STATE: "WA",
    ZIP: "98445",
    // time-zone
    tZONE: "America/Los_Angeles",
    GMT: "-08:00",
    GMTh: 8,
    // Daylight Saving Time Delta
    initDelta: function() {
        const date = new Date()
        // parse Date
        const y = date.getUTCFullYear()
        const m = date.getUTCMonth() + 1
        const ms = m < 10 ? `0${m}` : m     //  leading Zero
        const d = date.getUTCDate()
        const ds = d < 10 ? `0${d}` : d     //  leading Zero
        // using GMT trying to convert today's datetime to Z-zone and back to School's timezone
        const deltaHours = new Date(`${y}-${ms}-${ds}T00:00${this.GMT}`)
        .toLocaleTimeString('en-CA', { timeZone: `${this.tZONE}`, hour: "numeric", hour12: false })
        .replace(/\D/g, "")
        // result will be 24 for non-Daylight Saving Time or 1 for Daylight Saving Time
        const delta = parseInt(deltaHours) % 12     //  sets delta to 0 or 1
        // change GMT string relatively to delta
        this.DeltaGMT = this.GMT.replace(this.GMTh.toString(), `${this.GMTh - delta}`)
        this.DSTD = delta
    },
    // links for student profile
    LINKS: [
        {
            text: "About Us",
            href: "https://toro-trucking.herokuapp.com"
        },
        {
            text: "CDL Programs",
            href: "https://toro-trucking.herokuapp.com/cdl-courses"
        },
        {
            text: "FAQs",
            href: "https://toro-trucking.herokuapp.com/faq"
        },
        {
            text: "CLP",
            href: "https://www.nstschool.com/clp"
        },
        {
            text: "Contact Us",
            href: "https://toro-trucking.herokuapp.com/locations"
        },
    ],
    // programs
    PROGRAMS: [
        // Ordinary CDL
        {
            title: "CDL Class A",
            descr: "4 weeks * 40 hours/week = 160 total hours",
            classEndorsementCode: "A",
            applicationType: "New",
        },
        {
            title: "CDL Class B",
            descr: "2 weeks * 40 hours/week = 80 total hours",
            classEndorsementCode: "B",
            applicationType: "New",
        },
        // Upgrades
        {
            title: "Upgrade to Class A",
            descr: "2 weeks * 40 hours/week = 80 total hours",
            classEndorsementCode: "A",
            applicationType: "Upgrade",
        },
        // Endorsements
        {
            title: "Endorsements (Passengers)",
            descr: "2 weeks * 40 hours/week = 80 total hours",
            classEndorsementCode: "P",
            applicationType: "New",
        },
        {
            title: "Endorsements (School Bus)",
            descr: "2 weeks * 40 hours/week = 80 total hours",
            classEndorsementCode: "B",
            applicationType: "New",
        },
        {
            title: "Endorsements (Hazmat)",
            descr: "2 weeks * 40 hours/week = 80 total hours",
            classEndorsementCode: "H",
            applicationType: "New",
        }
    ],
    // catalog
    CATALOG: "/static/catalog/TTA_Catalog_2021.pdf",
}


// Initing Delta Time
SCHOOL_DATA.initDelta()


// returns as a string Time Delta with School specific
function getTimeDelta_with_SchoolSpecific(date) {
    // parse Date
    const y = date.getUTCFullYear()
    const m = date.getUTCMonth() + 1
    const ms = m < 10 ? `0${m}` : m     //  leading Zero
    const d = date.getUTCDate()
    const ds = d < 10 ? `0${d}` : d     //  leading Zero
    // using GMT trying to convert today's datetime to Z-zone and back to School's timezone
    const deltaHours = new Date(`${y}-${ms}-${ds}T00:00${SCHOOL_DATA.GMT}`)
    .toLocaleTimeString('en-CA', { timeZone: `${SCHOOL_DATA.tZONE}`, hour: "numeric", hour12: false })
    .replace(/\D/g, "")
    // result will be 24 for non-Daylight Saving Time or 1 for Daylight Saving Time
    const delta = parseInt(deltaHours) % 12     //  sets delta to 0 or 1
    // change GMT string relatively to delta
    return SCHOOL_DATA.GMT.replace(SCHOOL_DATA.GMTh.toString(), `${SCHOOL_DATA.GMTh - delta}`)
}


// Locations
const LOCATION = {
    All: 'All',
    Unset: 'UNSET',
    Tacoma: 'Tacoma, WA',
    Kent: 'Kent, WA',
    Troutdale: 'Troutdale, OR'
}


// LIST of Authorities. Order does matter, should match with AUTHNAMES
const AUTH = {
    viewOnly: 1,
    editor:   2,
    instructor: 3,
    admin:    4
}

const canREADset = [AUTH.viewOnly, AUTH.editor, AUTH.admin]
const canWRITEset = [AUTH.editor, AUTH.admin]
const canINSTset = [AUTH.instructor]
const canSHAREset = [AUTH.admin]

// LIST of Auth names
const AUTHNAMES = [ 'viewOnly', 'editor', 'instructor', 'admin' ]


// Variants of issues
const ISSUES = {
    wrongIDPASS: "Wrong admin's ID or PASSWORD provided"
}


function getAuthString(auth) {
    if (!isNaN(auth)) {
        return AUTHNAMES[auth - 1] || ""
    }
}

async function findAdminById(id) {
    if (!id) { return }
    try {
        const idLower = id.toLowerCase()
        const admin = await Admin.findOne({ idLower })      // admins have own id, additionaly to _id
        if (admin) {
            return {
                id: admin.id,
                name: admin.name,
                title: admin.title,
                email: admin.email,
                location: admin.location,
                authString: admin.authString,
                auth:admin.auth,
            }
        }
    } catch(e) {
        console.log(`Issue info: ${e.message}`)
    }
    return { id, name: id }
}


async function checkCredentials(id, password) {
    // checks credentials: idLower and password
    if (id || password) {
        try {
            const idLower = id.toLowerCase()
            const admin = await Admin
            .findOne({ idLower })      // admins have own id, additionaly to _id
            .select("-_id -v -idLower")

            if (admin) {
                if (admin.password) {
                    if (bcrypt.compareSync(password, admin.password)) {
                        return {
                            id: admin.id,
                            name: admin.name,
                            title: admin.title,
                            email: admin.email,
                            location: admin.location,
                            authString: admin.authString,
                            auth:admin.auth,
                        }
                    }
                } else {
                    console.log(`No password for admin ID: ${id}`)     // wrong ID
                }
            } else {
                // INIT, when there is no any admin yet
                // creates first
                const admins = await Admin.find()
                if (admins) {
                    // collection exists, but empty
                    if (!admins.length) {
                        await new Admin({
                            id: "BigG0001",
                            idLower: "bigg0001",
                            name: "BigG Admin",
                            title: "Admin",
                            email: "alphafleetacc@gmail.com",
                            location: LOCATION.All,
                            password: await bcrypt.hash("Lifeisawesome2022", 10),
                            authString: getAuthString(AUTH.admin),
                            auth: AUTH.admin,
                        }).save()
                    }
                }
            }
        } catch(e) {
            console.log(`"checkCredentials" issue: ${e.message}`)
        }
    }
    return false
}


function checkAdminsAuth(admin, auth) {
    if (admin) {
        switch(auth) {
            case 'read': return canREADset.includes(admin.auth)
            case 'instructor': return canINSTset.includes(admin.auth)
            case 'write': return canWRITEset.includes(admin.auth)
            case 'share': return canSHAREset.includes(admin.auth)
        }
    }
    return false
}


// Check qty of certain user sessions and deletes all previouse
async function allowOnlyOneActiveSession(sessCollection, id) {
    const prevSessions = (await sessCollection.find().select("_id session"))
    .filter(sess => {
        let session = JSON.parse(sess.session)
        if (session && (session.userId === id || session._id === id)) {
            return session
        }
    })
    if (prevSessions.length) {
        prevSessions.forEach(async(prevSess) => {
            await sessCollection.findByIdAndDelete(prevSess._id)
        })
    }
}

// Two variants of "allowOnlyOneActiveSession" function
async function allowOnlyOne_ADMIN_ActiveSession(id) {
    await allowOnlyOneActiveSession(SessAdmin, id)
}
async function allowOnlyOne_USER_ActiveSession(id) {
    await allowOnlyOneActiveSession(SessUsers, id)
}


function getAllLocations() {
    return Object.values(LOCATION).filter(el => (el !== LOCATION.All && el !== LOCATION.Unset))
}
function getLocations() {
    return Object.values(LOCATION).map(el => el)
}
function getAuths() {
    return AUTHNAMES
}


module.exports = {
    //  constants
    appDomain,
    SCHOOL_DATA,
    LOCATION,
    ISSUES,
    AUTH,

    // Models
    Admin,
    SessAdmin,
    SessUsers,

    // Tools
    findAdminById,
    checkCredentials,
    checkAdminsAuth,
    getAllLocations,
    getLocations,
    getAuthString,
    getAuths,

    // check session
    allowOnlyOne_ADMIN_ActiveSession,
    allowOnlyOne_USER_ActiveSession,

    // timeZone tools
    getTimeDelta_with_SchoolSpecific,
}