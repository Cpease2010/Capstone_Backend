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

app.get('/content/:topic', (req,res)=> {
  Content.find({topic: req.params.topic},'topic subject points',function(err,result){console.log(err)})
      .then(topic => res.status(201).json({topic}))
})

//create
app.post('/content', (req, res) => {
  console.log(req.body)
    Users.create(req.body)
        .then(newContent => res.status(201).json({newContent}))
})

//update
app.put('/content/:id', (req, res) => {
    Users.update({_id: req.params.id}, { $set: req.body})
        .then(updatedContent => res.status(201).json({updatedContent}))
})

//delete
app.delete('/content/:id', (req, res) => {
    Users.deleteOne({_id: req.params.id})
        .then(deletedContent => res.status(201).json({deletedContent}))
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500).json({error:err})
})

app.use((req,res,next)=>{
    res.status(404).json({error: {message: 'Not Found!'}})
})

app.listen(port,listener)