import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/dashboard.css';
import MultiSelect from '../services/multiselect';

const predefinedTags = [
    "Problem Discussion", "Tutorial", "Contest Analysis", "Time Complexity", "Memory Complexity",
    "User", "Cheating", "Bug", "Feedback",
    "Data Structures", "Graphs", "Dynamic Programming", "Greedy", "Strings", "Sorting", "Searching",
    "Maths", "Number Theory", "Geometry"
];

const Dashboard = () => {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const BLOG_PATH = import.meta.env.VITE_BLOG_PATH; 
                const response = await axios.get(BLOG_PATH);
                setBlogs(response.data);
                setFilteredBlogs(response.data);
            } catch (err) {
                setError('Failed to fetch blog posts.');
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    useEffect(() => {
        let result = blogs;
        if (searchTerm) {
            result = result.filter(blog =>
                blog.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedTags.length > 0) {
            result = result.filter(blog =>
                selectedTags.every(tag => blog.tags.includes(tag))
            );
        }

        setFilteredBlogs(result);
    }, [blogs, searchTerm, selectedTags]);

    if (loading) return <div className="loading-message">Loading blogs...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="all-blogs-container">
            <header className="all-blogs-header">
                <h1>Explore Articles</h1>
                <p>Find tutorials, contest analyses, and discussions from the community.</p>
            </header>

            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Search by title..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="tag-filter">
                    <MultiSelect
                        options={predefinedTags}
                        selected={selectedTags}
                        onChange={setSelectedTags}
                        placeholder="Filter by tags..."
                    />
                </div>
            </div>

            <main className="blog-grid">
                {filteredBlogs.length > 0 ? (
                    filteredBlogs.map(blog => (
                        <article key={blog.slug} className="blog-card">
                            <div className="card-content">
                                <div className="card-tags">
                                    {blog.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                                <h2 className="card-title">
                                    <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                                </h2>
                                <p className="card-excerpt">
                                    {`${blog.content.replace(/<[^>]+>/g, '').substring(0, 120)}...`}
                                </p>
                            </div>
                            <div className="card-footer">
                                <span className="card-author">by {blog.authors[0]?.username || 'Anonymous'}</span>
                                <span className="card-date">
                                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="no-results">
                        <h3>No posts found</h3>
                        <p>Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;