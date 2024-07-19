
import { FaTrashAlt } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";

const Services = () => {
    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9">Services</h1>
                <button className="bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-base text-white px-5 py-4 rounded-lg">Add Service</button>
            </div>

            <div className='flex items-center justify-between'>
                <div className="flex gap-4 mb-6">
                    <div className="bg-[#0F2005] font-THICCCBOI-SemiBold font-semibold text-[12px] text-white px-5 py-2 rounded-lg flex items-center">
                        Active Services <span className="bg-[#4BC500] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">5</span>
                    </div>
                    <div className="bg-[#E9E9E9]  font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Archived <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                    <div className="bg-[#E9E9E9]  font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Trash <span className="bg-[#474747] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                </div>

            </div>


            <table className='w-full border-0'>
                <tbody>
                    <tr>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Service ID</div>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>#AMM67</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-4 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>Package Name</div>
                                <div className="block bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-[12px] leading-[14px] rounded-full w-fit px-3 py-1 text-white">$599/ Monthly</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Discount</div>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>20%</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Created on</div>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>12/21/2023</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                <button className="bg-[#4BC500] px-3 py-2  rounded-full text-white font-THICCCBOI-SemiBold font-semibold text-[12px] leading-[14px]">View Details</button>
                                <button><TiPencil color="#969696" /></button>
                                <button><FaTrashAlt color="#FF0000" /></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Service ID</div>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>#AMM67</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-4 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>Package Name</div>
                                <div className="block bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-[12px] leading-[14px] rounded-full w-fit px-3 py-1 text-white">$599/ Monthly</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Discount</div>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>20%</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Created on</div>
                                <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>12/21/2023</div>
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                                <button className="bg-[#4BC500] px-3 py-2  rounded-full text-white font-THICCCBOI-SemiBold font-semibold text-[12px] leading-[14px]">View Details</button>
                                <button><TiPencil color="#969696" /></button>
                                <button><FaTrashAlt color="#FF0000" /></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}

export default Services