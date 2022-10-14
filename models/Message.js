const mongoose = require("mongoose");
const {DateTime} = require("luxon");

const Schema = mongoose.Schema;
const messageSchema = Schema(
    {
        title: {required: true, type: String},
        body: {required: true, type: String},
        postedBy: {required: true, type: Schema.Types.ObjectId, ref: "Member"},
        datePosted: {type: Date, default: Date.now()}
    }
);

messageSchema.virtual("formattedDate").get(function () {
    return DateTime.fromJSDate(this.datePosted).toLocaleString(DateTime.DATE_MED);
});
module.exports = mongoose.model("Message", messageSchema);