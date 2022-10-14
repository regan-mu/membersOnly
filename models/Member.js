const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const memberSchema = new Schema(
    {
        f_name: {type: String, required: true},
        l_name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        status: {type: Boolean, default: false},
        admin: {type: Boolean, default: false},
        password: {type: String, required: true}
    }
);

memberSchema.virtual("fullname").get(function () {
    return `${this.f_name} ${this.l_name}`;
})

module.exports = mongoose.model("Member", memberSchema);

