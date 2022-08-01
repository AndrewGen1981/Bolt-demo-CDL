const mongoose = require("mongoose")

const FMCSAModel = new mongoose.Schema(
    {
        pemCertificate: String,
        idTPR: String,
        idLocations: [
            {
                title: String,
                id: String,
            }
        ]
    }, {
        collection: "FMCSA",
        timestamps: true,
    }
)


module.exports = {
    FMCSAModel: mongoose.model("FMCSAModel", FMCSAModel)
}