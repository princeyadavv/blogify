const {Router} = require('express')
const User = require('../models/user')

const router = Router();

router.get('/signin',(req,res)=>{
    return res.render('signin')
})
router.get('/signup',(req,res)=>{
    return res.render('signup')
})
router.post('/signup',async(req,res)=>{
    const {fullName,password,email} = req.body
    await User.create({
        fullName,password,email
    })
    res.redirect("/")
})
router.post('/signin',async(req,res)=>{
    try{

        const {password,email} = req.body
        const token = await User.matchPasswordAndGenerateToken(email,password)
       return res.cookie("token",token).redirect('/')
    }
    catch(err){
        return res.render('signin',{
            error: 'incorrect email or password'
        })

    }
})
router.get('/logout',(req,res)=>{
    res.clearCookie('token').redirect('/')
})

module.exports  = router
