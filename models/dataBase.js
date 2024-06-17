const mongoose = require("mongoose")
exports.connectDatabse= async()=>{
try {
    await mongoose.connect(process.env.MongoDB_url)
    console.log("Done");
} catch (error) {
    console.log(error);
}
}