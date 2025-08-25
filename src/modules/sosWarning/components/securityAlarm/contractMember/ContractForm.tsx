import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../stores";
import { closeCase,closeJob } from "../../../service/api/SOSwarning";
import SuccessModal from "../../../../../components/common/SuccessModal";
import { Button } from 'antd';

const ContractForm = ({ statusContract, setStatusContract }: { statusContract: string, setStatusContract: (status: string) => void }) => {
    const dispatch = useDispatch();
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const [additionalNotes, setAdditionalNotes] = useState('');

    const handleSuccess = async () => {
        // Handle success action here
        let eventId = dataEmergencyDetail.sosEventInfo.id
        let obj = {
            remark: additionalNotes,
        }
        if(dataEmergencyDetail.type==='DeviceWarning'){
            let dataCloseJob = await closeJob(eventId)
            if(dataCloseJob.status){
                let dataCloseCase = await closeCase(eventId,obj)
                if(dataCloseCase.status){
                    setStatusContract("success")
                }
            }
        }
        else if(dataEmergencyDetail.type==='emergency') {
            let data = await closeCase(eventId,obj)
            if(data.status){
                let dataEventInfo =  JSON.parse(JSON.stringify(dataEmergencyDetail))
                dataEventInfo.sosEventInfo.step = data.result.step
                dataEventInfo.sosEventInfo.isCompleted = data.result.is_completed
                dataEventInfo.sosEventInfo.event_help_id = data.result.event_help_id
                dataEventInfo.sosEventInfo.sosCallHistories =  [...dataEmergencyDetail.sosEventInfo.sosCallHistories, {
                    createdAt: new Date().toISOString(),
                },
                {
                    createdAt: new Date().toISOString(),
                }
            ]
                dispatch.sosWarning.setDataEmergencyDetail(dataEventInfo)
                setStatusContract("success")   
                
            }
        }
    };

    return (
            <div className="w-full h-full flex flex-col justify-center items-center p-6 pb-0  !mx-auto ">
                <div className="w-full text-[18px] font-semibold text-[#1a365d] mb-6 leading-snug text-left lg:text-center">
                    Call back to inform the residents 
                </div>

                <div className="mb-6 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional notes
                    </label>
                    <textarea
                         value={additionalNotes}
                         onChange={(e) => setAdditionalNotes(e.target.value)}
                         placeholder="Input Additional notes"
                         className="w-full 
                         h-[120px] p-3 border border-gray-200 
                         rounded-lg text-sm text-gray-700 resize-none font-sarabun 
                         outline-none 
                         transition-colors duration-200  
                         focus:border-blue-600"
                     />
                </div>

                {/* <button
                   disabled={!additionalNotes.trim()}
                   onClick={handleSuccess}
                   className="
                   !mb-6
                   w-full bg-[#1a365d] !text-white rounded-xl py-[14px] px-5 text-[16px] font-semibold cursor-pointer transition-colors duration-200 outline-none hover:bg-[#2c5282] active:bg-[#1a202c]
                    font-sarabun disabled:opacity-50 disabled:cursor-not-allowed"
                   type="button"
                >
                   Success
                </button> */}
                <Button
                    type="primary"
                    className="w-full !rounded-xl !mb-6 !md:mb-0"
                    onClick={handleSuccess}
                >
                    Success
                </Button>
            </div>
    );
};

export default ContractForm;