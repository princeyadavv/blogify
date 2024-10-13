const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog');
const Comment = require('../models/comments');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const router = Router();

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
});

router.get('/add-new', (req, res) => {
  res.render('addBlog', {
    user: req.user,
  });
});

router.post('/', upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  const uniqueSuffix = Date.now().toString() + '-' + req.file.originalname;
  const params = {
    Bucket: process.env.BUCKET,
    Key: uniqueSuffix,
    Body: req.file.buffer,
  };

  try {
    const parallelUploads3 = new Upload({
      client: s3Client,
      params: params,
      queueSize: 4, 
      partSize: 5 * 1024 * 1024, 
    });

    await parallelUploads3.done();

    const coverImageUrl = `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/${uniqueSuffix}`;

    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageUrl: coverImageUrl, 
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error('Error uploading file:', err);
    return res.status(500).send('Error uploading file.');
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id).populate('createdBy');
  const comments = await Comment.find({ blogId: id }).populate('createdBy');
  return res.render('blog', {
    user: req.user,
    blog,
    comments,
  });
});

router.post('/comment/:blogId', async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
