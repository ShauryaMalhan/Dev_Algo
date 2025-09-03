import express from 'express';
import User from '../models/user.js';
import Blog from '../models/blog.js';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fetchuser from '../middleware/fetchuser.js';

const router = express.Router();

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const fileName = `blogs/${uuid()}${path.extname(file.originalname)}`;
            cb(null, fileName);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/image', fetchuser, (req, res) => {
    const singleUpload = upload.single('image');
    singleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: 'Server error during image upload.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }
        res.json({ url: req.file.location });
    });
});

router.get('/blog', async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate('authors', 'username') 
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/blog/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const blogs = await Blog.find({ authors: user._id })
            .populate('authors', 'username')
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/blog', fetchuser, async (req, res) => {
    try {
        const { title, content, tags, coAuthorUsernames } = req.body;
        const ownerId = req.user.id;
        const authorIds = [ownerId];
        if (coAuthorUsernames && coAuthorUsernames.length > 0) {
            const coAuthors = await User.find({ username: { $in: coAuthorUsernames } }).select('_id');
            const coAuthorIds = coAuthors.map(author => author._id);
            authorIds.push(...coAuthorIds);
        }
        const newBlog = new Blog({
            title,
            content,
            tags,
            authors: [...new Set(authorIds)], 
        });
        const savedBlog = await newBlog.save();
        res.status(201).json(savedBlog);
    } catch (error) {
        res.status(400).json({ message: 'Error creating blog post', error: error.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug })
            .populate('authors', 'username name');

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }
        res.json(blog);
    } catch (err) {
        console.error("Error fetching blog post:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/:slug', fetchuser, async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }
        if (!blog.authors.includes(req.user.id)) {
            return res.status(403).json({ message: 'User not authorized to delete this post.' });
        }
        await blog.deleteOne();
        res.json({ message: 'Blog post deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/:slug', fetchuser, async (req, res) => {
    try {
        const { title, content, tags, coAuthorUsernames } = req.body;
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }
        const authorIdStrings = blog.authors.map(id => id.toString());
        if (!authorIdStrings.includes(req.user.id)) {
            return res.status(403).json({ message: 'User not authorized to edit this post.' });
        }
        const ownerId = req.user.id;
        const authorIds = [ownerId];
        if (coAuthorUsernames && coAuthorUsernames.length > 0) {
            const coAuthors = await User.find({ username: { $in: coAuthorUsernames } }).select('_id');
            const coAuthorIds = coAuthors.map(author => author._id);
            authorIds.push(...coAuthorIds);
        }
        blog.title = title;
        blog.content = content;
        blog.tags = tags;
        blog.authors = [...new Set(authorIds)];
        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: 'Error updating blog post', error: error.message });
    }
});

router.get('/getuser/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;