const express = require('express')
const router = express.Router()

// Authors Route
router.get('/',(req,res) => {
    res.render('index')



})

router.get('/new',(req,res) => {
    res.render('index')



})

module.exports = router