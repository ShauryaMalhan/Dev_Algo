import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/blogdetail.css';


const BlogDetail = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const GET_EDIT_DELETE_BLOG_PATH = import.meta.env.VITE_GET_EDIT_DELETE_BLOG_PATH;
                if (!GET_EDIT_DELETE_BLOG_PATH) {
                    throw new Error("API path is not configured.");
                }
                const response = await axios.get(`${GET_EDIT_DELETE_BLOG_PATH}/${slug}`);
                setBlog(response.data);
            } catch (err) {
                setError('Blog post not found.');
                console.error("Error fetching blog:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return <div className="loading-message">Loading article...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!blog) return <div className="error-message">Blog post not found.</div>;

    const primaryAuthor = blog.authors[0];
    const coAuthors = blog.authors.slice(1);

    return (
        <div className="blog-detail-page">
            <article className="blog-article">
                <header className="blog-header">
                    <h1 className="blog-title">{blog.title}</h1>
                    
                    <div className="blog-meta">
                        <Link className="primary-author" to={`/profile/${primaryAuthor.username}`}>
                            {primaryAuthor.username}
                        </Link>
                        <time className="publish-date" dateTime={blog.createdAt}>
                            {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                    </div>

                    {coAuthors.length > 0 && (
                         <div className="co-authors">
                            <span>With: </span>
                            {coAuthors.map((author, index) => (
                                <span key={author._id}>
                                    <Link to={`/profile/${author.username}`}>{author.username}</Link>
                                    {index < coAuthors.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </div>
                    )}
                </header>
                
                <div 
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </article>
        </div>
    );
};

export default BlogDetail;

