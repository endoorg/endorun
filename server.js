const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'atuheont1561HTNOEHUNthonuhork0615@@AUOhNTOHUJ  OTHUN){[( onuhej*&#(jt'

mongoose.connect('mongodb://localhost:27017/endodb', {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body 

	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'invalid username/password' })
	}
	if (await bcrypt.compare(password, user.password)) {

		const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET)
		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'invalid username/password' })
})

app.post('/api/register', async (req, res)=> {
	const { username, password: plaintext } = req.body

	if (!username || typeof(username) != 'string') {
		return res.json({ status: 'error', error: 'invalid username' })
	}

	if (!plaintext || typeof(plaintext) != 'string') {
		return res.json({ status: 'error', error: 'invalid password' })
	}
	const password = await bcrypt.hash(plaintext, 15)


	try {
		const response = await User.create({
			username, password
		})
		console.log('user created successfully: ', response)

	} catch(error) {
		if (error.code === 11000) {
			return res.json({ status: 'error', error: 'username already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })

})



app.listen(3000, () => {
	console.log('server up at 3000')
})

