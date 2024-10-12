require('dotenv').config();

//modules-installed
const express = require('express')
const path = require("path")
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

//modules-userdefined
const userRoute = require('./routes/user')
const blogRoute = require('./routes/blog')
const staticRouter = require('./routes/staticRoute')
const { checkForAuthCookie } = require('./middlewares/authentication')

//configs
const app = express()
const PORT = process.env.PORT 
mongoose.connect(process.env.MONGO_URI).then(()=> console.log('mongo connected')).catch(err=> console.log(err))


//Middlewares
app.set("view engine","ejs")
app.set("views",path.resolve("./views"))
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.resolve('./public')))
app.use(cookieParser())
app.use(checkForAuthCookie('token'))



//routes
app.use('/',staticRouter)
app.use('/user',userRoute)
app.use('/blog',blogRoute)


app.listen(PORT,()=>{
    console.log(`app running on port:  ${PORT}`)
})