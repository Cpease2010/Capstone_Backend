require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const port = process.env.PORT || 3000
const listener = () => console.log(`Listening to port ${port}!`)

app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(cors())
app.use(function (err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON');
    }
})

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
});

var childSchema = new mongoose.Schema({
    companyName: {type: String, required: true}, 
    billName: {type: String, required: true},
    amountDue:{type: Number, required: true},
    dueDate: {type: Number, required: true}
});

const userSchema = new mongoose.Schema({
    user_ID: {type: String, required: true},
    user_name: String,
    email: String,
    bills: [childSchema ]
})
const Users = mongoose.model('Users', userSchema)

//UsersInput
//read ****should not be available to users*****
app.get('/user/secretRoute', (req, res) => {
    Users.find({}, function (err, result) {
            console.log(err)
    })
    .then(User => res.json({ User }))
})

//read **user specific**
app.get('/user/:userID', (req, res) => {
    Users.find({ user_ID: req.params.userID }, function (err, result) {
        console.log(err)
    })
    .then(user => res.status(201).json({ user }))
})

//read_single_bill
app.get('/bills/:user/:id', (req,res) => {
    Users.findById(req.params.user, (err, user) => {
        let bill = user.bills.id(req.params.id)
        res.status(201).json({ bill })
    })
})

// create || udate user
app.post('/user/:id', (req,res) => {
    var options = { upsert: true, new: true, setDefaultsOnInsert: true };
    Users.findOneAndUpdate({ user_ID: req.params.id}, req.body, options, function (err, result) {
        console.log(err)
    })
    .then(newUser => res.status(201).json({ newUser }))
})

//add_bill
app.put('/bills/add/:id', (req, res) => {
    Users.updateOne(
        { user_ID: req.params.id }, 
        { $push: { "bills": req.body }}
    )
    .then(updatedContent => res.status(201).json({ updatedContent}))
    
})


//update_bill_fields
app.put('/bills/update/:user/:id', (req, res) => {
    Users.updateOne(
        { user_ID: req.params.user, "bills._id": req.params.id},
        { $set: req.body })
    .then(updatedContent => res.status(201).json({ updatedContent }))
})

//delete_user
app.delete('/user/:id', (req, res) => {
    Users.deleteOne({ user_ID: req.params.id })
        .then(deletedContent => res.status(201).json({ deletedContent }))
})

//delete_bill (single)
app.delete('/bills/:user/:id', (req, res) => {
    Users.updateOne(
        { user_ID: req.params.user },
        { $pull: { "bills": { _id: req.params.id }}})
    .then(updatedContent => res.status(201).json({ updatedContent }))
})

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err })
})

app.use((req, res, next) => {
    res.status(404).json({ error: { message: 'Not Found!' }})
})

app.listen(port, listener)