import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaTrashAlt } from 'react-icons/fa';
import BeforeAudio from "../assets/audio/before.mp3";
import AfterAudio from "../assets/audio/after.mp3";
import { FiDownload } from "react-icons/fi";
import { TiPencil } from "react-icons/ti";

const Samples = () => {
    const [isPlayingBefore, setIsPlayingBefore] = useState(false);
    const [isPlayingAfter, setIsPlayingAfter] = useState(false);
    const [durationBefore, setDurationBefore] = useState(0);
    const [durationAfter, setDurationAfter] = useState(0);
    const [currentTimeBefore, setCurrentTimeBefore] = useState(0);
    const [currentTimeAfter, setCurrentTimeAfter] = useState(0);
    const [draggingBefore, setDraggingBefore] = useState(false);
    const [draggingAfter, setDraggingAfter] = useState(false);

    const audioBeforeRef = useRef(null);
    const audioAfterRef = useRef(null);
    const progressBarBeforeRef = useRef(null);
    const progressBarAfterRef = useRef(null);

    useEffect(() => {
        if (audioBeforeRef.current) {
            audioBeforeRef.current.onloadedmetadata = () => {
                setDurationBefore(audioBeforeRef.current.duration);
            };
            audioBeforeRef.current.ontimeupdate = () => {
                setCurrentTimeBefore(audioBeforeRef.current.currentTime);
            };
        }

        if (audioAfterRef.current) {
            audioAfterRef.current.onloadedmetadata = () => {
                setDurationAfter(audioAfterRef.current.duration);
            };
            audioAfterRef.current.ontimeupdate = () => {
                setCurrentTimeAfter(audioAfterRef.current.currentTime);
            };
        }
    }, []);

    const togglePlayBefore = () => {
        if (isPlayingBefore) {
            audioBeforeRef.current.pause();
        } else {
            if (isPlayingAfter) {
                audioAfterRef.current.pause();
                setIsPlayingAfter(false);
            }
            audioBeforeRef.current.play();
        }
        setIsPlayingBefore(!isPlayingBefore);
    };

    const togglePlayAfter = () => {
        if (isPlayingAfter) {
            audioAfterRef.current.pause();
        } else {
            if (isPlayingBefore) {
                audioBeforeRef.current.pause();
                setIsPlayingBefore(false);
            }
            audioAfterRef.current.play();
        }
        setIsPlayingAfter(!isPlayingAfter);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleProgressBefore = (e) => {
        if (draggingBefore) {
            const rect = progressBarBeforeRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const newTime = (offsetX / rect.width) * durationBefore;
            audioBeforeRef.current.currentTime = newTime;
            setCurrentTimeBefore(newTime);
        }
    };

    const handleProgressAfter = (e) => {
        if (draggingAfter) {
            const rect = progressBarAfterRef.current.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const newTime = (offsetX / rect.width) * durationAfter;
            audioAfterRef.current.currentTime = newTime;
            setCurrentTimeAfter(newTime);
        }
    };

    const handleMouseDownBefore = () => {
        setDraggingBefore(true);
    };

    const handleMouseDownAfter = () => {
        setDraggingAfter(true);
    };

    const handleMouseUp = () => {
        setDraggingBefore(false);
        setDraggingAfter(false);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleEndedBefore = () => {
        setCurrentTimeBefore(0);
        setIsPlayingBefore(false);
    };

    const handleEndedAfter = () => {
        setCurrentTimeAfter(0);
        setIsPlayingAfter(false);
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

            <div className="bg-[#F6F6F6] flex gap-10 items-center justify-between py-4 px-10 rounded-lg mb-4">
                <div className='w-fit'>
                    <div className="font-THICCCBOI-Regular text-[12px] font-normal text-nowrap">Title:</div>
                    <div className="font-THICCCBOI-SemiBold font-semibold text-base text-nowrap">Hip Hop</div>
                </div>
                <div className="flex items-center gap-10 w-full">
                    <div className="flex flex-col gap-2 items-center w-1/2 justify-between">
                        <div className='w-full flex justify-between items-center'>
                            <span className="mr-2 font-THICCCBOI-Regular text-[12px] font-normal">Before</span>
                            <span className="ml-2">{formatTime(currentTimeBefore)} / {formatTime(durationBefore)}</span>
                        </div>
                        <div className='w-full flex justify-between items-center relative'>
                            <button className="mr-4 bg-[#DCDCDC] w-8 h-8 flex items-center justify-center rounded-md" onClick={togglePlayBefore}>
                                {isPlayingBefore ? <FaPause /> : <FaPlay />}
                            </button>
                            <audio ref={audioBeforeRef} src={BeforeAudio} onEnded={handleEndedBefore} />
                            <div
                                className="w-full mx-2 relative h-2 bg-gray-300 rounded-lg"
                                ref={progressBarBeforeRef}
                                onMouseMove={handleProgressBefore}
                                onMouseDown={handleMouseDownBefore}
                            >
                                <div
                                    className="absolute top-0 left-0 h-full bg-[#001422] rounded-lg"
                                    style={{ width: `${(currentTimeBefore / durationBefore) * 100}%` }}
                                ></div>
                                <div
                                    className="absolute top-1/2 left-0 border-4 border-black h-5 w-5 bg-[#DCDCDC] rounded-full transform -translate-y-1/2 -translate-x-1/2"
                                    style={{ left: `${(currentTimeBefore / durationBefore) * 100}%` }}
                                    onMouseDown={handleMouseDownBefore}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-center w-1/2 justify-between">
                        <div className='w-full flex justify-between items-center'>
                            <span className="mr-2 font-THICCCBOI-Regular text-[12px] font-normal">After</span>
                            <span className="ml-2">{formatTime(currentTimeAfter)} / {formatTime(durationAfter)}</span>
                        </div>
                        <div className='w-full flex justify-between items-center relative'>
                            <button className="mr-4 bg-[#DCDCDC] w-8 h-8 flex items-center justify-center rounded-md" onClick={togglePlayAfter}>
                                {isPlayingAfter ? <FaPause /> : <FaPlay />}
                            </button>
                            <audio ref={audioAfterRef} src={AfterAudio} onEnded={handleEndedAfter} />
                            <div
                                className="w-full mx-2 relative h-2 bg-gray-300 rounded-lg"
                                ref={progressBarAfterRef}
                                onMouseMove={handleProgressAfter}
                                onMouseDown={handleMouseDownAfter}
                            >
                                <div
                                    className="absolute top-0 left-0 h-full bg-[#001422] rounded-lg"
                                    style={{ width: `${(currentTimeAfter / durationAfter) * 100}%` }}
                                ></div>
                                <div
                                    className="absolute top-1/2 left-0 border-4 border-black h-5 w-5 bg-[#DCDCDC] rounded-full transform -translate-y-1/2 -translate-x-1/2"
                                    style={{ left: `${(currentTimeAfter / durationAfter) * 100}%` }}
                                    onMouseDown={handleMouseDownAfter}
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
        </>
    );
}

export default Samples;