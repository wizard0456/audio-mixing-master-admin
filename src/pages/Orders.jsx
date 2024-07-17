import  { useState } from 'react';
import { FaTrashAlt } from "react-icons/fa";
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

const Orders = () => {
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    return (
        <>
            <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9 mb-6">Orders</h1>

            <div className="flex gap-4 mb-6">
                <div className="bg-[#141D0E] text-white px-4 py-2 rounded-lg flex items-center">
                    Active Orders <span className="bg-[#4BC500] text-white ml-2 px-2 rounded-full">5</span>
                </div>
                <div className="bg-gray-200 px-4 py-2 rounded-lg flex items-center">
                    Completed <span className="bg-gray-400 text-white ml-2 px-2 rounded-full">30</span>
                </div>
                <div className="bg-gray-200 px-4 py-2 rounded-lg flex items-center">
                    Cancelled <span className="bg-gray-400 text-white ml-2 px-2 rounded-full">30</span>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <DateRangePicker
                        ranges={state}
                        onChange={item => setState([item.selection])}
                        className="rounded-lg shadow-lg"
                    />
                    <button className="bg-black text-white px-4 py-2 rounded-lg">Generate Report</button>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg">
                <div className="grid grid-cols-6 p-4 bg-gray-100 font-semibold text-sm text-gray-700">
                    <div>Order ID</div>
                    <div>Service</div>
                    <div>Customer</div>
                    <div>Email</div>
                    <div>Purchased on</div>
                    <div></div>
                </div>
                <div className="grid grid-cols-6 p-4 items-center border-t">
                    <div>#AMM67</div>
                    <div>Mastering Services <span className="block text-green-500">$599/ Monthly</span></div>
                    <div>Abubakar Sherazi</div>
                    <div>sheraziabubakar@gmail.com</div>
                    <div>12/21/2023</div>
                    <div className="flex justify-end gap-3">
                        <button className="bg-[#4BC500] px-3 py-1 rounded-lg text-white">View Details</button>
                        <button><FaTrashAlt color="#FF0000" /></button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Orders;