import React from 'react';

const EmptyState = ({ 
    icon: Icon, 
    title, 
    description 
}) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="empty-state-title dark-text">{title}</h3>
            <p className="empty-state-description">{description}</p>
        </div>
    );
};

export default EmptyState; 