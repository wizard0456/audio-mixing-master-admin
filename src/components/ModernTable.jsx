import React from 'react';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const ModernTable = ({ 
    headers, 
    data, 
    loading, 
    emptyMessage = "No data found", 
    emptyIcon: EmptyIcon, 
    onRowClick, 
    actions = [], 
    rowKey = 'id' 
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    // Ensure data is always an array
    const tableData = Array.isArray(data) ? data : [];

    if (!tableData || tableData.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col items-center justify-center py-12">
                    {EmptyIcon && <EmptyIcon className="w-12 h-12 text-gray-400 mb-4" />}
                    <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    const formatValue = (value, header) => {
        if (header.isName) {
            return (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {value?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{value}</p>
                    </div>
                </div>
            );
        }
        
        if (header.isEmail) {
            return <span className="text-gray-700 font-medium">{value}</span>;
        }
        
        if (header.isDate) {
            return <span className="text-gray-600">{new Date(value).toLocaleDateString()}</span>;
        }
        
        if (header.isStatus) {
            const statusColors = {
                'active': 'bg-green-100 text-green-800',
                'inactive': 'bg-red-100 text-red-800',
                'pending': 'bg-yellow-100 text-yellow-800',
                'completed': 'bg-green-100 text-green-800',
                'processing': 'bg-blue-100 text-blue-800',
                'cancelled': 'bg-red-100 text-red-800'
            };
            const color = statusColors[value?.toLowerCase()] || 'bg-gray-100 text-gray-800';
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                    {value}
                </span>
            );
        }
        
        if (header.isBadge) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value}
                </span>
            );
        }
        
        if (header.isAmount) {
            return <span className="font-semibold text-gray-900">${parseFloat(value || 0).toFixed(2)}</span>;
        }
        
        if (header.isToggle) {
            return header.toggleComponent ? header.toggleComponent(value) : value;
        }
        
        if (header.render) {
            return header.render(value, tableData);
        }
        
        return <span className="text-gray-700">{value}</span>;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                            {headers.map((header, index) => (
                                <th 
                                    key={header.key || index}
                                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    <div className="flex items-center space-x-2">
                                        {header.icon && (
                                            <span className="text-gray-500">
                                                {header.icon}
                                            </span>
                                        )}
                                        <div>
                                            <div className="font-semibold text-gray-900">{header.label}</div>
                                            {header.subtitle && (
                                                <div className="text-xs text-gray-500 font-normal">{header.subtitle}</div>
                                            )}
                                        </div>
                                    </div>
                                </th>
                            ))}
                            {actions.length > 0 && (
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {tableData.map((row, rowIndex) => (
                            <tr 
                                key={row[rowKey] || rowIndex}
                                className={`hover:bg-gray-50 transition-colors duration-200 ${
                                    onRowClick ? 'cursor-pointer' : ''
                                }`}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {headers.map((header, colIndex) => (
                                    <td 
                                        key={header.key || colIndex}
                                        className="px-6 py-4 whitespace-nowrap text-sm"
                                    >
                                        {formatValue(row[header.key], header)}
                                    </td>
                                ))}
                                {actions.length > 0 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            {actions.map((action, actionIndex) => (
                                                <button
                                                    key={actionIndex}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        action.onClick(row);
                                                    }}
                                                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${action.className || 'text-gray-600 hover:bg-gray-100'}`}
                                                    title={action.title}
                                                >
                                                    {action.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModernTable; 