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
    setSelectedLead(null);
    setModalIsOpen(false);
  };

  return (
    <section className='px-5 py-10'>
      <div className="mb-10 flex items-center justify-center bg-[#F6F6F6] py-6 rounded-lg">
        <h1 className="font-THICCCBOI-SemiBold font-semibold text-2xl md:text-3xl leading-9">Contact Leads</h1>
      </div>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onRequestClose={closeConfirmationModal}
        onConfirm={handleDeleteLead}
        message="Are you sure you want to delete this lead?"
        isDeleting={isDeleting}
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Lead Details"
      >
        {selectedLead && (
          <div>
            <h2 className="text-xl text-center md:text-2xl mb-4 font-semibold">Lead Details</h2>
            <div className='flex flex-col items-start gap-3'>
              <p><strong>Name:</strong> {selectedLead.name}</p>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>Subject:</strong> {selectedLead.subject}</p>
              <p><strong>Message:</strong> {selectedLead.message}</p>
              <p><strong>Received At:</strong> {new Date(selectedLead.created_at).toLocaleDateString()}</p>
            </div>
            <button
              type="button"
              className="bg-red-500 font-semibold text-sm md:text-base text-white px-4 py-2 mx-auto block rounded mt-4"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="flex justify-center items-center font-THICCCBOI-SemiBold font-semibold text-base">
          <Loading />
        </div>
      ) : (
        leads.length !== 0
          ? (
            <div className="overflow-x-auto">
              <table className='w-full min-w-[1100px] border-0'>
                <thead>
                  <tr>
                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Name</th>
                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Email</th>
                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Subject</th>
                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Message</th>
                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Created At</th>
                    <th className="font-THICCCBOI-SemiBold font-semibold text-left px-3 text-sm md:text-base leading-6 pb-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6] rounded-tl-lg rounded-bl-lg'>{lead.name}</div>
                      </td>
                      <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6]'>{lead.email}</div>
                      </td>
                      <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6]'>{lead.subject}</div>
                      </td>
                      <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6]'>{lead.message}</div>
                      </td>
                      <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(lead.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="font-THICCCBOI-SemiBold font-semibold text-sm md:text-base leading-6 pb-5">
                        <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6] rounded-tr-lg rounded-br-lg'>
                          <button onClick={() => openModal(lead)}><FaEye color="#4BC500" /></button>
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

      {loading || (
        leads.length !== 0 && (
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
        )
      )}
    </section>
  );
}

export default ContactForm;