import React, { useState, useRef } from 'react';

const SimpleTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const editorRef = useRef(null);

    const handleFormat = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
    };

    const handleInput = () => {
        if (onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="simple-text-editor border rounded-md">
            {/* Toolbar */}
            <div className="bg-gray-100 p-2 border-b flex flex-wrap gap-1">
                <button
                    type="button"
                    onClick={() => handleFormat('bold')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Bold"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('italic')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Italic"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('underline')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Underline"
                >
                    <u>U</u>
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => handleFormat('insertUnorderedList')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Bullet List"
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('insertOrderedList')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Numbered List"
                >
                    1. List
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <button
                    type="button"
                    onClick={() => handleFormat('justifyLeft')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Align Left"
                >
                    ←
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('justifyCenter')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Align Center"
                >
                    ↔
                </button>
                <button
                    type="button"
                    onClick={() => handleFormat('justifyRight')}
                    className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
                    title="Align Right"
                >
                    →
                </button>
            </div>
            
            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                className="p-3 min-h-[200px] focus:outline-none"
                onInput={handleInput}
                onBlur={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                style={{ 
                    minHeight: '200px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}
                placeholder={placeholder}
            />
        </div>
    );
};

export default SimpleTextEditor; 