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

  // Export logic
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
    <section className='px-4 py-8 md:px-6 md:py-10'>
      <div className="mb-8 md:mb-10 flex items-center justify-center bg-[#F6F6F6] py-4 md:py-6 rounded-lg">
        <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-7 md:leading-9">Newsletter</h1>
      </div>

      {/* Date Range Picker and Export Button */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col lg:flex-row items-center justify-end mb-6 gap-4">
        <DateRangePicker value={dates} onChange={setDates} className="custom-daterange-picker" />
        <button
          onClick={handleExportLeads}
          className="bg-[#0F2005] font-THICCCBOI-Medium font-medium text-sm md:text-[14px] text-white px-4 md:px-5 py-2 rounded-lg"
        >
          Export Leads
        </button>
      </form>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onRequestClose={closeConfirmationModal}
        onConfirm={handleDeleteLead}
        message="Are you sure you want to delete this lead?"
        isDeleting={isDeleting} // Pass the isDeleting state to modal
      />

      {loading ? (
        <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
          <Loading />
        </div>
      ) : (
        leads.length !== 0 ? (
          <div className="overflow-x-auto">
            <table className='w-full border-0'>
              <thead>
                <tr>
                  <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Email</th>
                  <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Created At</th>
                  <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-4 md:pb-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads?.map(lead => (
                  <tr key={lead.id}>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                      <div className='px-3 py-4 md:py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg'>{lead.email}</div>
                    </td>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                      <div className='px-3 py-4 md:py-5 bg-[#F6F6F6]'>{new Date(lead.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </td>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-4 md:pb-5">
                      <div className='flex gap-2 md:gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                        <button onClick={() => openConfirmationModal(lead)}><FaTrashAlt color="#FF0000" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
            No leads found
          </div>
        )
      )}

      {!loading && leads.length !== 0 && (
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
            forcePage={currentPage}
          />
        </div>
      )}
    </section>
  );
}

export default Newsletter;