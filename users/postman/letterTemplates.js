// for token letter sending
// formates a letter 

function getCompressedTokenLetter(name, email, token, tokenLink) {
    
    return `<section style="width:100%; background-color:hsla(213, 10%, 36%, 5%); padding: 50px 0; margin: 0">
        <div style="width: 100%; text-align: center; margin: 0; padding: 0">
            <h1 style="margin: 10px 0 0 0; padding: 0; font-size: 42px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.6px; color: hsl(213, 10%, 36%)">Toro Trucking Academy</h1>
            <div style="max-width: 600px; margin: 0 auto;  padding: 35px; background-color: white; border: 1px solid hsla(213, 10%, 36%, 20%); border-radius: 5px; text-align: justify">
                <h3 style="margin-bottom: 1em; font-size: 24px; font-weight: 700; text-align: center; color: #e47337">Action Required | Email Verification</h3>

                <p style="margin-bottom: 0.8em; font-size: 15px; font-weight: 700; color: hsla(0, 0%, 18%, 80%)">Hi, ${name}</p>
                <p style="margin-bottom: 0.8em; font-size: 15px; font-weight: 500; color: hsla(0, 0%, 18%, 80%)">You are receiving this email because a request was made for email verification in order to authentication purposes. To complete your sign up procedure, we just need to verify your email address.</p>
                <p style="margin-bottom: 0.8em; font-size: 12.5px; font-weight: 700; color: hsla(0, 0%, 18%, 90%)">You probably will be warned that you are trying to send information to an external page, so just confirm and you data will be passed in a most secure way to TTA</p>
                <form style="width: 100%; display: flex; justify-content: center;" action="${tokenLink}" method="POST">
                    <input type="hidden" name="email" value="${email}" readonly>
                    <input type="hidden" name="token" value="${token}" readonly>
                    <button style="width: 100%; max-width: 200px; margin: 1em auto; padding: 0.5em 0; border: none; border-radius: 5px; background-color: hsla(0, 0%, 18%, 80%); font-size: 15px; font-weight: 500; color: #ccc9bd; cursor: pointer" type="submit">Click to Verify</button>
                </form>
                <p style="margin-bottom: 0.8em; font-size: 15px; font-weight: 500; color: hsla(0, 0%, 18%, 80%)">If you believe you have received this email in error, please reach out to your system administrator.</p>
            </div>
            <p style="margin: 0.6em 0; font-size: 12px; font-weight: 500; color: hsla(0, 0%, 18%, 60%)">This is an automatically generated message. Replies are not monitored or answered.</p>
        </div>
    </section>`.replace(/\n/g, '').replace(/\s\s/g, '').replace(/:\s/g, ':').replace(/;\s/g, ';')
}



function getCompressedPasswordResetLetter(name, password, actionType) {
    return `<section style="width:100%; background-color:#535b650d; padding: 50px 0; margin: 0">
        <div style="width: 100%; text-align: center; margin: 0; padding: 0">
            <div style="max-width: 600px; margin: 0 auto;  padding: 35px; background-color: white; border: 1px solid #535b6533; border-radius: 5px; text-align: justify">
                <p style="margin-bottom: 0.8em; font-size: 26px; font-weight: 400; color: #2e2e2ecc">Hello, <span style="font-weight: 500;color: #e47337">${name}</span></p><br>
                <p style="margin-bottom: 0.8em; font-size: 18px; font-weight: 500; color: #2e2e2ecc">A request has been received to ${actionType} the password for your TTA account.</p>
                <p style="margin-bottom: 0.8em; font-size: 15px; font-weight: 700; color: #2e2e2ee6; line-height: 24px; text-align: justify;text-align-last: center;">Your new password is <span style="font-size: 22px; font-weight: 500;background-color:#535b6526;color: #e47337; padding: 5px 10px; border-radius: 17px;">${password}</span>. This password is for permanent use, however you can change it at your profile page, if you’d like to.</p>
                <p style="margin-bottom: 0.8em; font-size: 18px; font-weight: 500; color: #2e2e2ecc">If you did not initiate this request, please contact us innediately.</p><br>
                <p style="margin-bottom: 0.8em; font-size: 22px; font-weight: 400; color: #2e2e2e99">Thank you,<br>The Toro Trucking Academy Team</p>
            </div>
            <p style="margin: 0.6em 0; font-size: 12px; font-weight: 500; color: #2e2e2e99">This is an automatically generated message. Replies are not monitored or answered.</p>
        </div>
    </section>`.replace(/\n/g, '').replace(/\s\s/g, '').replace(/:\s/g, ':').replace(/;\s/g, ';')
}


module.exports = {
    getCompressedTokenLetter,
    getCompressedPasswordResetLetter
}