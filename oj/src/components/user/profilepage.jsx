import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authContext from '../../contexts/auth/authContext';
import '../stylesheets/profilepage.css';
import { FaPenSquare, FaEye, FaEdit, FaUser, FaLinkedin } from 'react-icons/fa';

const ProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState(null);
    const [detailedProfile, setDetailedProfile] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const { user: loggedInUser } = useContext(authContext);

    const GET_USER_PATH = `${import.meta.env.VITE_GET_USER_PATH}/${username}`;
    const BLOG_PATH = `${import.meta.env.VITE_BLOG_PATH}/${username}`;
    const GET_PROFILE_PATH = `${import.meta.env.VITE_GET_PROFILE_PATH}/${username}`;

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const [userResponse, blogsResponse, profileResponse] = await Promise.all([
                    axios.get(GET_USER_PATH),
                    axios.get(BLOG_PATH),
                    axios.get(GET_PROFILE_PATH).catch(() => ({ data: null }))
                ]);

                setProfileData(userResponse.data);
                setBlogs(Array.isArray(blogsResponse.data) ? blogsResponse.data : []);
                setDetailedProfile(profileResponse.data);

            } catch (err) {
                console.error("Failed to fetch profile data:", err);
                setError('User not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [username, GET_USER_PATH, BLOG_PATH, GET_PROFILE_PATH]);

    if (loading) return <div className="loading-container">Loading profile...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!profileData) return <div className="error-container">Could not load profile data.</div>;

    const profileImageUrl = detailedProfile?.profilePicture || `https://api.dicebear.com/8.x/initials/svg?seed=${profileData.username}`;
    
    return (
        <div className="profile-page-container">
            <header className="profile-header">
                <div className="profile-header-top">
                    <div className="profile-identity">
                        <div className="profile-avatar">
                            <img src={profileImageUrl} alt={`${profileData.username}'s avatar`} />
                        </div>
                        <div className="profile-info-main">
                            <h1>{profileData.name}</h1>
                            <h2>@{profileData.username}</h2>
                        </div>
                    </div>
                    <div className="profile-header-actions">
                        <button className="view-profile-btn" onClick={() => navigate(`/profile/details/${username}`)}>
                            <FaUser /> View Profile
                        </button>
                    </div>
                </div>
                <div className="profile-header-details">
                    {detailedProfile?.organization && <p className="profile-organization">{detailedProfile.organization}</p>}
                    {detailedProfile?.bio && <p className="profile-bio">{detailedProfile.bio}</p>}
                    {detailedProfile?.socialLinks?.linkedin && (
                        <a href={detailedProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="profile-linkedin">
                            <FaLinkedin /> LinkedIn
                        </a>
                    )}
                </div>
            </header>

            <main className="profile-main-content">
                <div className="blog-section-header">
                    <h3>Blog Posts</h3>
                    {loggedInUser?.username === username && (
                        <button className="write-blog-btn" onClick={() => navigate(`/profile/${profileData.username}/new-blog`)}>
                            <FaPenSquare /> Write New Blog
                        </button>
                    )}
                </div>
                <div className="blog-post-list">
                    {blogs.length > 0 ? (
                        blogs.map(blog => (
                            <div key={blog._id} className="blog-post-item">
                               <div>
                                   <h4>{blog.title}</h4>
                                   <p>Published on {new Date(blog.createdAt).toLocaleDateString()}</p>
                               </div>
                               <div className="blog-actions">
                                   <button onClick={() => navigate(`/blog/${blog.slug}`)} className="action-btn view-btn">
                                       <FaEye /> View
                                   </button>
                                   {loggedInUser?.username === username && (
                                       <button onClick={() => navigate(`/profile/${loggedInUser.username}/edit-blog/${blog.slug}`)} className="action-btn edit-btn">
                                           <FaEdit /> Edit
                                       </button>
                                   )}
                               </div>
                            </div>
                        ))
                    ) : (
                        <p>{username} hasn't written any blog posts yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;