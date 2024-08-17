import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaTrashAlt } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import Loading from '../components/Loading';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [adding, setAdding] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [filter, setFilter] = useState('all');
    const user = useSelector(selectUser);
    const [isDeleting, setIsDeleting] = useState(false);
    const abortController = useRef(null);

    useEffect(() => {
        fetchCategories(currentPage, filter);
    }, [currentPage, filter]);

    const fetchCategories = async (page, filter) => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/categories?page=${page}&per_page=${Per_Page}`;
        if (filter !== 'all') {
            url += `&is_active=${filter}`;
        }

        try {
            const response = await axios({
                method: "get",
                url: url,
                headers: {
                    "Authorization": `Bearer ${user.token}`
                },
                signal: abortController.current.signal,
            });

            setCategories(response.data.data);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                console.error("Error fetching categories", error);
                setLoading(false);
            }
        }
    };

    const handlePageClick = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const openModal = (category = null) => {
        if (category) {
            setCategoryName(category.name);
            setIsActive(category.is_active === "1");
            setEditingCategory(category);
        } else {
            setCategoryName('');
            setIsActive(true);
            setEditingCategory(null);
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setCategoryName('');
        setIsActive(true);
        setEditingCategory(null);
    };

    const handleAddOrUpdateCategory = async (event) => {
        event.preventDefault();
        setAdding(true);
        try {
            if (editingCategory) {
                // Update category
                await axios({
                    method: "put",
                    url: `${API_Endpoint}admin/categories/${editingCategory.id}?name=${categoryName}&is_active=${isActive ? 1 : 0}`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    }
                });
            } else {
                // Add new category
                await axios({
                    method: "post",
                    url: `${API_Endpoint}admin/categories`,
                    headers: {
                        "Authorization": `Bearer ${user.token}`,
                        "Content-Type": "application/json"
                    },
                    data: { name: categoryName, is_active: isActive ? 1 : 0 }
                });
            }
            closeModal();
            fetchCategories(currentPage, filter); // Reload fetching
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
        setIsDeleting(true);
        try {
            await axios({
                method: 'delete',
                url: `${API_Endpoint}admin/categories/${categoryToDelete.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setIsDeleting(false);
            fetchCategories(currentPage, filter); // Reload fetching
            closeConfirmationModal();
        } catch (error) {
            console.error('Error deleting category:', error);
            setIsDeleting(false);
        }
    };

    return (
        <section className='px-5 py-10'>
            <div className="mb-10 flex items-center justify-center bg-[#F6F6F6] py-6 rounded-lg">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Categories</h1>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Categories
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Categories
                    </button>
                    <button
                        className={` font-THICCCBOI-Medium font-medium text-[14px] px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Categories
                    </button>
                </div>
                <button
                    onClick={() => openModal()}
                    className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
                >
                    Add Category
                </button>
            </div>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onRequestClose={closeConfirmationModal}
                onConfirm={handleDeleteCategory}
                message="Are you sure you want to delete this category?"
                isDeleting={isDeleting}
            />

            {loading ? (
                <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                    <Loading />
                </div>
            ) : (
                categories.length !== 0 ? (
                    <table className='w-full border-0'>
                        <thead>
                            <tr>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Name</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Created At</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Status</th>
                                <th className="font-THICCCBOI-SemiBold font-semibold text-left text-base leading-6 px-3 pb-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.id}>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg'>{category.name}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(category.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='px-3 py-5 bg-[#F6F6F6]'>{category.is_active == 1 ? 'Active' : 'Inactive'}</div>
                                    </td>
                                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                                        <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                                            <button onClick={() => openModal(category)}><TiPencil color="#969696" /></button>
                                            <button onClick={() => openConfirmationModal(category)}><FaTrashAlt color="#FF0000" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
                        No categories found
                    </div>
                )
            )}

            {loading || (
                categories.length !== 0 && (
                    <div className="flex justify-center mt-6">
                        <ReactPaginate
                            previousLabel={<FaAngleDoubleLeft />}
                            nextLabel={<FaAngleDoubleRight />}
                            breakLabel={"..."}
                            pageCount={totalPages}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                            forcePage={currentPage - 1}
                        />
                    </div>
                )
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add or Update Category"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">{editingCategory ? 'Update Category' : 'Add Category'}</h2>
                    <form onSubmit={handleAddOrUpdateCategory} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">Category Name</label>
                            <input
                                type="text"
                                name="category"
                                className="w-full px-3 py-2 border rounded-md"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <p><strong>Status:</strong></p>
                            <Toggle
                                checked={isActive}
                                onChange={() => setIsActive(!isActive)}
                                icons={false}
                                aria-label="Category status"
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
                                className="font-THICCCBOI-Medium font-medium text-[14px] bg-[#4BC500] text-white px-5 py-2 rounded-lg"
                                disabled={adding}
                            >
                                {adding ? (editingCategory ? 'Updating...' : 'Adding...') : (editingCategory ? 'Update Category' : 'Add Category')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}

export default Categories;