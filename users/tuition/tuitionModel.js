const mongoose = require('mongoose')

// @Tuition Schema.
// each Student should have 1 tuition schema
//  shema contains all student's videos and tests

const tuitionSchema = new mongoose.Schema({
    created: { type: Date, default: new Date() },
    
    key: { type: Number, required: true },
    email: { type: String, lowercase: true, required: true },
    student_id_string: { type: String, default: 'not assigned' },       // Student._id will be here, populate will not work - to make modules Student & Tuition separate

    isAllowed: {type: Boolean, default: true},

    lessons: [{
        watchDate: Date,
        videoID: String,
        lesson: String,
        lessonTitle: String,
        videoProgress: Number,
        testProgress: Number
    }],

    avLessonsRate: { type: Number, default: 0 }

}, {
    collection: "Lessons"
})

module.exports = {
    Tuition: mongoose.model('tuitionSchema', tuitionSchema)
}