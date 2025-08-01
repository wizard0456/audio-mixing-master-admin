import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEye, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from 'react-modal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';

const ContactForm = () => {
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
      console.error('Error fetching leads', error);
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
    try {
      await axios({
        method: 'delete',
        url: `${API_Endpoint}contact/lead/generation/${leadToDelete.id}`,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      fetchLeads(currentPage + 1);
      closeConfirmationModal();
      toast.success('Lead deleted successfully!', {
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
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Error deleting lead.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Form Management</h1>
            <p className="text-gray-600">View and manage contact form submissions from users</p>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-semibold text-sm">
                              {lead.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={lead.message}>
                          {lead.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(lead)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-xl">C</span>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contact leads found</h3>
            <p className="mt-1 text-sm text-gray-500">Contact form submissions will appear here when users submit the form.</p>
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
              <h2 className="text-2xl font-semibold text-gray-900">Lead Details</h2>
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
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h3>
                  <p className="text-sm text-gray-500">Contact Lead</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                    {selectedLead.email}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                    {selectedLead.subject}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg min-h-[100px] whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Received At</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
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
                className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
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