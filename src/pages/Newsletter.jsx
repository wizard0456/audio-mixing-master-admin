import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEye } from "react-icons/fa";
import ReactPaginate from 'react-paginate';
import { API_Endpoint } from '../utilities/constants';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import Modal from 'react-modal';
import ConfirmationModal from '../components/ConfirmationModal'; // Ensure this path is correct

const Newsletter = () => {
  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null); // State to manage the lead to be deleted
  const user = useSelector(selectUser);

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  const fetchLeads = async (page) => {
    setLoading(true);
    try {
      const response = await axios({
        method: 'get',
        url: `${API_Endpoint}lead/generation?page=${page}`,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      setLeads(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error('Error fetching leads', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  const openModal = (lead) => {
    setSelectedLead(lead);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedLead(null);
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
    try {
      await axios({
        method: 'delete',
        url: `${API_Endpoint}lead/generation/${leadToDelete.id}`,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      fetchLeads(currentPage); // Reload fetching
      closeConfirmationModal();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Newsletter</h1>
      </div>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onRequestClose={closeConfirmationModal}
        onConfirm={handleDeleteLead}
        message="Are you sure you want to delete this lead?"
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Lead Details"
      >
        {selectedLead && (
          <div>
            <h2 className="text-2xl mb-4 font-semibold">Lead Details</h2>
            <p><strong>ID:</strong> {selectedLead.id}</p>
            <p><strong>Email:</strong> {selectedLead.email}</p>
            <p><strong>Created At:</strong> {new Date(selectedLead.created_at).toLocaleDateString()}</p>
            <p><strong>Updated At:</strong> {new Date(selectedLead.updated_at).toLocaleDateString()}</p>
            <button
              type="button"
              className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded mt-4"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="flex justify-center items-center">
          Loading...
        </div>
      ) : (
        <table className='w-full border-0'>
          <thead>
            <tr>
              <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">ID</th>
              <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Email</th>
              <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Created At</th>
              <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Updated At</th>
              <th className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                  <div className='px-3 py-5 bg-[#F6F6F6]'>{lead.id}</div>
                </td>
                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                  <div className='px-3 py-5 bg-[#F6F6F6]'>{lead.email}</div>
                </td>
                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                  <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(lead.created_at).toLocaleDateString()}</div>
                </td>
                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                  <div className='px-3 py-5 bg-[#F6F6F6]'>{new Date(lead.updated_at).toLocaleDateString()}</div>
                </td>
                <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                  <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                    <button onClick={() => openModal(lead)}><FaEye color="#4BC500" /></button>
                    <button onClick={() => openConfirmationModal(lead)}><FaTrashAlt color="#FF0000" /></button>
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

export default Newsletter;
