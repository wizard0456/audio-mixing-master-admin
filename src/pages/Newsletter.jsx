import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { IoSearch, IoFilter, IoMail, IoDownload } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';

const Newsletter = () => {
  const dispatch = useDispatch();
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Set initial page to 0
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // State to manage deletion loading
  const [dates, setDates] = useState([null, null]); // Date range state
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchLeads(currentPage + 1);
  }, [currentPage]);

  const fetchLeads = async (page) => {
    setLoading(true);
    try {
      const response = await axios({
        method: 'get',
        url: `${API_Endpoint}lead/generation?page=${page}&per_page=${Per_Page}`,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setLeads(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        dispatch(logout());
      }
      console.error('Error fetching leads', error);
      toast.error('Error fetching leads', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (event) => {
    const selectedPage = event.selected;
    setCurrentPage(selectedPage);
  };

  const openConfirmationModal = (lead) => {
    setLeadToDelete(lead);
    setConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setLeadToDelete(null);
    setConfirmationModalOpen(false);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    const id = toast.loading('Deleting lead...', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "light",
      transition: Slide,
    });
    
    try {
      await axios({
        method: 'delete',
        url: `${API_Endpoint}lead/generation/${leadToDelete.id}`,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      toast.dismiss(id);
      toast.success('Lead deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
      fetchLeads(currentPage + 1);
      closeConfirmationModal();
    } catch (error) {
      toast.dismiss(id);
      if (error.response && error.response.status === 401) {
        dispatch(logout());
      }
      console.error('Error deleting lead:', error);
      toast.error('Error deleting lead', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
      closeConfirmationModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportLeads = async () => {
    if (dates[0] && dates[1]) {
      const startDate = dates[0].toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const endDate = dates[1].toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const apiUrl = `${API_Endpoint}export/lead?start_date=${startDate}&end_date=${endDate}`;

      // Trigger the download
      window.open(apiUrl, '_blank');
    } else {
      toast.error('Please select a valid date range', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    }
  };

  return (
    <div className="page-container dark-bg animated-bg">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="page-title dark-text">Newsletter Management</h1>
            <p className="page-subtitle dark-text-secondary">Manage newsletter leads and export data by date range</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="dark-card search-filters-container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="form-label">Export Date Range:</label>
              <DateRangePicker 
                value={dates} 
                onChange={setDates} 
                className="form-input"
                placeholder="Select date range"
              />
            </div>
            <button
              onClick={handleExportLeads}
              className="btn-primary flex items-center space-x-2"
            >
              <IoDownload className="w-4 h-4" />
              <span>Export Leads</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      ) : (
        leads.length !== 0 ? (
          <div className="dark-card table-container">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">
                      Email Address
                    </th>
                    <th className="table-header-cell">
                      Created At
                    </th>
                    <th className="table-header-cell">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {leads?.map(lead => (
                    <tr key={lead.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <IoMail className="text-white text-lg" />
                          </div>
                          <div>
                            <div className="text-sm font-medium dark-text">{lead.email}</div>
                            <div className="text-sm dark-text-secondary">Newsletter Lead</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell dark-text">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="table-cell">
                        <button 
                          onClick={() => openConfirmationModal(lead)}
                          className="action-button action-button-delete"
                          title="Delete Lead"
                        >
                          <FaTrashAlt className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IoMail className="text-4xl" />
            </div>
            <h3 className="empty-state-title dark-text">No leads found</h3>
            <p className="empty-state-description dark-text-secondary">Newsletter leads will appear here when users subscribe.</p>
          </div>
        )
      )}

      {/* Pagination */}
      {!loading && leads.length > 0 && (
        <div className="mt-6">
          <ReactPaginate
            previousLabel={<FaAngleDoubleLeft />}
            nextLabel={<FaAngleDoubleRight />}
            pageCount={totalPages}
            onPageChange={handlePageClick}
            containerClassName="pagination"
            pageClassName=""
            pageLinkClassName=""
            previousClassName=""
            previousLinkClassName=""
            nextClassName=""
            nextLinkClassName=""
            activeClassName="active"
            disabledClassName="disabled"
            forcePage={currentPage}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message="Are you sure you want to delete this newsletter lead? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

export default Newsletter;