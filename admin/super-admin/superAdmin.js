// @ Module contains super-admin routes
// super-admin has to have "auth: AUTH.admin" ("auth: 4")

const express = require("express")
const superAdminRouter = express.Router()

const bcrypt = require("bcrypt")
const path = require("path")

const { AUTH, LOCATION, Admin, SessAdmin, SessUsers, getLocations, getAuths, getAuthString } = require("../config")


// @GET, returns admins, sessAdmin, sessUsers
superAdminRouter.get("/", async(req, res) => {
    try {
        // find all admin's credentials
        const admins = (await Admin.find().select("-__v -idLower"))
        .sort((a, b) => {

            if(a.location > b.location) {
                return 1
            } else {
                if(a.location < b.location) {
                    return -1
                } else {
                    return  a.title < b.title ? 1 : -1
                }
            }
        })

        // finds all logged in admins, returns only session info
        const sessAdmin = (await SessAdmin.find().select("session"))
        .map(sess => JSON.parse(sess.session))
        


        // finds all logged in users, returns only session info, session _id and sort by emails
        const sessUsers = (await SessUsers.find().select("session"))
        .map(sess => { 
            let obj = JSON.parse(sess.session)
            obj.sess_id = sess._id
            return obj
        })
        .sort((a, b) => { return a.email > b.email ? 1 : -1 })
        // render page with all above red
        res.render(path.join(__dirname + "/superAdmin.ejs"), {
            admins, sessAdmin, sessUsers,
            auths: getAuths(),
            excludeAuth: [AUTH.admin],
            locations: getLocations(),
            excludeLocations: [LOCATION.All, LOCATION.Unset],
        })
    } catch(e) {
        res.send(`Superadmin module issue: ${e.message}`)
    }
})



// without this BODY is empty when just fetching from client-side
superAdminRouter.use(express.json({
    type: ['application/json', 'text/plain']
}))

superAdminRouter.put("/", async(req, res) => {
    function checkPassword(password) {
        return password.length >= 5
    }
    function checkEmail(email) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
    }
    async function ifIDNotUnique(id) {
        const admins = await Admin.find({ id })
        return admins.length
    }

    const { isNewRequest, _id, id, password, name, title, email, location, auth } = req.body

    try {
        // new ADMIN/INSTRUCTOR
        if (isNewRequest) {
            if (id && password && name && title && email && location && auth) {
                // check password length
                if (!checkPassword(password)) { return res.status(400).json({"issue": "Password is too short"}) }
                // check email
                if (!checkEmail(email)) { return res.status(400).json({"issue": "Entered email is invalid"}) }
                // check unique ID
                if (await ifIDNotUnique(id)) { return res.status(400).json({"issue": `ID "${id}" is already in use`}) }
                // ok, can create
                await new Admin({
                    id, name, title, email, location,
                    password: await bcrypt.hash(password, 10),
                    auth: parseInt(auth),
                    authString: getAuthString(parseInt(auth)),
                    idLower: id.toLowerCase()
                }).save()
                return res.status(200).end()
            }
        } else {
            // UPDATING existing credentials
            if (_id) {
                const admin = await Admin.findById(_id)
                if (!admin) { return res.status(400).json({"issue": `ID "${id}" was not found`}) }
                // if password has to be updated, then check one
                if (password) {
                    if (!checkPassword(password)) { return res.status(400).json({"issue": "Password is too short"}) }
                }
                const hashedPassword = password ? await bcrypt.hash(password, 10) : password
                // if email has to be updated, then check one
                if (email) {
                    if (!checkEmail(email)) { return res.status(400).json({"issue": "Entered email is invalid"}) }
                }
                // updating fields or leaving existing
                admin.id = id || admin.id
                admin.name = name || admin.name
                admin.title = title || admin.title
                admin.email = email || admin.email
                admin.location = location || admin.location
                admin.password = hashedPassword || admin.password
                admin.auth = parseInt(auth) || admin.auth
                admin.authString = getAuthString(parseInt(auth)) || admin.authString
                admin.idLower = id.toLowerCase() || admin.idLower
                // saving
                await admin.save()
                return res.status(200).end()
            }
        }
    } catch(e) {
        return res.status(400).json({"issue": e.message})
    }

    res.status(404).end()   //  error: not found exit upper
})


// DELETE admin/instructor
superAdminRouter.delete("/", async(req, res) => {
    const { _id, type } = req.body

    if (!_id) { return res.status(404).json({"issue": `ID ${_id} is not found`}) }
    if (!type) { return res.status(404).json({"issue": `Type ${type} is not found`}) }

    try {
        if (type === "admin") {
            await Admin.findByIdAndDelete(_id)
            return res.status(200).end()
        }
        if (type === "user") {
            await SessUsers.findByIdAndDelete(_id)
            return res.status(200).end()
        }
    } catch(e) {
        return res.status(400).json({"issue": e.message})
    }

    res.status(404).json({"issue": 'Type is not defined, neither "admin" nor "user"'})
})


module.exports = superAdminRouter