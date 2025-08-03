import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEye, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { IoSearch, IoFilter, IoPerson, IoMail, IoDocumentText } from 'react-icons/io5';
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from 'react-modal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';

const ContactForm = () => {
  const dispatch = useDispatch();
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Set initial page to 0
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchLeads(currentPage + 1);
  }, [currentPage]);

  const fetchLeads = async (page) => {
    setLoading(true);
    try {
      const response = await axios({
        method: 'get',
        url: `${API_Endpoint}contact/lead/generation?page=${page}&per_page=${Per_Page}`,
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
        url: `${API_Endpoint}contact/lead/generation/${leadToDelete.id}`,
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

  const openModal = (lead) => {
    setSelectedLead(lead);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedLead(null);
  };

  return (
    <div className="page-container dark-bg animated-bg">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="page-title dark-text">Contact Form Management</h1>
            <p className="page-subtitle dark-text-secondary">View and manage contact form submissions from users</p>
          </div>
        </div>
      </div>

      {/* Contact Leads Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loading />
        </div>
      ) : (
        leads.length !== 0 ? (
          <div className="dark-card table-container">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">
                      Name
                    </th>
                    <th className="table-header-cell">
                      Email
                    </th>
                    <th className="table-header-cell">
                      Subject
                    </th>
                    <th className="table-header-cell">
                      Message
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
                  {leads.map(lead => (
                    <tr key={lead.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <IoPerson className="text-white text-lg" />
                          </div>
                          <div className="text-sm font-medium dark-text">{lead.name}</div>
                        </div>
                      </td>
                      <td className="table-cell dark-text">
                        {lead.email}
                      </td>
                      <td className="table-cell dark-text">
                        {lead.subject}
                      </td>
                      <td className="table-cell dark-text">
                        <div className="max-w-xs truncate" title={lead.message}>
                          {lead.message}
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
                          onClick={() => openModal(lead)}
                          className="action-button action-button-view"
                          title="View Details"
                        >
                          <FaEye className="w-5 h-5" />
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
              <IoDocumentText className="text-4xl" />
            </div>
            <h3 className="empty-state-title dark-text">No contact leads found</h3>
            <p className="empty-state-description dark-text-secondary">Contact form submissions will appear here when users submit the form.</p>
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

      {/* Lead Details Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modern-modal"
        overlayClassName="modal-overlay"
      >
        {selectedLead && (
          <div className="max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold dark-text">Lead Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <IoPerson className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold dark-text">{selectedLead.name}</h3>
                  <p className="text-sm dark-text-secondary">Contact Lead</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="form-input bg-gray-700 text-gray-200">
                    {selectedLead.email}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Subject</label>
                  <div className="form-input bg-gray-700 text-gray-200">
                    {selectedLead.subject}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Message</label>
                  <div className="form-input bg-gray-700 text-gray-200 min-h-[100px] whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Received At</label>
                  <div className="form-input bg-gray-700 text-gray-200">
                    {new Date(selectedLead.createdAt).toLocaleDateString("en-US", {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message="Are you sure you want to delete this contact lead? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}

export default ContactForm;