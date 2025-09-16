import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../stores";
import { closeCase,closeJob } from "../../../service/api/SOSwarning";
import SuccessModal from "../../../../../components/common/SuccessModal";
import { Button } from 'antd';
import FailedModal from '../../../../../components/common/FailedModal';

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
        console.log(dataEmergencyDetail.type,'dataEmergencyDetail.type')
        if(dataEmergencyDetail.type==='DeviceWarning' || dataEmergencyDetail.type==='device'){
            let dataCloseJob = await closeJob(eventId)
            if(dataCloseJob.status){
                let dataCloseCase = await closeCase(eventId,obj)
                if(dataCloseCase.status){
                    setStatusContract("success")
                }
            }
            else {
                if(dataCloseJob?.message) FailedModal(dataCloseJob.message,900)
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
            <div className="w-full h-full flex flex-col justify-start items-start p-0 sm:p-0  lg:p-6 pb-0  !mx-auto ">
                <div className="w-full !text-3xl font-semibold text-[#1a365d] mb-6 leading-snug text-left lg:text-center">
                    Call back to inform the residents 
                </div>

                <div className="mb-6 w-full">
                    <label className="block text-md font-medium text-gray-700 mb-2">
                        Additional notes
                    </label>
                    <textarea
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Input Additional notes"
                        className="w-full 
                        h-[150px] p-3 border-1"
                        style={{
                            borderColor: '#C6C8C9',
                            color: '#374151',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            resize: 'none',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                    />
                </div>

                {/* <button
                   disabled={!additionalNotes.trim()}
                   onClick={handleSuccess}
                   className="
                   !mb-6
                   w-full bg-[#1a365d] !text-white rounded-xl py-[14px] px-5 text-[16px] font-semibold cursor-pointer transition-colors duration-200 outline-none hover:bg-[#2c5282] active:bg-[#1a202c]
                     disabled:opacity-50 disabled:cursor-not-allowed"
                   type="button"
                >
                   Success
                </button> */}
                <Button
                    type="primary"
                    className="w-full !h-[40px] !rounded-xl !mb-6 !md:mb-0"
                    onClick={handleSuccess}
                >
                    Success
                </Button>
            </div>
    );
};

export default ContractForm;