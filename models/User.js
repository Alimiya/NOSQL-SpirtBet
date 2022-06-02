const {Schema,model} = require('mongoose')
const userschema = new Schema({name:{type:String, required:true},
        surname:{type:String, required:true},
        login:{type:String, required:true},
        password:{type:String, required:true},
        email:{type:String, required:true},
        created:{type: Date, default: Date.now},
        role:{type:String, default: 'User'},
        balance:{type:Number, default: 0}
    }
)
module.exports = model('user',userschema)
