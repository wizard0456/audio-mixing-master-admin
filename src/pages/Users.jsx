import { FaTrashAlt } from "react-icons/fa"


const Users = () => {
    return (
        <>
            <h1 className="font-THICCCBOI-SemiBold font-semibold text-3xl leading-9 mb-6">Users</h1>
            <table className='w-full border-0'>
                <thead>
                    <tr>
                        <th className='font-THICCCBOI-SemiBold font-semibold text-[12px] leading-3 text-left py-5'>User ID</th>
                        <th className='font-THICCCBOI-SemiBold font-semibold text-[12px] leading-3 text-left py-5'>Full Name</th>
                        <th className='font-THICCCBOI-SemiBold font-semibold text-[12px] leading-3 text-left py-5'>Email Address</th>
                        <th className='font-THICCCBOI-SemiBold font-semibold text-[12px] leading-3 text-left py-5'>Joined Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                #31
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                Abubakar Sherazi
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                sheraziabubakar@gmail.com
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                12/21/2023
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='flex items-center gap-3 px-3 py-5 bg-[#F6F6F6]'>
                                <button className="bg-[#4BC500] px-3 py-[6px] rounded-xl font-THICCCBOI-SemiBold font-semibold text-[12px] leading-3 text-white">View Orders</button> <button><FaTrashAlt color="#FF0000" /></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                #31
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                Abubakar Sherazi
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                sheraziabubakar@gmail.com
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='px-3 py-5 bg-[#F6F6F6]'>
                                12/21/2023
                            </div>
                        </td>
                        <td className="font-THICCCBOI-SemiBold font-semibold text-base leading-6 pb-5">
                            <div className='flex items-center gap-3 px-3 py-5 bg-[#F6F6F6] h-full'>
                                <button className="bg-[#4BC500] px-3 py-[6px] rounded-xl font-THICCCBOI-SemiBold font-semibold text-[12px] leading-3 text-white">View Orders</button> <button><FaTrashAlt color="#FF0000" /></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default Users