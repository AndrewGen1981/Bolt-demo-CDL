// @ADMIN configuration file
// contains credentials & a list of authorities

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


// Array of admins & instructors
const PROFILES = [
    // Admin without specified location
    { id: "BigG0001", name: "BigG Admin", title: "Admin", email: "alphafleetacc@gmail.com", location: LOCATION.All, password: process.env.BIGG0001_PASS, auth: AUTH.admin },

    // TEST INSTRUCTORS
    { id: "Inst0001", name: "John Smith", title:'Instructor', email: "smith@torocdl.com", location: LOCATION.All, password: process.env.INST0001_PASS, auth: AUTH.instructor },
]


// Variants of issues
const ISSUES = {
    wrongIDPASS: "Wrong admin's ID or PASSWORD provided"
}

function findAdminById(id) {
    return PROFILES.find(admin => admin.id.toUpperCase() === id.toUpperCase())
}

function checkAdminsAuth(id, auth) {
    const admin = findAdminById(id)
    if (!admin) { return false }

    switch(auth) {
        case 'read': return canREADset.includes(admin.auth)
        case 'instructor': return canINSTset.includes(admin.auth)
        case 'write': return canWRITEset.includes(admin.auth)
        case 'share': return canSHAREset.includes(admin.auth)
        default: return false   // all other requests
    }
}


// INIT
PROFILES.map(profile => {
    profile.authString = AUTHNAMES[profile.auth - 1]
})

module.exports = {
    LOCATION,
    PROFILES,
    ISSUES,
    findAdminById,
    checkAdminsAuth
}