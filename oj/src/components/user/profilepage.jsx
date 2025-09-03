import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authContext from '../../contexts/auth/authContext';
import '../stylesheets/profilepage.css';
import { FaPenSquare, FaEye, FaEdit } from 'react-icons/fa';

const ProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const { user: loggedInUser } = useContext(authContext);

    const GET_USER_PATH = import.meta.env.VITE_GET_USER_PATH;
    const BLOG_PATH = import.meta.env.VITE_BLOG_PATH;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const userApiUrl = `${GET_USER_PATH}/${username}`;
                const userResponse = await axios.get(userApiUrl);
                setProfileData(userResponse.data);

                const blogsApiUrl = `${BLOG_PATH}/${username}`;
                const blogsResponse = await axios.get(blogsApiUrl);
                if (Array.isArray(blogsResponse.data)) {
                    setBlogs(blogsResponse.data);
                }

            } catch (err) {
                console.error("Failed to fetch profile data:", err);
                setError('User not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [username, GET_USER_PATH, BLOG_PATH]);

    if (loading) return <div className="loading-container">Loading profile...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!profileData) return <div className="error-container">Could not load profile data.</div>;

    return (
        <div className="profile-page-container">
            <header className="profile-header">
                <div className="profile-avatar">
                    <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${profileData.username}`} alt={`${profileData.username}'s avatar`} />
                </div>
                <div className="profile-info">
                    <h1>{profileData.name}</h1>
                    <h2>@{profileData.username}</h2>
                </div>
                {loggedInUser.username === username && (
                    <button className="write-blog-btn" onClick={() => navigate(`/profile/${profileData.username}/new-blog`)}>
                        <FaPenSquare /> Write Blog
                    </button>
                )}
            </header>

            <main className="profile-main-content">
                <h3>Blog Posts</h3>
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
                                   {loggedInUser.username === username && (
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

