import { Link } from 'react-router-dom';
import '../stylesheets/footer.css';
// FaTwitter is no longer needed
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-copyright">
                    &copy; {currentYear} PiCode. All Rights Reserved.
                </div>
                
                <div className="footer-links">
                    <Link to="/about">About</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                </div>
                
                <div className="footer-social">
                    <a href="https://github.com/ShauryaMalhan" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <FaGithub />
                    </a>
                    <a href="https://www.linkedin.com/in/shaurya-malhan-573830258/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <FaLinkedin />
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;