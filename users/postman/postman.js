// node-fetch from v3 is an ESM-only module - you are not able to import it with require().
// If you cannot switch to ESM, please use v2
// npm install node-fetch@2
const fetch = require('node-fetch')
const { getCompressedTokenLetter, getCompressedPasswordResetLetter } = require('./letterTemplates')


async function sendALetter(letter) {
    // FETCH is async, but we send POST, so reply will not come
    
    await fetch(process.env.CLIENT_POST_SERVER, {
        method: 'POST',
         body: JSON.stringify({
            action: "sendGmail",
            email: letter.email,
            html: letter.HTML,
            title: letter.title,
            body: letter.body,
            sender: "[TTA] TORO Trucking Academy"
        })
    })
}


function generateAToken() {
    return Math.random().toString(36).substring(7)
}

function sendATokenLetter(name, email, token, tokenLink) {
    // tokenLink is somesing like localhost:5000/user/toket/${tokenlink} or with www.domain in production
    sendALetter({
        email,
        HTML: getCompressedTokenLetter(name, email, token, tokenLink),
        title: "Email Verification"
    })
}


function generateNewPassword() {
    return Math.random().toString(36).substring(5)
}
function sendNewPasswordLetter(name, email, password, actionType) {
    sendALetter({
        email,
        HTML: getCompressedPasswordResetLetter(name, password, actionType),
        title: "Password Reset"
    })
}


module.exports = {
    sendALetter,

    generateAToken,
    sendATokenLetter,

    generateNewPassword,
    sendNewPasswordLetter
}