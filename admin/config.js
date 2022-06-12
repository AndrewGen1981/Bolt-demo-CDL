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


function getAllLocations() {
    return Object.values(LOCATION).filter(el => el !== LOCATION.All && LOCATION.Unset)
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
}