import { useState, useEffect } from "react";
import { Button } from "antd";

const Content = ({ member, handleCallCustomer, convertDate, index }: any) => {
    const [callTime, setCallTime] = useState<any>(null)


    const handleCall = async (member: any, status: boolean) => {
        await handleCallCustomer(member, status, setCallTime)
        // setCallTime(new Date().toISOString())
    }

    return (
        <>
            <div key={index} className="py-6">
                <div className="flex flex-col gap-4">

                    <div className="flex-1">
                        <div className="text-xl text-[#0A121B] font-medium mb-1 font-sarabun">
                            {member?.user?.givenName}
                        </div>

                        {/* Role และ Buttons - Responsive */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                            <span className="text-xl text-[#007AFF] font-medium font-sarabun">
                                {member?.role?.name}
                            </span>

                            {/* Buttons - Responsive Layout */}
                            <div className="flex flex-col sm:flex-col md:flex-row gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleCall(member, true)}
                                    className="w-full md:w-auto px-5 py-2 rounded-xl text-sm font-medium font-sarabun
                                                transition-all duration-200 !text-white bg-[#38BE43] cursor-pointer"
                                >
                                    Success
                                </button>
                                <button
                                    onClick={() => handleCall(member, false)}
                                    className="w-full md:w-auto px-5 py-2 rounded-xl text-sm font-medium font-sarabun
                                                transition-all duration-200 !text-white bg-[#D73232] cursor-pointer"
                                >
                                    Failed
                                </button>
                            </div>
                        </div>

                        {
                            member?.contract?.map((item: any, index: number) => (
                                <div onClick={() => {
                                    console.log(member, 'item')
                                }} key={index} className="flex flex-col sm:flex-row sm:items-center text-gray-600 mb-2 last:mb-0 gap-2">
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                        </div>
                                        <span className="text-[#616161] text-md font-medium font-sarabun">{item}</span>
                                    </div>

                                    <div className="text-md text-[#616161] sm:ml-auto font-sarabun">
                                        (Last call {convertDate(member?.sosCallHistory?.createdAt) || convertDate(callTime) || '-'})
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                </div>
            </div>

        </>
    )
}

export default Content;