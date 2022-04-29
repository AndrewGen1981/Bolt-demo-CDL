const mongoose = require('mongoose')

const form3 = new mongoose.Schema({
    created: { type: Date, default: new Date },
    email: { type: String, lowercase: true, required: true },
    
    class: { type: String, required: true },
    transmission: { type: String, required: true },
    visiting: { type: String, required: true },

    tuitionCost: Number,
    regisrFee: Number,
    supplyFee: Number,
    otherFee: Number,

    payment: String,
    thirdPartyList: String,
    downPayment: String,
    monthlyPayment: String,
    loanPayment: String,

    certificate1: { type: String, required: true },

    parentFirstName: String,
    parentLastName: String,

    updatedAdmin: String,
    updatedDate: Date,

    schoolSignRep: String,
    schoolSignDate: Date
    
}, {
    collection: 'agreements'
})



function getForm3Object(body, userEmail) {
    
    if (!userEmail || !body) { return false }

    return {
        email: userEmail,
        class: body.class,
        transmission: body.transmission,
        visiting: body.visiting,
        payment: body.payment.toString(),
        thirdPartyList: body.thirdPartyList,
        downPayment: body['down-payment'],
        monthlyPayment: body['monthly-payment'],
        loanPayment: body['loan-payment'],
        certificate1: body.certificate1,
        parentFirstName: body['parent-fn'],
        parentLastName: body['parent-ln']
    }
}



module.exports = { 
    agreementForm: mongoose.model('form3', form3),
    getForm3Object
}