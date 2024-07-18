import { useState } from 'react';
import { FaTrashAlt } from "react-icons/fa";
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';

const Orders = () => {
    const [state, setState] = useState();

    return (
        <>
            <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9 mb-6">Orders</h1>

            <div className='flex items-center justify-between'>
                <div className="flex gap-4 mb-6">
                    <div className="bg-[#0F2005] font-THICCCBOI-SemiBold font-semibold text-[12px] text-white px-5 py-2 rounded-lg flex items-center">
                        Active Orders <span className="bg-[#4BC500] text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">5</span>
                    </div>
                    <div className="bg-[#F6F6F6]  font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Completed <span className="bg-gray-400 text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                    <div className="bg-[#F6F6F6]  font-THICCCBOI-SemiBold font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center">
                        Cancelled <span className="bg-gray-400 text-white ml-2 w-7 h-7 flex items-center justify-center rounded-full">30</span>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <DateRangePicker value={state} onChange={setState} className="custom-daterange-picker" />
                        <button className="bg-[#0F2005] font-THICCCBOI-SemiBold font-semibold text-[12px] text-white px-5 py-2 rounded-lg">Generate Report</button>
                    </div>
                </div>
            </div>


            <table className='w-full border-0'>
                <tr>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6]'>
                            <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Order ID</div>
                            <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>#AMM67</div>
                        </div>
                    </td>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                        <div className='px-3 py-4 bg-[#F6F6F6]'>
                            <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>Mastering Services</div>
                            <div className="block bg-[#4BC500] font-THICCCBOI-SemiBold font-semibold text-[12px] leading-[14px] rounded-full w-fit px-3 py-1 text-white">$599/ Monthly</div>
                        </div>
                    </td>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6]'>
                            <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>Abubakar Sherazi</div>
                            <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>sheraziabubakar@gmail.com</div>
                        </div>
                    </td>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                        <div className='px-3 py-5 bg-[#F6F6F6]'>
                            <div className='font-THICCCBOI-Light font-normal text-[12px] leading-[14px]'>Purchased on</div>
                            <div className='font-THICCCBOI-SemiBold font-semibold text-base leading-6'>12/21/2023</div>
                        </div>
                    </td>
                    <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                        <div className='flex gap-3 px-3 py-6 bg-[#F6F6F6]'>
                            <button className="bg-[#4BC500] px-3 py-2  rounded-full text-white font-THICCCBOI-SemiBold font-semibold text-[12px] leading-[14px]">View Details</button>
                            <button><FaTrashAlt color="#FF0000" /></button>
                        </div>
                    </td>
                </tr>
            </table>
        </>
    );
}

export default Orders;
