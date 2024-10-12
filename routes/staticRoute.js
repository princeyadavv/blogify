const express = require('express')
const router = express.Router()
const Blog = require('../models/blog')
router.get('/',async (req,res)=>{
    const allBlogs = await Blog.find({}).sort('createdAt');
    return res.render("home",{
        user: req.user,
        blogs: allBlogs,
    })
})

module.exports = router