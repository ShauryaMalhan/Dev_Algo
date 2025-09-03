import mongoose from 'mongoose';
import slugify from 'slugify';

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }],
    tags: [String],
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

BlogSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    }
    next();
});

const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;

