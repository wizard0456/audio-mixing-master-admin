
import { FaEye, FaTrashAlt } from "react-icons/fa";

const Gallery = () => {
    const images = [
        { id: 1, src: 'https://via.placeholder.com/300' },
        { id: 2, src: 'https://via.placeholder.com/300' },
        { id: 3, src: 'https://via.placeholder.com/300' },
        { id: 4, src: 'https://via.placeholder.com/300' },
    ];
    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Gallery</h1>
                <button className="bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-base text-white px-5 py-4 rounded-lg">Upload Images</button>

            </div>
            <div className="grid grid-cols-5 items-stretch gap-4">
                {images.length > 0 && images.map(image => (
                    <div key={image.id} className="gallery-image relative overflow-hidden">
                        <img src={image.src} alt={`Gallery ${image.id}`} className="w-full h-full object-cover rounded-lg" />
                        <div className="gallery-buttons-wrapper absolute w-full h-fit py-5 flex items-center justify-center bg-black bg-opacity-50 rounded-b-lg">
                            <FaEye className="cursor-pointer" color="white" size={20} />
                        </div>
                        <div className='gallery-delete-wrapper absolute h-10 w-10 right-3 flex items-center justify-center bg-[#FF0000] rounded-full'>
                            <FaTrashAlt className="cursor-pointer" color="white" />
                        </div>
                    </div>
                ))}
                <div className={`border-dashed border-2 border-[#ccc] p-5 flex items-center justify-center rounded-lg ${images.length == 0 ? 'h-60 w-60' : 'h-full'}`}>
                    <span className="text-5xl text-white font-bold bg-[#ccc] h-full w-full flex items-center justify-center rounded-xl">+</span>
                </div>
            </div>
        </>
    );
}

export default Gallery;
