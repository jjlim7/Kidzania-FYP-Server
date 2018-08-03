const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const formData = require('form-data')
const multer = require('multer')
const fs = require('fs')
const mkdirp = require('mkdirp')
const http = require('http')
const db = require('../src/databasePool')
const pool = db.getPool()
// Re-uses existing if already created, else creates a new one

const seedData = require('../src/seedData')

const router = express.Router()
router.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true,
	parameterLimit: 100000
}))
router.use(bodyParser.json({
	limit: '50mb'
}))

let uploadpath = ''
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = 'images/'
		cb(null, dir)
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '.' + file.mimetype.split('/')[1])
	}
})
const upload = multer({
	storage: storage
})

router.options('*', cors())
router.use(cors())

router.route('/')
.all((req, res, next) => {
	res.statusCode = 200
	res.setHeader('Content-Type', 'text/plain')
	next() //Continue on to the next method -> .get(...)
})
.get((req, res) => {
	let sql = `Select st.station_id, st.station_name, role_id, role_name, durationInMins, 
	capacity, sr.imagepath From station_roles sr, stations st
	Where st.station_id = sr.station_id; `
	sql += `Select DISTINCT station_id, station_name from stations ORDER BY 1 ASC;`
	pool.getConnection().then(function(connection) {
		connection.query(sql)
			.then(results => {
				res.json(results)
			})
		connection.release()
	})
})
.post(upload.any(), (req, res) => {
	let roleData = JSON.parse(req.body.webFormData)
	let filename = req.files[0].filename
	let sql = 'INSERT INTO station_roles (station_id, role_name, ' +
		'capacity, imagepath) VALUES ?'
	// let sql = 'INSERT INTO station_roles (station_id, role_name, durationInMins, ' +
	// 	'capacity, imagepath) VALUES ?'
	let role_val = []
	role_val.push([roleData.stationId, roleData.roleName, parseInt(roleData.capacity), filename])
	pool.getConnection().then(function(connection) {
		connection.query(sql, [role_val])
			.then((results) => {
				res.end('Role Added Successfully')
			})
			.catch(err => {
				fs.unlinkSync(`images/${filename}`)
				res.statusMessage = err.code
				res.status(400).json({ error: err.code })
			})
		connection.release()
	})
})

router.route('/:roleID')
.all((req, res, next) => {
	res.statusCode = 200
	res.setHeader('Content-Type', 'text/plain')
	next() //Continue on to the next method -> .get(...)
})
.get((req, res) => {
	let sql = 'SELECT * FROM station_roles where role_id = ?; '
	sql += 'Select DISTINCT station_id, station_name from stations;'
	pool.getConnection().then(function(connection) {
		connection.query(sql, req.params.roleID)
			.then(results => {
				res.json(results)
			})
		connection.release()
	})
})
.put(upload.any(), (req, res) => {
	let filename = (req.files.length > 0) ? req.files[0].filename : null
	let roleData = JSON.parse(req.body.webFormData)
	let sql = `Select role_name, imagepath from station_roles where role_id = ${req.params.roleID}`
	let durationChanged = false
	pool.getConnection().then(function(connection) {
		connection.query(sql)
			.then(results => {
				if (filename) {
					// If changed image and role name -> Delete original image
					if (filename.split('.')[0] !== results[0].imagepath.split('.')[0]) {
						fs.unlinkSync('images/' + results[0].imagepath)
					}
					else {
						// If changed role name but original image is of different file type
						if (filename.split('.')[1] !== results[0].imagepath.split('.')[1]) {
							fs.unlinkSync('images/' + results[0].imagepath)
						}
					}
				}
				else {
					filename = `Role-${roleData.roleName}.${results[0].imagepath.split('.')[1]}`
					// If changed role name, with same image --> rename original image
					if (roleData.roleName !== results[0].role_name) {
						console.log('Renaming File...')
						fs.renameSync('images/' + results[0].imagepath, `images/${filename}`)
					}
				}
				// if (roleData.duration != results[0].durationInMins) {
				// 	durationChanged = true
				// }

				sql = `UPDATE station_roles SET role_name=?, capacity=?, imagepath=? WHERE role_id=?`
				let role_val = [roleData.roleName, roleData.capacity, filename, req.params.roleID]
				return connection.query(sql, role_val)
			})
			.then(() => {
				// if (durationChanged) {
				// 	seedData.seedNewRoleSessions(req.params.roleID, durationChanged)
				// }
				res.end('Updated Successfully')
			})
			.catch(err => {
				res.statusMessage = err
				res.status(400).end()
			})
		connection.release()
	})
})
.delete((req, res) => {
	let sql = 'SELECT imagepath FROM station_roles WHERE role_id = ' + req.params.roleID + ';'
	sql += 'DELETE FROM station_roles WHERE role_id = ' + req.params.roleID + ';'
	pool.getConnection().then(function(connection) {
		connection.query(sql)
			.then((results) => {
				fs.unlink(results[0].imagepath, (err) => {
					if (err) throw err
					console.log('Successfully deleted role image')
				})
				res.end('Deleted Role Successfully')
			})
			.catch(err => {
				res.statusMessage = err
				res.status(400).end()
			})
		connection.release()
	})
})

router.route('/getImage/:roleID')
.get((req, res) => {
	let sql = `Select imagepath From station_roles Where role_id = ?`
	pool.getConnection().then(function(connection) {
		connection.query(sql, [req.params.roleID])
			.then(results => {
				let data = fs.readFileSync('images/' + results[0].imagepath)
				res.contentType('image/*')
				res.end(data)
			})
			.catch((err) => {
				res.statusMessage = err
				res.status(400).end()
			})
			connection.release()
	})
})

module.exports = router