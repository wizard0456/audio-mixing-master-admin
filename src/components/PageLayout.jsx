import React from 'react';
import { IoSearch, IoFilter } from 'react-icons/io5';

const PageLayout = ({ 
    title, 
    subtitle, 
    children, 
    searchQuery, 
    onSearchChange, 
    searchPlaceholder,
    filters = [],
    onFilterChange,
    currentFilter,
    actionButton = null
}) => {
    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">{title}</h1>
                        <p className="page-subtitle dark-text-secondary">{subtitle}</p>
                    </div>
                    {actionButton}
                </div>

                {/* Search and Filters */}
                <div className="dark-card p-6 search-filters-container">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search */}
                        <div className="search-input-container">
                            <IoSearch className="search-icon dark-text-muted" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={onSearchChange}
                                className="modern-input search-input"
                            />
                        </div>

                        {/* Filters */}
                        {filters.length > 0 && (
                            <div className="filters-container">
                                <IoFilter className="dark-text-muted w-4 h-4" />
                                {filters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        className={`filter-button ${
                                            currentFilter === filter.value 
                                                ? 'filter-button-active' 
                                                : 'filter-button-inactive'
                                        }`}
                                        onClick={() => onFilterChange(filter.value)}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {children}
        </div>
    );
};

export default PageLayout; 