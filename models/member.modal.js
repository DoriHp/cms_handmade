var mongoose = require('mongoose')

var MemberSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    member_code: String,
    otp: String,
    auto_reply: Boolean,
    fb_id: String,
    fb_name: String,
    fb_gender: String,
    fb_linkChat: String,
    lastTimeQueryVAS: Date
})

var Member = mongoose.model('Member', MemberSchema, 'members')

module.exports = Member