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
    { id: "BigG0001", name: "BigG Admin", title: "Admin", email: "alphafleetacc@gmail.com", location: LOCATION.All, password: process.env.BIGG0001_PASS, auth: AUTH.admin },
    { id: "Mike0001", name: "Mike Svoboda", title:'Admin', email: "newsoundcdl@gmail.com", location: LOCATION.All, password: process.env.MIKE0001_PASS, auth: AUTH.editor },
    { id: "Ryan0001", name: "Ryan Kling", title:'President', email: "ryan@torocdl.com", location: LOCATION.All, password: process.env.RYAN0001_PASS, auth: AUTH.editor },
   
    
    // TACOMA managers & instructors:
    { id: "Aziz0001", name: "Aziz", title:'Manager', email: "Azo2008@gmail.com", location: LOCATION.Tacoma, password: process.env.AZIZ0001_PASS, auth: AUTH.editor },
    { id: "Mariana0001", name: "Mariana Bulgaru", title:'Manager', email: "tacoma@torocdl.com", location: LOCATION.Tacoma, password: process.env.MARIANA0001_PASS, auth: AUTH.editor },
    { id: "Salazar0002", name: "Michelle Salazar", title:'Manager', email: "tacoma@torocdl.com", location: LOCATION.Tacoma, password: process.env.SALAZAR0001_PASS, auth: AUTH.editor },
    // + Stephen Hewett ( Instructor )
    { id: "HewettInst0001", name: "Stephen Hewett", title:'Instructor', email: "tacoma@torocdl.com", location: LOCATION.Tacoma, password: process.env.HEWETT0001_PASS, auth: AUTH.instructor },
    // + Jeffrey Mudgett ( Instructor )
    { id: "MudgettInst0001", name: "Jeffrey Mudgett", title:'Instructor', email: "tacoma@torocdl.com", location: LOCATION.Tacoma, password: process.env.MUDGETT0001_PASS, auth: AUTH.instructor },
    // + Uladzimar Martynau ( Instructor )
    { id: "MartynauInst0001", name: "Uladzimar Martynau", title:'Instructor', email: "tacoma@torocdl.com", location: LOCATION.Tacoma, password: process.env.MARTYNAU0001_PASS, auth: AUTH.instructor },

    
    // KENT managers & instructors:
    { id: "Salazar0001", name: "Michelle Salazar", title:'Manager', email: "kent@torocdl.com", location: LOCATION.Kent, password: process.env.SALAZAR0001_PASS, auth: AUTH.editor },
    { id: "Sylling0001", name: "Jalyn Sylling", title:'Manager', email: "kent@torocdl.com", location: LOCATION.Kent, password: process.env.SYLLING0001_PASS, auth: AUTH.editor },
    // + Robert Littleton manager/instructor
    { id: "Littleton0001", name: "Robert Littleton", title:'Manager', email: "robert@torocdl.com", location: LOCATION.Kent, password: process.env.LITTLETON0001_PASS, auth: AUTH.editor },
    { id: "LittletonInst0001", name: "Robert Littleton", title:'Instructor', email: "robert@torocdl.com", location: LOCATION.Kent, password: process.env.LITTLETON0001_PASS, auth: AUTH.instructor },    
    // + Tyer Newman instructor
    { id: "NewmanInst0001", name: "Tyer Newman", title:'Instructor', email: "kent@torocdl.com", location: LOCATION.Kent, password: process.env.NEWMAN0001_PASS, auth: AUTH.instructor },    
    // + Trever Perry instructor
    { id: "PerryInst0001", name: "Trever Perry", title:'Instructor', email: "kent@torocdl.com", location: LOCATION.Kent, password: process.env.PERRY0001_PASS, auth: AUTH.instructor },
    // + Omar Hussein instructor
    { id: "HusseinInst0001", name: "Omar Hussein", title:'Instructor', email: "kent@torocdl.com", location: LOCATION.Kent, password: process.env.HUSSEIN0001_PASS, auth: AUTH.instructor },
    // + Ivan Garcia instructor
    { id: "GarciaInst0001", name: "Ivan Garcia", title:'Instructor', email: "kent@torocdl.com", location: LOCATION.Kent, password: process.env.GARCIA0001_PASS, auth: AUTH.instructor },
    // + Patricia Pierson instructor
    { id: "PiersonInst0001", name: "Patricia Pierson", title:'Instructor', email: "kent@torocdl.com", location: LOCATION.Kent, password: process.env.PIERSON0001_PASS, auth: AUTH.instructor },


    // Troutdale Office managers & instructors:
    { id: "Estudillo0001", name: "Megan Estudillo", title:'Manager', email: "troutdale@torocdl.com", location: LOCATION.Troutdale, password: process.env.ESTUDILLO0001_PASS, auth: AUTH.editor },
    // + Richard Dupraw manager/instructor
    { id: "Dupraw0001", name: "Richard Dupraw", title:'Manager', email: "troutdale@torocdl.com", location: LOCATION.Troutdale, password: process.env.DUPRAW0001_PASS, auth: AUTH.editor },
    { id: "DuprawInst0001", name: "Richard Dupraw", title:'Instructor', email: "troutdale@torocdl.com", location: LOCATION.Troutdale, password: process.env.DUPRAW0001_PASS, auth: AUTH.instructor },
    // + Woltereck, Ray instructor
    { id: "WoltereckInst0001", name: "Ray Woltereck", title:'Instructor', email: "RWoltereck@gmail.com", location: LOCATION.Troutdale, password: process.env.WOLTERECK0001_PASS, auth: AUTH.instructor },
    // + Stevens, Paul instructor
    { id: "StevensInst0001", name: "Paul Stevens", title:'Instructor', email: "pstevensjr81@gmail.com", location: LOCATION.Troutdale, password: process.env.STEVENS0001_PASS, auth: AUTH.instructor },
    // + Kyle, Sousa instructor
    { id: "SousaInst0001", name: "Kyle Sousa", title:'Instructor', email: "kyle.sousa03@gmail.com", location: LOCATION.Troutdale, password: process.env.SOUSA0001_PASS, auth: AUTH.instructor },
    // + Carl, Fulton instructor
    { id: "FultonInst0001", name: "Carl Fulton", title:'Instructor', email: "carl80@aol.com", location: LOCATION.Troutdale, password: process.env.FULTON0001_PASS, auth: AUTH.instructor },


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