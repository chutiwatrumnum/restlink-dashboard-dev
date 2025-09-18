
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../stores";
import { Button } from "antd";
import { useSecurityAlarm } from "../../contexts/SecurityAlarmContext";

import HomeBlue from '../../../../assets/images/HomeBlue.png'
import { useNavigate } from "react-router-dom";
import Content from "../listMember/Content";
const ListMember = () => {
    const dispatch = useDispatch();
    const { statusCaseReceiveCast, dataEmergencyDetail} = useSelector((state: RootState) => state.sosWarning);
    const { handleCallCustomer } = useSecurityAlarm();
    const navigate = useNavigate();

    const convertDate = (date: string) => {
        if (!date) return ''
        if (!date) return ''
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
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
        let sumData
        sumData = (dataEmergencyDetail?.sosEventHelpProtocol[0]?.choices || []).map((item: any) => {
            let contact = item.user.contact
            let contact2 = item.user.contact2
            let contact3 = item.user.contact3
            let data: any[] = []

            if (contact != '-') {
                data = [contact]
            }
            if (contact2 != '-' && data.length === 0) {
                data = [contact2]
            }
            if (contact3 != '-' && data.length === 0) {
                data = [contact3]
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
                <div className="pt-6 pb-4 px-0 border-gray-100 flex-shrink-0">
                    <div className="w-full text-2xl text-[#3C8BF1] mb-3 !font-semibold ">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <span className="text-left !text-3xl font-semibold "> List of household members </span>
                            {/* <div className="w-full md:w-auto">
                                <Button
                                    type="primary"
                                    className="w-full !rounded-xl lg:w-[150px]"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </div> */}
                        </div>
                    </div>
                    <div className="flex items-center text-gray-500">
                        <img src={HomeBlue} alt="HomeBlue" className="mr-10" />
                        <span className="text-sm !text-2xl text-[#929292] font-semibold ">
                            {dataEmergencyDetail?.sosEventInfo?.unit?.roomAddress || '-'}
                        </span>
                    </div>
                </div>

                {/* Members List */}
                <div className="divide-y divide-gray-100">
                    {
                        listMembersContract.map((member: any, index: number) => (
                            <Content
                                key={member.id}
                                member={member}
                                handleCallCustomer={handleCallCustomer}
                                convertDate={convertDate}
                                index={index}
                            />
                        )
                        )
                    }

                    {listMembersContract.length === 0 && (
                        <div className="flex justify-center items-center">
                            <div className="text-gray-500 text-sm font-medium  !text-lg">
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