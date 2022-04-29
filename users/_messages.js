// ISSUES
const issuesArray = {
    form1Read: "You have to fill out form#1 'STUDENT DATA COLLECTION FORM' at first",
    form2Read: "You have to fill out form#2 'APPLICATION FOR ENROLLMENT' at first",
    formAlreadyExists: "We've found this particular form in our database attached to your email.",
    savingIssue: "Ooops... info saving issue occurred, please try again later. We are very sorry for inconveniences.",
    dataIssue: "Sorry. We are unavailable to read data, database is not responding now. Try again later, please.",
    wrongUserOrPassword: "Wrong username or password",
    sessionTimeout: "Looks like you have been signed out meanwhile. Try to login first",
    blankCurrentPassw: "You messed up with your current password, try to reenter it",
    blankNewPassword: "You have to provide us with your new desired password",
    newPasswLen: "Your new password is too short. Provide minimum 5 symbols",
    wrongCurrentPassw: "You messed up with your current password, try to reenter it",
    equalCurrentNew: "Both current and new passwords are equal. There is no sense to change one to another"
}

function getIssueMessage(key) {
    return issuesArray[key]
}


// INFO
const infoArray = {
    passwChanged: "Password was changed",
    passwEmailed: "A new password was emailed to you. Check your INBOX (or SPAM box if needed)",
    okForm1: "Good start here! We saved your 1st form successfully.",
    okForm2: "Great, almost done. We got your 2nd form. Thank you.",
    okForm3: "Awesome. Here is how Applicant becomes a Student...",
    verTokenSent: "Verification email has been sent. Check your email please, meanwhile forms below will be not available for you"
}

function getInfoMessage(key) {
    return infoArray[key]
}



module.exports = {
    getInfoMessage,
    getIssueMessage
}