import React from 'react';
import Officer from "../../../../../assets/images/Officer.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../stores";
import { closeJob } from "../../../service/api/SOSwarning";
import officerIcon from "../../../../../assets/icons/officerIcon.png";
const CallOfficerSuccess = ({ statusContract, setStatusContract }: { statusContract: string, setStatusContract: (status: string) => void }) => {
    const dispatch = useDispatch();
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const handleSuccess = async () => {
        // Handle success action here
        let eventId = dataEmergencyDetail.sosEventInfo.id
        let data = await closeJob(eventId)
        if(data.status){
            let dataEventInfo =  JSON.parse(JSON.stringify(dataEmergencyDetail))
            dataEventInfo.sosEventInfo.step = data.result.step
            dataEventInfo.sosEventInfo.isCompleted = data.result.is_completed
            dataEventInfo.sosEventInfo.event_help_id = data.result.event_help_id
            dataEventInfo.sosEventInfo.sosCallHistories =  [...dataEmergencyDetail.sosEventInfo.sosCallHistories, {
                createdAt: new Date().toISOString(),
            }]
            dispatch.sosWarning.setDataEmergencyDetail(dataEventInfo)
            setStatusContract("form")
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center p-6">
            {/* Process Steps Title */}
            <h1 className="!text-3xl !font-semibold !text-[#1a365d] !text-center !mb-3 ">
                Process Steps
            </h1>
            
            {/* Subtitle */}
            <p className="text-base text-[#929292] text-center !text-2xl font-semibold ">
                Call to contact the staff.
            </p>

            {/* Officer Icon */}
                {/* <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center "> */}
                        <img src={officerIcon} alt="Officer" className="w-[200px]" />
                {/* </div> */}
            {/* Officer Label */}
            <h2 className="!text-3xl !font-medium !text-[#929292] !text-center !mb-12  !mt-6 !mb-8">
                Policeman 191
            </h2>

            {/* Success Button */}
            <button
                onClick={handleSuccess}
                className="w-full max-w-sm bg-[#1a365d] !text-white !rounded-xl 
                py-4 px-6 text-base font-semibold cursor-pointer transition-colors 
                duration-200 outline-none hover:bg-[#2c5282] active:bg-[#1a202c] "
                type="button"
            >
                Success
            </button>
        </div>
    );
};

export default CallOfficerSuccess;