import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaTrashAlt } from 'react-icons/fa';
import { FiDownload } from "react-icons/fi";
import { TiPencil } from "react-icons/ti";
import axios from 'axios';
import { API_Endpoint, Asset_Endpoint } from '../utilities/constants';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../reducers/authSlice';

const Samples = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [samples, setSamples] = useState([]);
    const [isPlaying, setIsPlaying] = useState({ before: null, after: null });
    const [durations, setDurations] = useState({});
    const [currentTimes, setCurrentTimes] = useState({});
    const [dragging, setDragging] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const audioRefs = useRef({});
    const progressBarRefs = useRef({});

    useEffect(() => {
        fetchSamples();
    }, []);

    const fetchSamples = async () => {
        try {
            const response = await axios({
                url: `${API_Endpoint}admin/sample-audios`,
                method: 'get',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            setSamples(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            if (error.response.status === 401) {
                dispatch(logout());
            }
            console.error('Error fetching samples:', error);
        }
    };

    useEffect(() => {
        samples.forEach(sample => {
            if (audioRefs.current[`before_${sample.id}`]) {
                audioRefs.current[`before_${sample.id}`].onloadedmetadata = () => {
                    setDurations(prevDurations => ({
                        ...prevDurations,
                        [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`].duration,
                        [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`].duration,
                    }));
                };

                audioRefs.current[`before_${sample.id}`].ontimeupdate = () => {
                    setCurrentTimes(prevCurrentTimes => ({
                        ...prevCurrentTimes,
                        [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`].currentTime,
                        [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`].currentTime,
                    }));
                };
            }

            if (audioRefs.current[`after_${sample.id}`]) {
                audioRefs.current[`after_${sample.id}`].onloadedmetadata = () => {
                    setDurations(prevDurations => ({
                        ...prevDurations,
                        [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`].duration,
                        [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`].duration,
                    }));
                };

                audioRefs.current[`after_${sample.id}`].ontimeupdate = () => {
                    setCurrentTimes(prevCurrentTimes => ({
                        ...prevCurrentTimes,
                        [`before_${sample.id}`]: audioRefs.current[`before_${sample.id}`].currentTime,
                        [`after_${sample.id}`]: audioRefs.current[`after_${sample.id}`].currentTime,
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-semibold text-3xl leading-9">Samples</h1>
                <button className="bg-[#4BC500] font-semibold text-base text-white px-5 py-4 rounded-lg">Upload Sample</button>
            </div>

            <div className='flex items-center justify-between'>
                <div className="flex gap-4 mb-6">
                    <div className="bg-[#0F2005] font-semibold text-[12px] text-white px-5 py-2 rounded-lg flex items-center">
                        Active Samples <span className="bg-[#4BC500] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">5</span>
                    </div>
                    <div className="bg-[#E9E9E9] font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Archived <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                    <div className="bg-[#E9E9E9] font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Trash <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                </div>
            </div>

            {samples.map((sample) => (
                <div key={sample.id} className="bg-[#F6F6F6] flex gap-10 items-center justify-between py-4 px-10 rounded-lg mb-4">
                    <div className='w-fit'>
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
                                <audio ref={el => audioRefs.current[`before_${sample.id}`] = el} src={Asset_Endpoint+sample.before_audio} onEnded={() => handleEnded('before', sample.id)} />
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
                                <audio ref={el => audioRefs.current[`after_${sample.id}`] = el} src={Asset_Endpoint+sample.after_audio} onEnded={() => handleEnded('after', sample.id)} />
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
                    <div className="flex items-center gap-6">
                        <button className="bg-[#4BC500] p-1.5 rounded-md"><FiDownload color='white' /></button>
                        <button className=""><TiPencil color='#969696' /></button>
                        <button className=""><FaTrashAlt color="#FF0000" /></button>
                    </div>
                </div>
            ))}

            <div className="flex justify-center mt-6">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-[#4BC500] text-white' : 'bg-[#E9E9E9] text-black'}`}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </>
    );
}

export default Samples;