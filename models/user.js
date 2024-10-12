const {Schema,model} = require('mongoose')
const {CreateTokerForUser} = require('../services/authentication')

const {randomBytes,createHmac} = require('crypto')

const userSchema = new Schema({
    fullName:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    salt:{
        type:String,
    },
    profileImageurl:{
        type: String,
        default: "/images/default.png",
    },
    role:{
        type: String,
        enum:["USER","ADMIN"],
        default: "USER"
    },
    password:{
        type: String,
        required: true,
    }
},{timestamps: true})

userSchema.pre('save',function(next){
    const user = this
    if(!user.isModified("password")) return
    const salt = randomBytes(16).toString()
    const hashPassword = createHmac('sha256',salt).update(user.password).digest('hex');
    this.salt = salt;
    this.password = hashPassword;
    next()
})
userSchema.static('matchPasswordAndGenerateToken',async function(email,password){
    const user = await this.findOne({email})
    if(!user) throw new Error('user not found')
    const salt = user.salt
    const hashPassword = user.password
    const userProvidedHash = createHmac('sha256',salt).update(password).digest('hex');
    if(hashPassword!==userProvidedHash) throw new Error('Incorrect Password')
const token = CreateTokerForUser(user)
    return token;
})

const User = model('user',userSchema)

module.exports = User