import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    middleName: {
        type: String,
        trim: true,
        default: ''
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    profilePicture: {
        type: String,
        default: '' 
    },
    bio: {
        type: String,
        trim: true,
        default: ''
    },
    organization: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    socialLinks: {
        github: { type: String, trim: true, default: '' },
        linkedin: { type: String, trim: true, default: '' },
        twitter: { type: String, trim: true, default: '' },
        website: { type: String, trim: true, default: '' }
    },
    codingProfiles: {
        codeforces: { type: String, trim: true, default: '' },
        codechef: { type: String, trim: true, default: '' },
        leetcode: { type: String, trim: true, default: '' },
        atcoder: { type: String, trim: true, default: '' }
    }
}, { timestamps: true });

const Profile = mongoose.model('Profile', ProfileSchema);
export default Profile;