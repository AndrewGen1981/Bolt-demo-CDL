// qr configuration options
const qrCONFIG = {
    // can be in .env or specific json file if needed, so assecc can be provided from admin
    // specifies different modes of QR work
    assignWithAdminsMachine: true,
    requiresGeoLocationCheck: true,
    checkFullPartTimeStudents: true
}


module.exports = {
    qrCONFIG
}