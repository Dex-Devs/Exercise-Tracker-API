const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');

// db models
const User = require('./model/user');
const Exercise = require('./model/exercise');

// dotenv
require('dotenv').config()

// db connection
mongoose.connect(
  process.env.DB_URI,
  {useUnifiedTopology: true, useNewUrlParser:true})
  .then(() => {
    console.log("Database connection established.")
  })
  .catch((err) => {
    console.log(process.env.PORT)
    throw err;
  })

// middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json())

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// return all users
app.get("/api/users", (req, res) => {
  User.find() // all
    .then(data => {
      res.json(data)
    })
})

// create new user 
app.post("/api/users", (req, res) => {
  const username = req.body.username

  // register user
  const newUser = new User({
    username
  })
  newUser.save()
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      throw err;
    })
})

// create exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const id = req.params._id;
  const {description, duration, date} = req.body;
  
  User.findById(id)
    .then(userData => {
      // user found
      // register new exercise
      const user_exercise = new Exercise({
        userId: id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      })

      // save exercise
      user_exercise.save()
        .then(exercise_data => {
          const {description, duration, date} = exercise_data
          res.json({
            username: userData.username,
            description,
            duration,
            date: date.toDateString(),
            _id: userData._id
          })
        })
        .catch(() => {
          res.send("Could not save data.");
        })
    })
    .catch(() => {
      res.send("User not found.");
    })
})

// get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const {from, to, limit} = req.query;

  User.findById(id)
    .then(user => {
      // find user exercies
      // set filter for date
      let dateFilter = {};
      if(from) {
         dateFilter['$gte'] = new Date(from)
      }

      if(to) {
        dateFilter['$lte'] = new Date(to)
      }
      
      let filterObj = {
        userId: id
      }

      if(from || to) {
        filterObj.date = dateFilter;
      }


      let nonNullLimit = limit ? limit : 500;
          Exercise.find(filterObj).limit(+nonNullLimit).exec()
        .then(data => {
          let rawData = data
          let count = data.length
          let log = rawData.map(l => {
            return ({
              description: l.description,
              duration: l.duration,
              date: new Date(l.date).toDateString()
            })
          })
          
          let userExercise = {
            username: user.username,
            count: count,
            _id: user._id,
            log: log
          }
          res.json(userExercise)
        })
        .catch(()=> {
          res.send("No exercise found.")
        })
    })
    .catch(() => {
      res.send("Could not find user.")
    })
  
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
}) 