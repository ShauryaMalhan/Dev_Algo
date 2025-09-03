import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaTimes } from 'react-icons/fa';
import '../stylesheets/multiselect.css';

const MultiSelect = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleRemove = (option) => {
        onChange(selected.filter(item => item !== option));
    };

    const validTags = selected.filter(tag => tag?.trim());

    return (
        <div className="multiselect-container" ref={containerRef}>
            <div className="multiselect-input" onClick={() => setIsOpen(!isOpen)}>
                <div className="selected-tags">
                    {validTags.length === 0 ? (
                        <span className="placeholder">{placeholder || 'Select...'}</span>
                    ) : (
                        validTags.map(tag => (
                            <div key={tag} className="tag-pill">
                                {tag}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(tag);
                                    }}
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <FaChevronDown className={`arrow-icon ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
                <div className="options-list">
                    {options.map(option => (
                        <div
                            key={option}
                            className={`option-item ${selected.includes(option) ? 'selected' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            <input type="checkbox" checked={selected.includes(option)} readOnly />
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
