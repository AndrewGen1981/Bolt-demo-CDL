const mongoose = require('mongoose')

const form2 = new mongoose.Schema({
    created: { type: Date, default: new Date },
    channel: { type: String, required: true },
    email: { type: String, required: true },

    'ref-person-name': String,
    'ref-person-phone': String,
    'ref-person-email': String,
    
    'emerg-person-name': { type: String, required: true },
    'emerg-person-phone': { type: String, required: true },
    'emerg-person-relation': { type: String, required: true },
    'emerg-person-street': String,
    'emerg-person-city': String,
    'emerg-person-state': String,
    'emerg-person-zip': String,

    'education-highest-grade': { type: String, required: true },
    'education-colledge': { type: String, required: true },
    
    highSchoolGrade: { type: String, required: true },
    'education-grade-date': String,

    'education-last-school': String,
    'education-last-school-degree': String,
    'education-last-school-street': String,
    'education-last-school-city': String,
    'education-last-school-state': String,
    'education-last-school-zip': String,
    
    'military-branch': String,
    'military-from-to': String,
    'military-rank': String,
    'military-discharge-date': String,

    'vehicle-license': { type: String, required: true },
    'vehicle-license-state': { type: String, required: true },

    'accident-record1': { type: String, required: true },
    'accident-record2': String,
    'accident-record3': String,

    'conviction-record1': { type: String, required: true },
    'conviction-record2': String,
    'conviction-record3': String,

    'criminal-record1': { type: String, required: true },
    'criminal-record2': String,
    'criminal-record3': String,

    'employer-contact': { type: String, required: true },

    employers: [
        {
            'employer-company': { type: String, required: true },
            'employer-address': { type: String, required: true },
            'employer-supervisor': { type: String, required: true },
            'employer-position': { type: String, required: true },
        }
    ],
    
    certificate1: { type: String, required: true },
    certificate2: { type: String, required: true },

    updatedAdmin: String,
    updatedDate: Date

}, {
    collection: 'application-forms'
})



function getForm2Object(body, userEmail) {

    if (!userEmail || !body) { return false }
    
    const employerCompany = []
    const employerAddress = []
    const employerSupervisor = []
    const employerPosition = []

    Object.entries(body).forEach(([key, value]) => {
        if (/^employer.*company$/.test(key)) {
            employerCompany.push(value)
        }
        if (/^employer.*address$/.test(key)) {
            employerAddress.push(value)
        }
        if (/^employer.*supervisor$/.test(key)) {
            employerSupervisor.push(value)
        }
        if (/^employer.*position$/.test(key)) {
            employerPosition.push(value)
        }
    })

    const employersBody = []
    employerCompany.map((comp, index) => {
        employersBody.push({
            'employer-company':employerCompany[index],
            'employer-address': employerAddress[index],
            'employer-supervisor': employerSupervisor[index],
            'employer-position': employerPosition[index]
        })
    })

    return {
        channel: body.hdyfu,
        email: userEmail,
    
        'ref-person-name': body['ref-person-name'],
        'ref-person-phone': body['ref-person-phone'],
        'ref-person-email': body['ref-person-email'],
        
        'emerg-person-name': body['emerg-person-name'],
        'emerg-person-phone': body['emerg-person-phone'],
        'emerg-person-relation': body['emerg-person-relation'],
        'emerg-person-street': body['emerg-person-street'],
        'emerg-person-city': body['emerg-person-city'],
        'emerg-person-state': body['emerg-person-state'],
        'emerg-person-zip': body['emerg-person-zip'],
    
        'education-highest-grade': body['education-highest-grade'],
        'education-colledge': body['education-colledge'],
        
        highSchoolGrade: body.highSchoolGrade,
        'education-grade-date': body['education-grade-date'],
    
        'education-last-school': body['education-last-school'],
        'education-last-school-degree': body['education-last-school-degree'],
        'education-last-school-street': body['education-last-school-street'],
        'education-last-school-city': body['education-last-school-city'],
        'education-last-school-state': body['education-last-school-state'],
        'education-last-school-zip': body['education-last-school-zip'],

        'military-branch': body['military-branch'],
        'military-from-to': body['military-from-to'],
        'military-rank': body['military-rank'],
        'military-discharge-date': body['military-discharge-date'],

        'vehicle-license' : body['vehicle-license'],
        'vehicle-license-state' : body[ 'vehicle-license-state'],

        'accident-record1' : body['accident-record1'],
        'accident-record2': body['accident-record2'],
        'accident-record3': body['accident-record3'],

        'conviction-record1' : body['conviction-record1'],
        'conviction-record2': body['conviction-record2'],
        'conviction-record3': body['conviction-record3'],

        'criminal-record1' : body['criminal-record1'],
        'criminal-record2': body['criminal-record2'],
        'criminal-record3': body['criminal-record3'],

        'employer-contact' : body['employer-contact'],

    
        employers: employersBody,
        
        certificate1: body.certificate1,
        certificate2: body.certificate2
        
    }
}



module.exports = { 
    applicationForm: mongoose.model('form2', form2),
    getForm2Object
}