const express=require('express')
const app=express()
const mongoose = require('mongoose')
const route = require('./routes/signin')
const forecastRouter = require('./routes/forecasts')
const paypal = require('paypal-rest-sdk')
const Cookies=require('cookies')
const User = require("./models/User")
const port=process.env.PORT || 3000
var methodOverride = require('method-override')
app.use(methodOverride('_method'))
var keys = ['spirt']
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AS1fpfi6ESeJhFvXbZp2_jNNqffh64FPQPWBWR8LnCNUGys5__1BLu3oaBejm6iPE3E4dWJnpmlPRahy',
    'client_secret': 'EJ3rIU-9zVqJNODahJWW9gbmDW3OY0-8gf-TnHsYjcVtCY2js1MWhI-HXq1dxHUWlUyEzMn_jtq-vPyr'
});
async function start(){
    try{
        await mongoose.connect('mongodb+srv://123:123@bet.t7ijm.mongodb.net/user',{
            useNewUrlParser: true
        })
        server.listen(port, () => {
            console.log(`Example app listening on port`)
        })

    }
    catch (e){
        console.log(e)
    }
}
io.on('connection', (socket) => {
    socket.on('chat message', msg => {
        io.emit('chat message', msg);
    });
});
start()
        app.set('view engine', 'ejs')
        app.set('views')
        app.use(express.static(__dirname + '/public'))
        app.use(express.urlencoded({extended: true}))
        app.use(route)
        app.use('/forecasts', forecastRouter)
        app.get('/', function (req, res) {
            res.render('welcome')
        })
        app.get('/chat', function (req, res) {
            res.render('chat')
        })
        app.get('/logout', function (req, res) {
            res.redirect('/')
        })
        app.get('/main', function (req, res) {
            res.render('main')
        })
        app.get('/stands', function (req, res) {
            res.render('stands')
        })
        app.get('/profile', function (req, res) {
            res.render('profile')
        })
        app.get('/errorPage', function (req, res) {
            res.render('errorPage')
        })
        app.get('/efl-stands', function (req, res) {
            res.render('efl-stands')
        })
        app.get('/bundes', function (req, res) {
            res.render('bundes')
        })
        app.get('/laliga', function (req, res) {
            res.render('laliga')
        })
        app.get('/serie_a', function (req, res) {
            res.render('serie_a')
        })

        app.get('/about', function (req, res) {
            res.render('about')
        })
app.get('/forecasts/indexuser', function (req, res) {
    res.render('forecasts/indexuser')
})
app.get('/forecasts/showuser', function (req, res) {
    res.render('forecasts/showuser')
})
app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    })
})
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) {
            console.log(error.response)
            throw error
        } else {
            let cookies=new Cookies(req,res,{keys:keys})
            let logi=cookies.get('logi')
            const amount = 25
            await User.updateOne({login:logi},{$inc:{balance:amount}})
            res.redirect('/profile')
        }
    })
})
app.get('/cancel', (req, res) => res.render('cancel'))
