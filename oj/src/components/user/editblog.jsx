import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../stylesheets/createblog.css';
import MultiSelect from '../services/multiselect';
import authContext from '../../contexts/auth/authContext';

const predefinedTags = [
    "Problem Discussion", "Tutorial", "Contest Analysis", "Time Complexity", "Memory Complexity",
    "User", "Cheating", "Bug", "Feedback",
    "Data Structures", "Graphs", "Dynamic Programming", "Greedy", "Strings", "Sorting", "Searching",
    "Maths", "Number Theory", "Geometry"
];

const EditBlog = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user: loggedInUser } = useContext(authContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [coAuthorInput, setCoAuthorInput] = useState('');
    const [coAuthors, setCoAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const quillRef = useRef(null);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);
            
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection(true);
            
            try {
                const IMAGE_PATH = import.meta.env.VITE_IMAGE_PATH;
                const response = await axios.post(IMAGE_PATH, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'auth-token': localStorage.getItem('authtoken'),
                    }
                });

                editor.insertEmbed(range.index, 'image', response.data.url);
                editor.setSelection(range.index + 1);

            } catch (err) {
                console.error('Image upload failed:', err);
                setError('Failed to upload image. Please try again.');
            }
        };
    };
    
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['link', 'image', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
            },
        },
    }), []);

    const GET_EDIT_DELETE_BLOG_PATH = import.meta.env.VITE_GET_EDIT_DELETE_BLOG_PATH;
    useEffect(() => {
        const fetchBlogData = async () => {
            if (!slug) {
                setError("Blog post identifier is missing.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${GET_EDIT_DELETE_BLOG_PATH}/${slug}`);
                const blog = response.data;
                setTitle(blog.title);
                setContent(blog.content);
                setTags(blog.tags || []);
                const authorUsernames = (blog.authors || []).map(author => author.username);
                setCoAuthors(authorUsernames);
            } catch (err) {
                setError('Failed to load blog post for editing.');
            } finally {
                setLoading(false);
            }
        };
        fetchBlogData();
    }, [slug, GET_EDIT_DELETE_BLOG_PATH]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const blogData = { 
                title, 
                content, 
                tags,
                coAuthorUsernames: coAuthors.filter(u => u !== loggedInUser.username)
            };
            await axios.put(`${GET_EDIT_DELETE_BLOG_PATH}/${slug}`, blogData, {
                headers: { 'auth-token': localStorage.getItem('authtoken') }
            });
            navigate(`/blog/${slug}`);
        } catch (err) {
            setError('Failed to update blog post.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this post?')) {
            try {
                await axios.delete(`${GET_EDIT_DELETE_BLOG_PATH}/${slug}`, {
                    headers: { 'auth-token': localStorage.getItem('authtoken') }
                });
                navigate(`/profile/${loggedInUser.username}`);
            } catch (err) {
                setError('Failed to delete blog post.');
            }
        }
    };
    
    const handleAddCoAuthor = () => {
        const usernameToAdd = coAuthorInput.trim();
        if (usernameToAdd && !coAuthors.includes(usernameToAdd) && loggedInUser && usernameToAdd !== loggedInUser.username) {
            setCoAuthors([...coAuthors, usernameToAdd]);
            setCoAuthorInput('');
        }
    };

    const handleRemoveCoAuthor = (usernameToRemove) => {
        setCoAuthors(coAuthors.filter(username => username !== usernameToRemove));
    };

    if (loading) return <div className="loading-message">Loading editor...</div>;

    return (
        <div className="create-blog-container">
            <div className="form-header">
                <h1>Edit Blog Post</h1>
                <button onClick={handleDelete} className="delete-btn-page">Delete Post</button>
            </div>
            <form onSubmit={handleUpdate} className="blog-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Content</label>
                    <ReactQuill 
                        ref={quillRef}
                        theme="snow" 
                        value={content} 
                        onChange={setContent}
                        modules={modules}
                        placeholder="Write something amazing..."
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="tags">Tags</label>
                    <MultiSelect 
                        options={predefinedTags}
                        selected={tags}
                        onChange={setTags}
                        placeholder="Select tags..."
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="coAuthors">Co-authors</label>
                    <div className="co-author-input-group">
                        <input 
                            type="text" 
                            id="coAuthors" 
                            value={coAuthorInput} 
                            onChange={(e) => setCoAuthorInput(e.target.value)}
                            placeholder="Enter username to add co-author..."
                        />
                        <button type="button" onClick={handleAddCoAuthor} className="add-co-author-btn">Add</button>
                    </div>
                    <div className="co-author-list">
                        {coAuthors.map(username => (
                            <div key={username} className="co-author-tag">
                                <span>{username}</span>
                                <button type="button" onClick={() => handleRemoveCoAuthor(username)}>&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className="error-message-form">{error}</p>}
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditBlog;