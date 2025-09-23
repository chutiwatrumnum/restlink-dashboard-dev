import React from 'react';
import Officer from "../../../../../assets/images/Officer.png";
import { useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../stores";
import { chooseContractOfficer, closeJob } from "../../../service/api/SOSwarning";
import officerIcon from "../../../../../assets/icons/officerIcon.png";
import Hospital from "../../../../../assets/icons/Hospital.jpg";
import Fire from "../../../../../assets/icons/Fire.jpg";
import Cross from "../../../../../assets/icons/Cross.jpg";
// officerIcon
// Hospital
// Fire
// Cross
import FailedModal from '../../../../../components/common/FailedModal';
import IconBack from "../../../../../assets/icons/iconBack.jpg";
const CallOfficerSuccess = ({ statusContract, setStatusContract }: { statusContract: string, setStatusContract: (status: string) => void }) => {
    const dispatch = useDispatch();
    const { dataEmergencyDetail  } = useSelector((state: RootState) => state.sosWarning);
    const selectOfficer = useSelector((state: RootState) => state.sosWarning.selectOfficer);
    const handleSuccess = async () => {
        // Handle success action here
        let eventId = dataEmergencyDetail.sosEventInfo.id
        if(eventId){
            let obj = {
                "eventHelpId": selectOfficer?.id || 0
            }
            let data = await chooseContractOfficer(eventId, obj)
            if (!data?.status) {
                FailedModal(data.message, 900)
                return 
            }
        }
        let data = await closeJob(eventId)
        if(data.status){
            let dataEventInfo = JSON.parse(JSON.stringify(dataEmergencyDetail))
            dataEventInfo.sosEventInfo.step = data.result.step
            dataEventInfo.sosEventInfo.isCompleted = data.result.is_completed
            dataEventInfo.sosEventInfo.event_help_id = data.result.event_help_id
            dataEventInfo.sosEventInfo.sosEventLogs =  [...dataEmergencyDetail.sosEventInfo.sosEventLogs, {
                createdAt: new Date().toISOString(),
            }]
            dispatch.sosWarning.setDataEmergencyDetail(dataEventInfo)
            setStatusContract("form")
        }
    };

    const handleBack = () => {
        setStatusContract("contract")
    }
    const officerName = useMemo(() => {
        if(Object.keys(selectOfficer).length > 0){
            return `${selectOfficer?.nameEn} ${selectOfficer?.contact}`
        }
        return ''
    }, [selectOfficer])

    const officerIconDisplay = useMemo(() => {
        let objIcon ={
            '1':officerIcon,
            '2':Hospital,
            '3':Fire,
            '4':Cross
        }
        return objIcon[selectOfficer?.id] || officerIcon
    }, [selectOfficer])

    return (
        <div className="w-full h-full flex flex-col justify-center items-center p-6">
            <div className="mb-4 flex justify-start w-full">
                <img src={IconBack} alt="IconBack" className="w-5 h-5 cursor-pointer" onClick={handleBack} />
            </div>
            {/* Process Steps Title */}
            <h1 className="!text-3xl !font-semibold !text-[#1a365d] !text-center !mb-3 ">
                Process Steps
            </h1>
            
            {/* Subtitle */}
            <p 
            onClick={()=>{
                console.log(selectOfficer,'selectOfficer')
            }}  
            className="text-base text-[#929292] text-center !text-2xl font-semibold ">
                Call to contact the staff.
            </p>

            {/* Officer Icon */}
                <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center ">
                        <img src={officerIconDisplay} alt="Officer" className="w-[200px]" />
                </div>
            {/* Officer Label */}
            <h2 className="!text-3xl !font-medium !text-[#929292] !text-center !mb-12  !mt-6 !mb-8">
                {officerName}
            </h2>

            {/* Success Button */}
            <button
                onClick={handleSuccess}
                className="w-full  max-w-sm bg-[#1a365d] !text-white !rounded-xl 
                py-3 px-6 text-base font-semibold cursor-pointer transition-colors 
                duration-200 outline-none hover:bg-[#2c5282] active:bg-[#1a202c] "
                type="button"
            >
                Next
            </button>
        </div>
    );
};

export default CallOfficerSuccess;