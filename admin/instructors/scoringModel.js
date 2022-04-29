const mongoose = require('mongoose')

const studentScoringSchema = new mongoose.Schema ({
    created: { type: Date, default: new Date() },
    
    key: { type: Number, required: true },
    email: { type: String, lowercase: true, required: true },
    student_id_string: { type: String, default: 'not assigned' },       // Student._id will be here, populate will not work - to make modules Student & Tuition separate

    isAllowed: { type: Boolean, default: true },
    lastDone: { type: Date, required: true },
    lastDoneBy: { type: String, required: true },

    scoringsInCab: [{
        created: { type: Date, default: new Date() },
        instructor: String,
        result: Boolean,
        details: String,
        comment: String,
        certificate: Boolean,
    }],
    scoringsOutCab: [{
        created: { type: Date, default: new Date() },
        instructor: String,
        result: Boolean,
        details: String,
        comment: String,
        certificate: Boolean,
    }],
    scoringsBacking: [{
        created: { type: Date, default: new Date() },
        instructor: String,
        result: Boolean,
        details: String,
        comment: String,
        certificate: Boolean,
    }],
    scoringsCity: [{
        created: { type: Date, default: new Date() },
        instructor: String,
        result: Boolean,
        details: String,
        comment: String,
        certificate: Boolean,
    }],
},
{
    collection: "Student Scorings"
})


const instructorScoringSchema = new mongoose.Schema ({
    created: { type: Date, default: new Date() },

    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    instructorLocation: { type: String, required: true },
    
    scoringType: { type: String, required: true },
    scoring_str_ref: { type: String, required: true },      // string _id studentScoringSchema.scoringTypeOf[i] to retrive data
    scoring_certificate: Boolean,
    scoring_comment: String,

    examinedStudent: { type: String, required: true },
    examinedStudentKey: { type: String, required: true },
    examinedStudent_str_ref: String,
},
{
    collection: "Instructor Scorings"
})

module.exports = {
    StudentScoring: mongoose.model('studentScoringSchema', studentScoringSchema),
    InstructorScoring: mongoose.model('instructorScoringSchema', instructorScoringSchema)
}