var mongoose = require('mongoose');

var memberSchema = new mongoose.Schema({
	name: {
		first: { type: String, trim: true, lowercase: true },
		last: { type: String, trim: true, lowercase: true }
	},
	phone: {
		prefix: { type: String, default: '+972' },
		num: Number
	},
	email: { type: String, trim: true, lowercase: true },
	password: String,
	birthday: Date,
	social: {
		facebook: { type: String, trim: true, lowercase: true }
	},
	registered: { type: Date, default: Date.now },
	approved: { type: Boolean, default: false },
	tags: [String],
	sms_logs: [{
		sent: { type: Date, default: Date.now },
		content: String
	}],
	contact_guy: String
});

var Member = mongoose.model('Member', memberSchema);

module.exports = Member;