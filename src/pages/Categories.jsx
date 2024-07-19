import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { API_Endpoint } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal'; // Ensure this path is correct

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); // State to manage the category being edited
    const [adding, setAdding] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null); // State to manage the category to be deleted
    const user = useSelector(selectUser);

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage]);

    const fetchCategories = async (page) => {
        setLoading(true);
        try {
            const response = await axios({
                method: "get",
                url: `${API_Endpoint}admin/categories?page=${page}&per_page=2`,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                }
            });
            setCategories(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error("Error fetching categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const openModal = (category = null) => {
        if (category) {
            setCategoryName(category.name);
            setEditingCategory(category);
        } else {
            setCategoryName('');
            setEditingCategory(null);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleAddOrUpdateCategory = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            if (editingCategory) {
                // Update category
                const response = await axios({
                    method: "put",
                    url: `${API_Endpoint}admin/categories/${editingCategory.id}`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    data: { name: categoryName }
                });
                setCategories(prevCategories => 
                    prevCategories.map(cat => 
                        cat.id === editingCategory.id ? response.data : cat
                    )
                );
            } else {
                // Add new category
                await axios({
                    method: "post",
                    url: `${API_Endpoint}admin/categories`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    data: { name: categoryName }
                });
                fetchCategories(currentPage); // Reload fetching
            }
            closeModal();
        } catch (error) {
            console.error(`Error ${editingCategory ? 'updating' : 'adding'} category`, error);
        } finally {
            setAdding(false);
        }
    };

    const openConfirmationModal = (category) => {
        setCategoryToDelete(category);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setCategoryToDelete(null);
        setConfirmationModalOpen(false);
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/categories/${categoryToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchCategories(currentPage); // Reload fetching
            closeConfirmationModal();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Categories</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-base text-white px-5 py-4 rounded-lg"
                >
                    Add Category
                </button>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add or Update Category"
            >
                <h2 className="text-2xl mb-4 font-semibold">{editingCategory ? 'Update' : 'Add'} Category</h2>
                <form onSubmit={handleAddOrUpdateCategory} className="space-y-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                            Category Name
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                            onClick={closeModal}
                            disabled={adding}
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                            disabled={adding}
                        >
                            {adding ? (editingCategory ? 'Updating...' : 'Adding...') : (editingCategory ? 'Update Category' : 'Add Category')}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteCategory}
                message="Are you sure you want to delete this category?"
            />

            <div className='flex items-center justify-between'>
                <div className="flex gap-4 mb-6">
                    <div className="bg-[#0F2005] font-THICCCBOI-SemiBold font-semibold text-[12px] text-white px-5 py-2 rounded-lg flex items-center">
                        Active Services <span className="bg-[#4BC500] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">5</span>
                    </div>
                    <div className="bg-[#E9E9E9] font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Archived <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                    <div className="bg-[#E9E9E9] font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Trash <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center">
                    Loading...
                </div>
            ) : (
                <table className='w-full border-0'>
                    <thead>
                        <tr>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">ID</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Name</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Created At</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Updated At</th>
                            <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{category.id}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{category.name}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(category.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(category.updated_at).toLocaleDateString()}</div>
                                </td>
                                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                    <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                        <button onClick={() => openModal(category)}><TiPencil color="#969696" /></button>
                                        <button onClick={() => openConfirmationModal(category)}><FaTrashAlt color="#FF0000" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="flex justify-center mt-6">
                <ReactPaginate
                    previousLabel={"« Previous"}
                    nextLabel={"Next »"}
                    breakLabel={"..."}
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                />
            </div>
        </>
    );
}

export default Categories;