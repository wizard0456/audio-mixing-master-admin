import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaTrashAlt } from 'react-icons/fa';
import { FiDownload } from "react-icons/fi";
import { TiPencil } from "react-icons/ti";
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import Toggle from 'react-toggle'; // Import the react-toggle package
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';
import "react-toggle/style.css"; // Import the react-toggle CSS
import { Slide, toast } from 'react-toastify';

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
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [status, setStatus] = useState(null);
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
        let url = `${API_Endpoint}admin/sample-audios?page=${currentPage + 1}`;
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
                console.log('Request canceled', error.message);
                return;
            } else {
                if (error.response && error.response.status === 401) {
                    dispatch(logout());
                }
                console.error('Error fetching samples:', error);

                setLoading(false);
            }
        }
    };

    useEffect(() => {
        samples.forEach(sample => {
            if (audioRefs.current[`before_${sample.id}`]) {
                audioRefs.current[`before_${sample.id}`].onloadedmetadata = () => {
                    if (audioRefs.current[`before_${sample.id}`]) {
                        setDurations(prevDurations => ({
                            ...prevDurations,
                            [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`].duration,
                            [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`]?.duration,
                        }));
                    }
                };

                audioRefs.current[`before_${sample.id}`].ontimeupdate = () => {
                    if (audioRefs.current[`before_${sample.id}`]) {
                        setCurrentTimes(prevCurrentTimes => ({
                            ...prevCurrentTimes,
                            [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`].currentTime,
                            [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`]?.currentTime,
                        }));
                    }
                };
            }

            if (audioRefs.current[`after_${sample.id}`]) {
                audioRefs.current[`after_${sample.id}`].onloadedmetadata = () => {
                    if (audioRefs.current[`after_${sample.id}`]) {
                        setDurations(prevDurations => ({
                            ...prevDurations,
                            [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`]?.duration,
                            [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`].duration,
                        }));
                    }
                };

                audioRefs.current[`after_${sample.id}`].ontimeupdate = () => {
                    if (audioRefs.current[`after_${sample.id}`]) {
                        setCurrentTimes(prevCurrentTimes => ({
                            ...prevCurrentTimes,
                            [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`]?.currentTime,
                            [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`].currentTime,
                        }));
                    }
                };
            }
        });
    }, [samples]);

    const togglePlay = (type, id) => {
        const otherType = type === 'before' ? 'after' : 'before';
        const otherId = isPlaying[otherType];

        if (isPlaying[type] === id) {
            audioRefs.current[`${type}_${id}`].pause();
            setIsPlaying(prevIsPlaying => ({ ...prevIsPlaying, [type]: null }));
        } else {
            if (otherId) {
                audioRefs.current[`${otherType}_${otherId}`].pause();
                setIsPlaying(prevIsPlaying => ({ ...prevIsPlaying, [otherType]: null }));
            }
            if (isPlaying[type] !== null) {
                audioRefs.current[`${type}_${isPlaying[type]}`].pause();
            }
            audioRefs.current[`${type}_${id}`].play();
            setIsPlaying(prevIsPlaying => ({ ...prevIsPlaying, [type]: id }));
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
            setCurrentTimes(prevCurrentTimes => ({
                ...prevCurrentTimes,
                [`${type}_${id}`]: newTime
            }));
        }
    };

    const handleMouseDown = (type, id) => {
        setDragging(prevDragging => ({ ...prevDragging, [`${type}_${id}`]: true }));
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
        setCurrentTimes(prevCurrentTimes => ({
            ...prevCurrentTimes,
            [`${type}_${id}`]: 0
        }));
        setIsPlaying(prevIsPlaying => ({
            ...prevIsPlaying,
            [type]: null
        }));
    };

    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(0); // Reset to the first page when filter changes
    };


    const openEditModal = (sample) => {
        setSelectedSample(sample);
        setNewSample({
            name: sample.name,
            before_audio: sample.before_audio,
            after_audio: sample.after_audio,
            is_active: sample.is_active === "1"
        });
        setEditModalIsOpen(true);
    };

    const closeEditModal = () => {
        setSelectedSample(null);
        setStatus(null);
        setEditModalIsOpen(false);
        setNewSample({ name: '', before_audio: null, after_audio: null, is_active: true });
    };

    const deleteSample = async (id) => {
        try {
            await axios({
                url: `${API_Endpoint}admin/sample-audios/${id}`,
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            fetchSamples();
        } catch (error) {
            console.error('Error deleting sample:', error);
        }
    };

    const handleFileChange = (event) => {
        const { name, files } = event.target;
        setNewSample((prev) => ({
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
        formData.append('_method', 'PUT');

        setUploading(true);
        try {
            const response = await axios({
                method: 'post',
                url: `${API_Endpoint}admin/sample-audios/${selectedSample.id}`,
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            });
            setSamples(samples.map(sample => sample.id === selectedSample.id ? response.data : sample));
            setUploading(false);
            closeEditModal();
            toast.success("Sample updated successfully!", {
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
            fetchSamples(); // Re-fetch samples to reflect updated data
        } catch (error) {
            if (error.response && error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error updating sample:', error);
            setUploading(false);
            toast.error("Error updating sample.", {
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

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-semibold text-3xl leading-9">Samples</h1>
                <button className="bg-[#4BC500] font-semibold text-base text-white px-5 py-4 rounded-lg" onClick={() => openEditModal()}>Upload Sample</button>
            </div>

            <div className='flex items-center justify-between'>
                <div className="flex gap-4 mb-6">
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'all' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All Samples
                    </button>
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'active' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('active')}
                    >
                        Active Samples
                    </button>
                    <button
                        className={`px-5 py-2 rounded-lg ${filter === 'inactive' ? 'bg-[#0F2005] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handleFilterChange('inactive')}
                    >
                        Inactive Samples
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center">
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                    {samples.map((sample) => (
                        <div key={sample.id} className="bg-[#F6F6F6] flex gap-10 items-center justify-between py-4 px-10 rounded-lg mb-4">
                            <div className='min-w-32'>
                                <div className="font-THICCCBOI-Regular text-[12px] font-normal text-nowrap">Title:</div>
                                <div className="font-THICCCBOI-SemiBold font-semibold text-base text-nowrap">{sample.name}</div>
                            </div>
                            <div className="flex items-center gap-10 w-full">
                                <div className="flex flex-col gap-2 items-center w-1/2 justify-between">
                                    <div className='w-full flex justify-between items-center'>
                                        <span className="mr-2 font-THICCCBOI-Regular text-[12px] font-normal">Before</span>
                                        <span className="ml-2">{formatTime(currentTimes[`before_${sample.id}`] || 0)} / {formatTime(durations[`before_${sample.id}`] || 0)}</span>
                                    </div>
                                    <div className='w-full flex justify-between items-center relative'>
                                        <button className="mr-4 bg-[#DCDCDC] w-8 h-8 flex items-center justify-center rounded-md" onClick={() => togglePlay('before', sample.id)}>
                                            {isPlaying.before === sample.id ? <FaPause /> : <FaPlay />}
                                        </button>
                                        <audio ref={el => audioRefs.current[`before_${sample.id}`] = el} src={Asset_Endpoint + sample.before_audio} onEnded={() => handleEnded('before', sample.id)} />
                                        <div
                                            className="w-full mx-2 relative h-2 bg-gray-300 rounded-lg"
                                            ref={el => progressBarRefs.current[`before_${sample.id}`] = el}
                                            onMouseMove={(e) => handleProgress('before', sample.id, e)}
                                            onMouseDown={() => handleMouseDown('before', sample.id)}
                                        >
                                            <div
                                                className="absolute top-0 left-0 h-full bg-[#001422] rounded-lg"
                                                style={{ width: `${(currentTimes[`before_${sample.id}`] || 0) / (durations[`before_${sample.id}`] || 1) * 100}%` }}
                                            ></div>
                                            <div
                                                className="absolute top-1/2 left-0 border-4 border-black h-5 w-5 bg-[#DCDCDC] rounded-full transform -translate-y-1/2 -translate-x-1/2"
                                                style={{ left: `${(currentTimes[`before_${sample.id}`] || 0) / (durations[`before_${sample.id}`] || 1) * 100}%` }}
                                                onMouseDown={() => handleMouseDown('before', sample.id)}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-center w-1/2 justify-between">
                                    <div className='w-full flex justify-between items-center'>
                                        <span className="mr-2 font-THICCCBOI-Regular text-[12px] font-normal">After</span>
                                        <span className="ml-2">{formatTime(currentTimes[`after_${sample.id}`] || 0)} / {formatTime(durations[`after_${sample.id}`] || 0)}</span>
                                    </div>
                                    <div className='w-full flex justify-between items-center relative'>
                                        <button className="mr-4 bg-[#DCDCDC] w-8 h-8 flex items-center justify-center rounded-md" onClick={() => togglePlay('after', sample.id)}>
                                            {isPlaying.after === sample.id ? <FaPause /> : <FaPlay />}
                                        </button>
                                        <audio ref={el => audioRefs.current[`after_${sample.id}`] = el} src={Asset_Endpoint + sample.after_audio} onEnded={() => handleEnded('after', sample.id)} />
                                        <div
                                            className="w-full mx-2 relative h-2 bg-gray-300 rounded-lg"
                                            ref={el => progressBarRefs.current[`after_${sample.id}`] = el}
                                            onMouseMove={(e) => handleProgress('after', sample.id, e)}
                                            onMouseDown={() => handleMouseDown('after', sample.id)}
                                        >
                                            <div
                                                className="absolute top-0 left-0 h-full bg-[#001422] rounded-lg"
                                                style={{ width: `${(currentTimes[`after_${sample.id}`] || 0) / (durations[`after_${sample.id}`] || 1) * 100}%` }}
                                            ></div>
                                            <div
                                                className="absolute top-1/2 left-0 border-4 border-black h-5 w-5 bg-[#DCDCDC] rounded-full transform -translate-y-1/2 -translate-x-1/2"
                                                style={{ left: `${(currentTimes[`after_${sample.id}`] || 0) / (durations[`after_${sample.id}`] || 1) * 100}%` }}
                                                onMouseDown={() => handleMouseDown('after', sample.id)}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='min-w-20'>
                                <div className="font-THICCCBOI-Regular text-[12px] font-normal text-nowrap">Status:</div>
                                <div className="font-THICCCBOI-SemiBold font-semibold text-base text-nowrap">{sample.is_active == 1 ? "Active" : "Inactive"}</div>
                            </div>
                            <div className="flex items-center gap-6">
                                <button className="bg-[#4BC500] p-1.5 rounded-md"><FiDownload color='white' /></button>
                                <button className="" onClick={() => openEditModal(sample)}><TiPencil color='#969696' /></button>
                                <button className="" onClick={() => deleteSample(sample.id)}><FaTrashAlt color="#FF0000" /></button>
                            </div>
                        </div>
                    ))}
                </>
            )}

            <div className="flex justify-center mt-6">
                <ReactPaginate
                    previousLabel={"« Previous"}
                    nextLabel={"Next »"}
                    breakLabel={"..."}
                    breakClassName={"break-me"}
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    subContainerClassName={"pages pagination"}
                    activeClassName={"active"}
                />
            </div>


            <Modal
                isOpen={editModalIsOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Sample"
            >
                <div>
                    <h2 className="text-2xl mb-4 font-semibold">Edit Sample</h2>
                    <form onSubmit={handleUpdateSample} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Title</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newSample.name}
                                onChange={(e) => setNewSample({ ...newSample, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="before_audio">Before Audio</label>
                            <input
                                type="file"
                                name="before_audio"
                                accept="audio/*"
                                className="w-full px-3 py-2 border rounded-md"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="after_audio">After Audio</label>
                            <input
                                type="file"
                                name="after_audio"
                                accept="audio/*"
                                className="w-full px-3 py-2 border rounded-md"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <p><strong>Status:</strong></p>
                            <Toggle
                                checked={newSample.is_active}
                                onChange={() => setNewSample({ ...newSample, is_active: !newSample.is_active })}
                                icons={false}
                                aria-label="Sample status"
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                className="bg-red-500 font-semibold text-base text-white px-4 py-2 rounded"
                                onClick={closeEditModal}
                                disabled={uploading}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="bg-[#4BC500] font-semibold text-base text-white px-5 py-2 rounded-lg"
                                disabled={uploading}
                            >
                                {uploading ? 'Saving...' : 'Save Sample'}
                            </button>
                        </div>
                    </form>
                    {uploading && (
                        <div className="mt-4 text-center text-gray-500">
                            Loading...
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default Samples;
