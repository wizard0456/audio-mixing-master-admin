import React from 'react';

const DataTable = ({ 
    headers = [], 
    children, 
    loading = false,
    emptyState = null
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="dark-card table-container">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            {headers.map((header, index) => (
                                <th key={index} className="table-header-cell">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {children}
                    </tbody>
                </table>
            </div>
            {emptyState}
        </div>
    );
};

export default DataTable; 