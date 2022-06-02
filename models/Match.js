const {Schema,model} = require('mongoose')
const matchschema = new Schema({
    betsfirst: {type: Number, default:1},
    betsdraw: {type: Number, default:1},
    betssec: {type: Number, default:1},
    matchstatus:{type:String}
})
module.exports=model('match',matchschema)