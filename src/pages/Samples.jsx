import { useState, useRef, useEffect } from 'react';
import propTypes from 'prop-types';
import { FaPlay, FaPause, FaTrashAlt, FaAngleDoubleLeft, FaAngleDoubleRight, FaPlus } from 'react-icons/fa';
import { FiDownload } from "react-icons/fi";
import { TiPencil } from "react-icons/ti";
import { IoSearch, IoFilter, IoMusicalNotes } from 'react-icons/io5';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle';
import { API_Endpoint, Asset_Endpoint, Per_Page } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import { Slide, toast } from 'react-toastify';
import ConfirmationModal from '../components/ConfirmationModal';
import Loading from '../components/Loading';

const Samples = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [samples, setSamples] = useState([]);
    const [isPlaying, setIsPlaying] = useState({ before: null, after: null });
    const [durations, setDurations] = useState({});
    const [currentTimes, setCurrentTimes] = useState({});
    const [dragging, setDragging] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [sampleDelete, setSampleDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [newSample, setNewSample] = useState({
        name: '',
        before_audio: null,
        after_audio: null,
        is_active: true
    });

    const audioRefs = useRef({});
    const progressBarRefs = useRef({});
    const abortController = useRef(null);

    useEffect(() => {
        fetchSamples();
    }, [currentPage, filter]);

    const fetchSamples = async () => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();

        setLoading(true);
        let url = `${API_Endpoint}admin/sample-audios?page=${currentPage + 1}&per_page=${Per_Page}`;
        if (filter === 'active') {
            url += '&is_active=active';
        } else if (filter === 'inactive') {
            url += '&is_active=inactive';
        }

        try {
            const response = await axios({
                url: url,
                method: 'get',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                },
                signal: abortController.current.signal,
            });
            setSamples(response.data.data);
            setTotalPages(response.data.last_page);
            setLoading(false);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            } else {
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
                console.error('Error fetching samples:', error);
                toast.error('Error fetching samples', {
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
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        samples.forEach(sample => {
            const beforeRef = audioRefs.current[`before_${sample.id}`];
            const afterRef = audioRefs.current[`after_${sample.id}`];

            if (beforeRef) {
                beforeRef.onloadedmetadata = () => {
                    setDurations(prev => ({
                        ...prev,
                        [`before_${sample.id}`]: beforeRef.duration,
                        [`after_${sample.id}`]: afterRef?.duration,
                    }));
                };

                beforeRef.ontimeupdate = () => {
                    setCurrentTimes(prev => ({
                        ...prev,
                        [`before_${sample.id}`]: beforeRef.currentTime,
                        [`after_${sample.id}`]: afterRef?.currentTime,
                    }));
                };
            }

            if (afterRef) {
                afterRef.onloadedmetadata = () => {
                    setDurations(prev => ({
                        ...prev,
                        [`before_${sample.id}`]: beforeRef?.duration,
                        [`after_${sample.id}`]: afterRef.duration,
                    }));
                };

                afterRef.ontimeupdate = () => {
                    setCurrentTimes(prev => ({
                        ...prev,
                        [`before_${sample.id}`]: beforeRef?.currentTime,
                        [`after_${sample.id}`]: afterRef.currentTime,
                    }));
                };
            }
        });
    }, [samples]);

    const togglePlay = (type, id) => {
        const otherType = type === 'before' ? 'after' : 'before';
        const otherId = isPlaying[otherType];

        if (isPlaying[type] === id) {
            audioRefs.current[`${type}_${id}`].pause();
            setIsPlaying(prev => ({ ...prev, [type]: null }));
        } else {
            if (otherId) {
                audioRefs.current[`${otherType}_${otherId}`].pause();
                setIsPlaying(prev => ({ ...prev, [otherType]: null }));
            }
            if (isPlaying[type] !== null) {
                audioRefs.current[`${type}_${isPlaying[type]}`].pause();
            }
            audioRefs.current[`${type}_${id}`].play();
            setIsPlaying(prev => ({ ...prev, [type]: id }));
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleProgress = (type, id, e) => {
        if (dragging[`${type}_${id}`]) {
            const rect = progressBarRefs.current[`${type}_${id}`].getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const newTime = (offsetX / rect.width) * durations[`${type}_${id}`];
            audioRefs.current[`${type}_${id}`].currentTime = newTime;
            setCurrentTimes(prev => ({
                ...prev,
                [`${type}_${id}`]: newTime
            }));
        }
    };

    const handleMouseDown = (type, id) => {
        setDragging(prev => ({ ...prev, [`${type}_${id}`]: true }));
    };

    const handleMouseUp = () => {
        setDragging({});
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleEnded = (type, id) => {
        setCurrentTimes(prev => ({
            ...prev,
            [`${type}_${id}`]: 0
        }));
        setIsPlaying(prev => ({
            ...prev,
            [type]: null
        }));
    };

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    const handleFilterChange = (newFilter) => {
        // Pause all playing audio elements
        Object.values(audioRefs.current).forEach(audio => {
            if (audio) {
                audio.pause();
            }
        });

        // Reset current times
        setCurrentTimes({});
        setDurations({});
        setIsPlaying({ before: null, after: null });

        // Update the filter and reset the current page
        setFilter(newFilter);
        setCurrentPage(0); // Reset to the first page when filter changes
    };

    const openEditModal = (sample = null) => {
        setSelectedSample(sample);
        setNewSample({
            name: sample ? sample.name : '',
            before_audio: sample ? sample.before_audio : null,
            after_audio: sample ? sample.after_audio : null,
            is_active: sample ? sample.is_active == "1" : true
        });
        setEditModalIsOpen(true);
    };

    const closeEditModal = () => {
        setSelectedSample(null);
        setEditModalIsOpen(false);
        setNewSample({ name: '', before_audio: null, after_audio: null, is_active: true });
    };

    const deleteSample = async () => {
        if (!sampleDelete) return;
        setIsDeleting(true);
        const id = toast.loading('Deleting sample...', {
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
                url: `${API_Endpoint}admin/sample-audios/${sampleDelete.id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            toast.dismiss(id);
            toast.success('Sample deleted successfully', {
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
            fetchSamples();
            closeConfirmationModal();
        } catch (error) {
            toast.dismiss(id);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error deleting sample:', error);
            toast.error('Error deleting sample', {
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

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        setNewSample(prev => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const handleUpdateSample = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('name', newSample.name);
        if (newSample.before_audio instanceof File) {
            formData.append('before_audio', newSample.before_audio);
        }
        if (newSample.after_audio instanceof File) {
            formData.append('after_audio', newSample.after_audio);
        }
        formData.append('is_active', newSample.is_active ? 1 : 0);

        setUploading(true);
        const id = toast.loading(selectedSample ? 'Updating sample...' : 'Uploading sample...', {
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
            let response;
            if (selectedSample) {
                formData.append('_method', 'PUT');
                response = await axios({
                    method: 'post',
                    url: `${API_Endpoint}admin/sample-audios/${selectedSample.id}`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    data: formData
                });
                setSamples(samples.map(sample => sample.id === selectedSample.id ? response.data : sample));
            } else {
                response = await axios({
                    method: 'post',
                    url: `${API_Endpoint}admin/sample-audios`,
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    data: formData
                });
                setSamples([...samples, response.data]);
            }

            toast.dismiss(id);
            toast.success(selectedSample ? 'Sample updated successfully' : 'Sample uploaded successfully', {
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
            setUploading(false);
            closeEditModal();
            fetchSamples();
        } catch (error) {
            toast.dismiss(id);
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error saving sample:', error);
            setUploading(false);
            toast.error('Error saving sample', {
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
        }
    };

    const openConfirmationModal = (sample) => {
        setSampleDelete(sample);
        setConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setSampleDelete(null);
        setConfirmationModalOpen(false);
    };

    return (
        <div className="page-container dark-bg animated-bg">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="page-title dark-text">Sample Management</h1>
                        <p className="page-subtitle dark-text-secondary">Upload and manage audio samples with before/after comparison</p>
                    </div>
                    <button
                        onClick={() => openEditModal()}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FaPlus className="w-4 h-4 mr-2" />
                        <span>Upload Sample</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="dark-card search-filters-container">
                    <div className="filters-container">
                        <button
                            className={`filter-button ${filter === 'all' ? 'filter-button-active' : 'filter-button-inactive'}`}
                            onClick={() => handleFilterChange('all')}
                        >
                            All Samples
                        </button>
                        <button
                            className={`filter-button ${filter === 'active' ? 'filter-button-active' : 'filter-button-inactive'}`}
                            onClick={() => handleFilterChange('active')}
                        >
                            Active Samples
                        </button>
                        <button
                            className={`filter-button ${filter === 'inactive' ? 'filter-button-active' : 'filter-button-inactive'}`}
                            onClick={() => handleFilterChange('inactive')}
                        >
                            Inactive Samples
                        </button>
                    </div>
                </div>
            </div>

            {/* Samples List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loading />
                </div>
            ) : (
                samples.length !== 0 ? (
                    <div className="space-y-4">
                        {samples.map((sample) => (
                            <div key={sample.id} className="dark-card">
                                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                                    {/* Sample Title */}
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                <IoMusicalNotes className="text-white text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold dark-text">{sample.name}</h3>
                                                <p className="text-sm dark-text-secondary">Audio Sample</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audio Players */}
                                    <div className="flex flex-col lg:flex-row items-center gap-6 w-full lg:w-auto">
                                        <AudioPlayer
                                            type="before"
                                            sample={sample}
                                            audioRefs={audioRefs}
                                            progressBarRefs={progressBarRefs}
                                            currentTimes={currentTimes}
                                            durations={durations}
                                            isPlaying={isPlaying}
                                            togglePlay={togglePlay}
                                            handleProgress={handleProgress}
                                            handleMouseDown={handleMouseDown}
                                            handleEnded={handleEnded}
                                            formatTime={formatTime}
                                        />
                                        <AudioPlayer
                                            type="after"
                                            sample={sample}
                                            audioRefs={audioRefs}
                                            progressBarRefs={progressBarRefs}
                                            currentTimes={currentTimes}
                                            durations={durations}
                                            isPlaying={isPlaying}
                                            togglePlay={togglePlay}
                                            handleProgress={handleProgress}
                                            handleMouseDown={handleMouseDown}
                                            handleEnded={handleEnded}
                                            formatTime={formatTime}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-3">
                                        <button 
                                            onClick={() => openEditModal(sample)}
                                            className="action-button action-button-view"
                                            title="Edit Sample"
                                        >
                                            <TiPencil className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => openConfirmationModal(sample)}
                                            className="action-button action-button-delete"
                                            title="Delete Sample"
                                        >
                                            <FaTrashAlt className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <IoMusicalNotes className="text-4xl" />
                        </div>
                        <h3 className="empty-state-title dark-text">No samples found</h3>
                        <p className="empty-state-description dark-text-secondary">Upload your first audio sample to get started.</p>
                    </div>
                )
            )}

            {/* Pagination */}
            {!loading && samples.length > 0 && (
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

            {/* Upload/Edit Sample Modal */}
            <Modal
                isOpen={editModalIsOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Sample"
                className="modern-modal"
            >
                <div className="max-w-2xl w-full">
                    <h2 className="text-2xl mb-6 font-semibold dark-text">
                        {selectedSample ? 'Edit Sample' : 'Upload Sample'}
                    </h2>
                    <form onSubmit={handleUpdateSample} className="space-y-6">
                        <div>
                            <label className="form-label" htmlFor="name">
                                Sample Title *
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={newSample.name}
                                onChange={(e) => setNewSample({ ...newSample, name: e.target.value })}
                                required={selectedSample ? false : true}
                                placeholder="Enter sample title"
                            />
                        </div>
                        
                        <div>
                            <label className="form-label" htmlFor="before_audio">
                                Before Audio {selectedSample ? '(leave blank to keep existing)' : '*'}
                            </label>
                            <input
                                type="file"
                                name="before_audio"
                                accept="audio/*"
                                className="form-input"
                                onChange={handleFileChange}
                                required={selectedSample ? false : true}
                            />
                        </div>
                        
                        <div>
                            <label className="form-label" htmlFor="after_audio">
                                After Audio {selectedSample ? '(leave blank to keep existing)' : '*'}
                            </label>
                            <input
                                type="file"
                                name="after_audio"
                                accept="audio/*"
                                className="form-input"
                                onChange={handleFileChange}
                                required={selectedSample ? false : true}
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <label className="form-label">Status:</label>
                            <Toggle
                                checked={newSample.is_active}
                                onChange={() => setNewSample({ ...newSample, is_active: !newSample.is_active })}
                                icons={false}
                                aria-label="Sample status"
                                className="modern-toggle"
                            />
                            <span className="text-sm dark-text-secondary">
                                {newSample.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={closeEditModal}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={uploading}
                            >
                                {uploading ? 'Saving...' : (selectedSample ? 'Update Sample' : 'Upload Sample')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={deleteSample}
                title="Delete Sample"
                message="Are you sure you want to delete this sample? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
};

const AudioPlayer = ({
    type,
    sample,
    audioRefs,
    progressBarRefs,
    currentTimes,
    durations,
    isPlaying,
    togglePlay,
    handleProgress,
    handleMouseDown,
    handleEnded,
    formatTime
}) => (
    <div className="flex flex-col gap-3 items-center w-full lg:w-64">
        <div className='w-full flex justify-between items-center'>
            <span className="text-sm font-medium dark-text capitalize">{type}</span>
            <span className="text-sm dark-text-secondary font-mono">
                {formatTime(currentTimes[`${type}_${sample.id}`] || 0)} / {formatTime(durations[`${type}_${sample.id}`] || 0)}
            </span>
        </div>
        <div className='w-full flex items-center gap-3'>
            <button 
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center justify-center rounded-xl shadow-sm transition-all duration-200" 
                onClick={() => togglePlay(type, sample.id)}
            >
                {isPlaying[type] === sample.id ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
            </button>
            <audio 
                ref={el => audioRefs.current[`${type}_${sample.id}`] = el} 
                src={Asset_Endpoint + sample[`${type}_audio`]} 
                onEnded={() => handleEnded(type, sample.id)} 
            />
            <div
                className="flex-1 relative h-3 bg-gray-600 rounded-full cursor-pointer"
                ref={el => progressBarRefs.current[`${type}_${sample.id}`] = el}
                onMouseMove={(e) => handleProgress(type, sample.id, e)}
                onMouseDown={() => handleMouseDown(type, sample.id)}
            >
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-200"
                    style={{ width: `${(currentTimes[`${type}_${sample.id}`] || 0) / (durations[`${type}_${sample.id}`] || 1) * 100}%` }}
                ></div>
                <div
                    className="absolute top-1/2 left-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-sm hover:scale-110 transition-all duration-200"
                    style={{ left: `${(currentTimes[`${type}_${sample.id}`] || 0) / (durations[`${type}_${sample.id}`] || 1) * 100}%` }}
                    onMouseDown={() => handleMouseDown(type, sample.id)}
                ></div>
            </div>
        </div>
    </div>
);

AudioPlayer.propTypes = {
    type: propTypes.string.isRequired,
    sample: propTypes.object.isRequired,
    audioRefs: propTypes.object.isRequired,
    progressBarRefs: propTypes.object.isRequired,
    currentTimes: propTypes.object.isRequired,
    durations: propTypes.object.isRequired,
    isPlaying: propTypes.object.isRequired,
    togglePlay: propTypes.func.isRequired,
    handleProgress: propTypes.func.isRequired,
    handleMouseDown: propTypes.func.isRequired,
    handleEnded: propTypes.func.isRequired,
    formatTime: propTypes.func.isRequired
}

export default Samples;