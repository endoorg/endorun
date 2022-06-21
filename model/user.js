const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	email: { type: String, required: true },
	hour: { type: Number, required: true },
	minute: { type: Number, required: true },
	distance: { type: Number, required: true },
}, { collection: 'users' })

const model = mongoose.model('UserSchema', UserSchema)

module.exports = model
