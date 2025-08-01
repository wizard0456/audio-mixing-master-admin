import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint, Per_Page } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import { Slide, toast } from 'react-toastify';
import Loading from '../components/Loading';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';

const Newsletter = () => {
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
    setIsDeleting(true); // Start loading state
    try {
      await axios({
        method: 'delete',
        url: `${API_Endpoint}lead/generation/${leadToDelete.id}`,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      fetchLeads(currentPage + 1); // Reload fetching
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
      closeConfirmationModal();
    } finally {
      setIsDeleting(false); // End loading state
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Management</h1>
            <p className="text-gray-600">Manage newsletter leads and export data by date range</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Export Date Range:</label>
              <DateRangePicker 
                value={dates} 
                onChange={setDates} 
                className="custom-daterange-picker"
                placeholder="Select date range"
              />
            </div>
            <button
              onClick={handleExportLeads}
              className="btn-primary flex items-center space-x-2"
            >
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Address
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
                  {leads?.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-semibold text-sm">
                              {lead.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.email}</div>
                            <div className="text-sm text-gray-500">Newsletter Lead</div>
                          </div>
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
                          onClick={() => openConfirmationModal(lead)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-semibold text-xl">N</span>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">Newsletter leads will appear here when users subscribe.</p>
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