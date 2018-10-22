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

mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true })

const userSchema = new mongoose.Schema({
    user_name: String,
    email: String,
    bills: [ { 
      name : String, 
      company : String, 
      date : Date, 
      amount : Number, } ]
})
const Users = mongoose.model('Users', userSchema)

//UsersInput
//read
app.get('/content', (req,res) => {
    Users.find({},function(err,result){console.log(err)})
        .then(Content => res.json({Content}))
})

//read **user specific**
app.get('/content/:userID', (req,res)=> {
  Users.find({_id: req.params.userID},function(err,result){console.log(err)})
      .then(user => res.status(201).json({user}))
})

//create_user
app.post('/content', (req, res) => {
  console.log(req.body)
    Users.create(req.body)
        .then(newContent => res.status(201).json({newContent}))
})

//update_user_fields
app.put('/content/:id', (req, res) => {
    Users.update({_id: req.params.id}, { $set: req.body})
        .then(updatedContent => res.status(201).json({updatedContent}))
})

//update_bills_field (add bill)
app.put('/bills/:id', (req, res) => {
    Users.updateOne({_id: req.params.id}, { $push: {"bills":req.body}})
        .then(updatedContent => res.status(201).json({updatedContent}))
})

//delete_user
app.delete('/content/:id', (req, res) => {
    Users.deleteOne({_id: req.params.id})
        .then(deletedContent => res.status(201).json({deletedContent}))
})

//delete_bill (single)
app.delete('/bills/:user/:id', (req, res) => {
    Users.updateOne({_id: req.params.user}, { $pull: {"bills":{_id : req.params.id}}})
        .then(updatedContent => res.status(201).json({updatedContent}))
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500).json({error:err})
})

app.use((req,res,next)=>{
    res.status(404).json({error: {message: 'Not Found!'}})
})

app.listen(port,listener)