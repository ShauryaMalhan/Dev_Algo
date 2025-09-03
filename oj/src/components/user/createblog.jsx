import { useState, useContext, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import authContext from '../../contexts/auth/authContext';
import '../stylesheets/createblog.css';
import MultiSelect from '../services/multiselect';

const predefinedTags = [
    "Problem Discussion", "Tutorial", "Contest Analysis", "Time Complexity", "Memory Complexity",
    "User", "Cheating", "Bug", "Feedback",
    "Data Structures", "Graphs", "Dynamic Programming", "Greedy", "Strings", "Sorting", "Searching",
    "Maths", "Number Theory", "Geometry"
];

const CreateBlog = () => {
    const navigate = useNavigate();
    const { user: loggedInUser } = useContext(authContext);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [coAuthorInput, setCoAuthorInput] = useState('');
    const [coAuthors, setCoAuthors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const quillRef = useRef(null);
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: function () {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                            alert('Image size should not exceed 5 MB.');
                            return;
                        }
                        const formData = new FormData();
                        formData.append('image', file);

                        try {
                            const IMAGE_PATH = import.meta.env.VITE_IMAGE_PATH;
                            const res = await axios.post(IMAGE_PATH, formData, {
                                headers: {
                                    'auth-token': localStorage.getItem('authtoken'),
                                    'Content-Type': 'multipart/form-data'
                                }
                            });

                            const imageUrl = res.data.url;

                            if (quillRef.current) {
                                const quill = quillRef.current.getEditor();
                                const range = quill.getSelection(true);
                                quill.insertEmbed(range.index, 'image', imageUrl);
                            }
                        } catch (err) {
                            alert('Failed to upload image. Please try again.');
                        }
                    };
                }
            }
        }
    }), []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const blogData = {
                title,
                content,
                tags,
                coAuthorUsernames: coAuthors,
            };

            const BLOG_PATH = import.meta.env.VITE_BLOG_PATH;

            await axios.post(BLOG_PATH, blogData, {
                headers: { 'auth-token': localStorage.getItem('authtoken') }
            });
            navigate(`/profile/${loggedInUser.username}`);
        } catch (err) {
            setError('Failed to create blog post. Please check all fields.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-blog-container">
            <h1>Create a New Blog Post</h1>
            <form onSubmit={handleSubmit} className="blog-form">
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
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Publishing...' : 'Publish Post'}
                </button>
            </form>
        </div>
    );
};

export default CreateBlog;

