const {Router} = require('express')
const router = Router()
const User = require('../models/User')
const Bets = require('../models/Bets')
const Match = require('../models/Match')
const Forecast = require('../models/forecast')
const Cookies=require('cookies')
var session = require('../node_modules/express-session')
var flush = require('../node_modules/connect-flash')
var session = require('../node_modules/express-session')
var flush = require('../node_modules/connect-flash')
var keys = ['spirt']
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
schema.is().min(7).is().max(20).has().uppercase().has().lowercase().has().symbols().has().not().spaces()
router.get('/signin', (req,res)=>{
    res.render('signin')
})

router.use(session({
    secret: 'secret',
    cookie: {maxAge: 60000 },
    resave: false,
    saveUninitialized:false
}));

router.use(flush());
router.post('/signin', async(req,res)=>{
    if(schema.validate(req.body.passw)==true){const user = new User({name:req.body.firstname,
        surname:req.body.lastname,
        login:req.body.username,
        password:req.body.passw,
        email:req.body.mail
    })
        await user.save()
        res.redirect('/login')}
    else{res.redirect('/signin')}
} )
router.get('/forecasts/index', async (req, res) => {
    const forecasts = await Forecast.find().sort({ createdAt: 'desc' })
    res.render('forecasts/index', { forecasts: forecasts })
})
router.get('/forecasts/indexuser',async(req,res)=>{
    const forecasts = await Forecast.find().sort({ createdAt: 'desc' })
    res.render('forecasts/indexuser',{forecasts:forecasts})
})
router.post('forecasts/index',async(req,res)=>{
    if(await Forecast.findOne({role:'admin'})){res.redirect('/forecasts/index')}
    else if(await Forecast.findOne({role:'User'})){res.redirect('/forecasts/indexuser')}
})
router.get('/login', (req,res)=>{
    res.render('login', {message: req.flash('message')})
})
router.post('/login', async (req,res)=>{
    const login = req.body.username
    const pass = req.body.passw
    let cookies=new Cookies(req,res,{keys:keys})
    cookies.set('logi', `${req.body.username}`)
    if(await User.findOne({$and:[{login:login},{password:pass},{role:'admin'}]})){
        res.redirect('/adminpanel')
    }
    else if(await User.findOne({$and:[{login:login},{password:pass},{role:'User'}]})){res.redirect('/greetings')}
    else {
        req.flash('message', 'Username or password is incorrect. Try again')
        res.redirect('login')
    }


})




router.post('/sort_by_names', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    let username = user.login
    User.find({}, function(err, users) {
        res.render('adminpanel',{
            usersinfo:users, username
        })
    }).sort({name:1})
})
router.post('/sort_by_surnames', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    let username = user.login
    User.find({}, function(err, users) {
        res.render('adminpanel',{
            usersinfo:users, username
        })
    }).sort({surname:1})
})
router.post('/deleteuser', async (req,res)=>{
    const login = req.body.username
    await User.deleteOne({login:login})
    res.redirect('/adminpanel')
})
router.post('/updateuser', async (req,res)=>{
    const login = req.body.username
    const name = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    await User.updateOne({login:login},{name:name, surname:lastname,email:email})
    res.redirect('/adminpanel')
})
router.post('/insertuser', async (req,res)=>{
    if(schema.validate(req.body.passw)==true){const user = new User({name:req.body.firstname,
        surname:req.body.lastname,
        login:req.body.username,
        password:req.body.passw,
        email:req.body.mail
    })
        await user.save()
    res.redirect('/adminpanel')
}})
router.get('/greetings', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    let username = user.name
    let date = user.created
    res.render('greetings',{
        username, date
    })
})
router.get('/profile', async (req, res) => {
    let cookies=new Cookies(req,res,{keys:keys})
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    let email = user.email
    let surname = user.surname
    let uname = user.name
    let balance = user.balance
    Bets.find({login:logi}, function(err, bets) {
        res.render('profile',{
            uname,email,surname, balance,betsinfo:bets
        })
    })
})

router.get('/adminpanel', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    let username = user.login
    User.find({}, function(err, users) {
        res.render('adminpanel',{
            usersinfo:users, username
        })
    })
})
router.post('/updateprofile', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let logi=cookies.get('logi')
    const name = req.body.firstname
    const lastname = req.body.lastname
    const email = req.body.email
    await User.updateOne({login:logi},{name:name, surname:lastname,email:email})
    res.redirect('/profile')
})
router.get('/bets', async (req, res)=> {
    let match = await Match.findOne()
    let coef1=((match.betsfirst + match.betsdraw + match.betssec)/match.betsfirst).toFixed(2)
        let coef2=((match.betsfirst + match.betsdraw + match.betssec)/match.betsdraw).toFixed(2)
        let coef3=((match.betsfirst + match.betsdraw + match.betssec)/match.betssec).toFixed(2)
        res.render('bets', {
            coef1,coef2,coef3
    })
})
router.post('/bet1', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let amount = req.body.amount
    let bets= await Match.findOne()
    let coef1=(bets.betsfirst + bets.betsdraw + bets.betssec)/bets.betsfirst
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    if(user.balance<amount){
        res.redirect('/errorPage')
    }
    else{
        await Match.updateOne({},{$inc:{betsfirst:amount}})
        const bet = new Bets({matchid: 1,
            login:logi,
            bet:'Win 1',
            amount:req.body.amount,
            coef:coef1
        })
        if(await bet.save()){
            const amount = req.body.amount
            await User.updateOne({login:logi},{$inc:{balance:-amount}})
            res.redirect('/bets')
        }
    }
})
router.post('/betd', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let amount = req.body.amount
    let bets= await Match.findOne()
    let coef2=(bets.betsfirst + bets.betsdraw + bets.betssec)/bets.betsdraw
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    if(user.balance<amount){
        res.redirect('/errorPage')
    }
    else{
        await Match.updateOne({},{$inc:{betsdraw:amount}})
        const bet = new Bets({matchid: 1,
            login:logi,
            bet:'Draw',
            amount:req.body.amount,
            coef:coef2
        })
        if(await bet.save()){
            const amount = req.body.amount
            await User.updateOne({login:logi},{$inc:{balance:-amount}})
            res.redirect('/bets')
        }
    }
})
router.post('/bet2', async (req,res)=>{
    let cookies=new Cookies(req,res,{keys:keys})
    let amount = req.body.amount
    let bets= await Match.findOne()
    let coef3=(bets.betsfirst + bets.betsdraw + bets.betssec)/bets.betssec
    let logi=cookies.get('logi')
    let user = await User.findOne({login:logi})
    if(user.balance<amount){
        res.redirect('/errorPage')
    }
    else{
        await Match.updateOne({},{$inc:{betssec:amount}})
        const bet = new Bets({matchid: 1,
            login:logi,
            bet:'Win 2',
            amount:req.body.amount,
            coef:coef3
        })
        if(await bet.save()){
            const amount = req.body.amount
            await User.updateOne({login:logi},{$inc:{balance:-amount}})
            res.redirect('/bets')
        }
    }
})
router.get('/checkbets',async (req,res)=>{
    Bets.find({}, function(err, bets) {
        res.render('checkbets',{
            betsinfo:bets
        })
    })
})
// router.post('/decide',async(req,res)=>{
//     let id=req.body.id
//     let stat=req.body.status
//     await Bets.updateOne({_id:id},{status:stat})
//     let bet = await Bets.findOne({_id:id})
//     let login = bet.login
//     let decision = bet.status
//     let amount = bet.amount * bet.coef
//     if(decision == 'won'){
//         await User.updateOne({login:login}, {$inc:{balance:amount}})
//     }
//     res.redirect('/checkbets')
// })

router.post('/decide',async(req,res)=>{
    if(req.body.win1 == 'Win 1'){
        let status = req.body.win1
        await Match.updateOne({},{matchstatus:status})
        await Bets.updateMany({bet:status},{status:'Won'})
        await Bets.updateMany({bet:{$ne:status}},{status:'Lost'})
    }
    else if(req.body.draw == 'Draw'){
        let status = req.body.draw
        await Match.updateOne({},{matchstatus:status})
        await Bets.updateMany({bet:status},{status:'Won'})
        await Bets.updateMany({bet:{$ne:status}},{status:'Lost'})
    }
    else if(req.body.win2 == 'Win 2'){
        let status = req.body.win2
        await Match.updateOne({},{matchstatus:status})
        await Bets.updateMany({bet:status},{status:'Won'})
        await Bets.updateMany({bet:{$ne:status}},{status:'Lost'})
    }
    else{
        res.redirect('/checkbets')
    }
    let bet = await Bets.find({status:'Won'})
    let user = await User.find()
    let amount = bet.amount * bet.coef
    if(decision == 'Won'){
        await User.updateMany({status:'Won'}, {$inc:{balance:amount}})
    }
    res.redirect('/checkbets')

})
router.post('/clear',async (req,res)=>{
    await Match.updateOne({},{betsfirst:100, betsdraw:100 ,betssec:100})
    res.redirect('/adminpanel')
})
module.exports = router
