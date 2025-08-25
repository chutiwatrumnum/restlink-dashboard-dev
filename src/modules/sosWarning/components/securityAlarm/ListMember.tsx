
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../stores";
import { Button } from "antd";
import { useSecurityAlarm } from "../../contexts/SecurityAlarmContext";

import HomeBlue from '../../../../assets/images/HomeBlue.png'
import { useNavigate } from "react-router-dom";
const ListMember = () => {
    const dispatch = useDispatch();
    const { statusCaseReceiveCast, dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const { handleCallCustomer } = useSecurityAlarm();
    const navigate = useNavigate();

    const convertDate = (date: string) => {
        if (!date) return '-'
        if (!date) return '-'
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        const pad = (n: number) => n.toString().padStart(2, '0');
        const day = pad(d.getDate());
        const month = pad(d.getMonth() + 1);
        const year = d.getFullYear();
        const hour = pad(d.getHours());
        const minute = pad(d.getMinutes());
        return `${day}/${month}/${year} ${hour}:${minute}`;
    }

    const listMembersContract = useMemo(() => {
        if (Object.keys(dataEmergencyDetail).length === 0) {
            return []
        }
        // console.log(dataEmergencyDetail,'dataEmergencyDetail')
        let sumData
        sumData = (dataEmergencyDetail?.sosEventHelpProtocol[0]?.choices || []).map((item: any) => {
            let contact = item.user.contact
            let contact2 = item.user.contact2
            let contact3 = item.user.contact3
            let data: any[] = []

            if (contact != '-') {
                data = [...data, contact]
            }
            if (contact2 != '-') {
                data = [...data, contact2]
            }
            if (contact3 != '-') {
                data = [...data, contact3]
            }
            if (data.length === 0) {
                return []
            }
            item.contract = data
            return item
        }).filter((arr: any) => arr.contract != '');


        return sumData
    }, [dataEmergencyDetail])


    const handleBack = () => {
        if (statusCaseReceiveCast) {
            dispatch.sosWarning.setDataEmergencyDetail({})
            navigate('/dashboard/history-building')
        } else {
            dispatch.sosWarning.setDataEmergencyDetail({})
        }
    }

    return (
        <>

            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 px-0 border-gray-100 flex-shrink-0">
                    <div className="w-full text-2xl text-[#3C8BF1] mb-3 !font-semibold font-sarabun">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <span className="text-left"> List of household members </span>
                            <div className="w-full md:w-auto">
                                <Button
                                    type="primary"
                                    className="w-full !rounded-xl lg:w-[150px]"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center text-gray-500">
                        <img src={HomeBlue} alt="HomeBlue" className="mr-6" />
                        <span className="text-sm text-xl text-[#929292] font-semibold font-sarabun">
                            {dataEmergencyDetail?.sosEventInfo?.unit?.roomAddress || '-'}
                        </span>
                    </div>
                </div>

                {/* Members List */}
                <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                    {listMembersContract.map((member: any) => (
                        <div key={member.id} className="py-6">
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
                                                onClick={() => handleCallCustomer(member, true)}
                                                className="w-full md:w-auto px-5 py-2 rounded-xl text-sm font-medium font-sarabun
                                                transition-all duration-200 !text-white bg-[#38BE43] cursor-pointer"
                                            >
                                                Success
                                            </button>
                                            <button
                                                onClick={() => handleCallCustomer(member, false)}
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
                                                    (Last call {convertDate(member?.sosCallHistory?.createdAt) || '-'})
                                                </div>
                                            </div>
                                        ))
                                    }

                                </div>
                            </div>
                        </div>
                    ))}
                    {listMembersContract.length === 0 && (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-gray-500 text-sm font-medium font-sarabun !text-lg">
                                ไม่มีข้อมูลสมาชิก
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ListMember;