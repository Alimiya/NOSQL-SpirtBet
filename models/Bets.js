const {Schema,model} = require('mongoose')
const betsschema = new Schema({matchid:{type:Number},
login:{type:String},
bet:{type:String},
amount:{type:Number},
coef:{type:Number},
status:{type:String, default:'Waiting'}
})
module.exports = model('bet', betsschema)