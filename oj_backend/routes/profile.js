import express from 'express';
import User from '../models/user.js';
import Profile from '../models/Profile.js';
import fetchuser from '../middleware/fetchuser.js';

const router = express.Router();

router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        let profile = await Profile.findOne({ user: user._id });

        if (!profile) {
            const userForProfile = await User.findOne({ username: req.params.username }).select('name');
            const nameParts = userForProfile.name.split(' ');
            const firstName = nameParts[0] || req.params.username;
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ' ';

            profile = new Profile({ 
                user: user._id,
                firstName: firstName,
                lastName: lastName
            });
            await profile.save();
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:username', fetchuser, async (req, res) => {
    const requestedUsername = req.params.username;
    const authenticatedUserId = req.user.id;
    
    try {
        
        const userToUpdate = await User.findById(authenticatedUserId);
        if (!userToUpdate || userToUpdate.username !== requestedUsername) {
            return res.status(403).json({ message: 'User not authorized to update this profile.' });
        }
        const {
            firstName,
            middleName,
            lastName,
            profilePicture,
            bio,
            organization,
            location,
            socialLinks,
            codingProfiles
        } = req.body;
        
        if (!firstName || !lastName) {
            return res.status(400).json({ message: 'First name and last name are required.' });
        }

        const profileFields = {
            user: authenticatedUserId,
            firstName,
            middleName,
            lastName,
            profilePicture,
            bio,
            organization,
            location,
            socialLinks,
            codingProfiles
        };
        
        const profile = await Profile.findOneAndUpdate(
            { user: authenticatedUserId },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;