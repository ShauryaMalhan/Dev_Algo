import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import authContext from '../../contexts/auth/authContext';
import '../stylesheets/profiledetail.css';
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import { SiCodeforces, SiCodechef, SiLeetcode } from 'react-icons/si';

const ProfileDetailPage = () => {
    const { username } = useParams();
    const { user: loggedInUser } = useContext(authContext);
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef(null);

    const isOwnProfile = loggedInUser && loggedInUser.username === username;

    const GET_PROFILE_PATH = `${import.meta.env.VITE_GET_PROFILE_PATH}/${username}`;
    const VITE_IMAGE_PATH = import.meta.env.VITE_IMAGE_PATH;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(GET_PROFILE_PATH);
                setProfile(response.data);
                setFormData(response.data);
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username, GET_PROFILE_PATH]);

    const handleInputChange = (e, category) => {
        const { name, value } = e.target;
        if (category) {
            setFormData(prev => ({ ...prev, [category]: { ...(prev[category] || {}), [name]: value }}));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        try {
            const response = await axios.post(VITE_IMAGE_PATH, uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'auth-token': localStorage.getItem('authtoken'),
                }
            });
            setFormData(prev => ({ ...prev, profilePicture: response.data.url }));
        } catch (err) {
            setError('Failed to upload image.');
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.firstName?.trim()) {
            errors.firstName = 'First name is required.';
        }
        if (!formData.lastName?.trim()) {
            errors.lastName = 'Last name is required.';
        }
        return errors;
    };

    const handleSave = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            setError('Please fill out all required fields.');
            return;
        }

        setFormErrors({});
        setError('');

        try {
            const response = await axios.put(GET_PROFILE_PATH, formData, {
                headers: { 'auth-token': localStorage.getItem('authtoken') }
            });
            setProfile(response.data);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    if (loading) return <div className="loading-message">Loading profile...</div>;
    if (!profile) return <div className="error-message">{error || "Could not load profile."}</div>;

    const displayData = isEditing ? formData : profile;
    const hasSocialLinks = Object.values(profile.socialLinks || {}).some(link => link);
    const hasCodingProfiles = Object.values(profile.codingProfiles || {}).some(link => link);
    const profileImageUrl = displayData.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${username}`;
    const displayName = [displayData.firstName, displayData.middleName, displayData.lastName].filter(Boolean).join(' ');

    return (
        <div className="profile-container">
            <aside className="profile-sidebar">
                <div className="profile-picture">
                    <img src={profileImageUrl} alt={username} />
                    {isEditing && (
                        <button className="picture-edit-btn" onClick={() => fileInputRef.current.click()}>
                            <FaCamera />
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handlePictureUpload} style={{ display: 'none' }} accept="image/*" />
                </div>
                <h2>{displayName || username}</h2>
                <p className="username-tag">@{username}</p>
                {displayData.organization && <p className="organization">{displayData.organization}</p>}
                {displayData.location && <p className="location">{displayData.location}</p>}
                {isOwnProfile && !isEditing && (
                    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                        <FaEdit /> Edit Profile
                    </button>
                )}
            </aside>

            <main className="profile-main">
                {isEditing ? (
                    <div className="profile-edit-form">
                        {error && <p className="form-error-message">{error}</p>}
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" className={formErrors.firstName ? 'input-error' : ''} value={formData.firstName || ''} onChange={handleInputChange} required />
                                {formErrors.firstName && <span className="error-text">{formErrors.firstName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" className={formErrors.lastName ? 'input-error' : ''} value={formData.lastName || ''} onChange={handleInputChange} required />
                                {formErrors.lastName && <span className="error-text">{formErrors.lastName}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Middle Name (Optional)</label>
                            <input type="text" name="middleName" value={formData.middleName || ''} onChange={handleInputChange} />
                        </div>
                        <div className="form-group"><label>Bio</label><textarea name="bio" placeholder="A short bio about yourself..." value={formData.bio || ''} onChange={handleInputChange}></textarea></div>
                        <div className="form-group"><label>Organization / College</label><input type="text" name="organization" value={formData.organization || ''} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Location</label><input type="text" name="location" placeholder="e.g., City, Country" value={formData.location || ''} onChange={handleInputChange} /></div>
                        <h3 className="form-section-header">Social Links</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>GitHub</label><input type="text" name="github" placeholder="https://github.com/username" value={formData.socialLinks?.github || ''} onChange={(e) => handleInputChange(e, 'socialLinks')} /></div>
                            <div className="form-group"><label>LinkedIn</label><input type="text" name="linkedin" placeholder="https://linkedin.com/in/username" value={formData.socialLinks?.linkedin || ''} onChange={(e) => handleInputChange(e, 'socialLinks')} /></div>
                            <div className="form-group"><label>Twitter</label><input type="text" name="twitter" placeholder="https://twitter.com/username" value={formData.socialLinks?.twitter || ''} onChange={(e) => handleInputChange(e, 'socialLinks')} /></div>
                            <div className="form-group"><label>Website</label><input type="text" name="website" placeholder="https://yourwebsite.com" value={formData.socialLinks?.website || ''} onChange={(e) => handleInputChange(e, 'socialLinks')} /></div>
                        </div>
                        <h3 className="form-section-header">Coding Profiles</h3>
                        <div className="form-grid">
                            <div className="form-group"><label>Codeforces</label><input type="text" name="codeforces" placeholder="https://codeforces.com/profile/username" value={formData.codingProfiles?.codeforces || ''} onChange={(e) => handleInputChange(e, 'codingProfiles')} /></div>
                            <div className="form-group"><label>CodeChef</label><input type="text" name="codechef" placeholder="https://www.codechef.com/users/username" value={formData.codingProfiles?.codechef || ''} onChange={(e) => handleInputChange(e, 'codingProfiles')} /></div>
                            <div className="form-group"><label>LeetCode</label><input type="text" name="leetcode" placeholder="https://leetcode.com/username" value={formData.codingProfiles?.leetcode || ''} onChange={(e) => handleInputChange(e, 'codingProfiles')} /></div>
                            <div className="form-group"><label>AtCoder</label><input type="text" name="atcoder" placeholder="https://atcoder.jp/users/username" value={formData.codingProfiles?.atcoder || ''} onChange={(e) => handleInputChange(e, 'codingProfiles')} /></div>
                        </div>
                        <div className="form-actions">
                            <button className="save-btn" onClick={handleSave}><FaSave /> Save Changes</button>
                            <button className="cancel-btn" onClick={() => setIsEditing(false)}><FaTimes /> Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="profile-section">
                            <h3>About Me</h3>
                            <p className="bio-text">{profile.bio || `${username} has not added a bio yet.`}</p>
                        </div>
                        {hasSocialLinks && (
                            <div className="profile-section">
                                <h3>Links</h3>
                                <div className="links-grid">
                                    {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"><FaGithub /> GitHub</a>}
                                    {profile.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedin /> LinkedIn</a>}
                                    {profile.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer"><FaTwitter /> Twitter</a>}
                                    {profile.socialLinks?.website && <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer"><FaGlobe /> Website</a>}
                                </div>
                            </div>
                        )}
                        {hasCodingProfiles && (
                            <div className="profile-section">
                                <h3>Coding Profiles</h3>
                                <div className="links-grid">
                                    {profile.codingProfiles?.codeforces && <a href={profile.codingProfiles.codeforces} target="_blank" rel="noopener noreferrer"><SiCodeforces /> Codeforces</a>}
                                    {profile.codingProfiles?.codechef && <a href={profile.codingProfiles.codechef} target="_blank" rel="noopener noreferrer"><SiCodechef /> CodeChef</a>}
                                    {profile.codingProfiles?.leetcode && <a href={profile.codingProfiles.leetcode} target="_blank" rel="noopener noreferrer"><SiLeetcode /> LeetCode</a>}
                                    {profile.codingProfiles?.atcoder && <a href={profile.codingProfiles.atcoder} target="_blank" rel="noopener noreferrer"> AtCoder</a>}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default ProfileDetailPage;