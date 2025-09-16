import React, { useState, useMemo } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../../../../../stores";
import { chooseContractOfficer } from "../../../service/api/SOSwarning";
import FailedModal from '../../../../../components/common/FailedModal';
const ChooseContractPerson = ({  setStatusContract, enableContractOfficer }: { statusContract: string, setStatusContract: (status: string) => void, enableContractOfficer: boolean }) => {
    const [selectedOption] = useState<string>('');
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const handleOptionSelect = async (optionId: string) => {
        let obj = {
            "eventHelpId": optionId || 0
        }
        let eventId = dataEmergencyDetail.sosEventInfo.id
        let data = await chooseContractOfficer(eventId, obj)
        if (data.status) {
            setStatusContract("callOfficer")
        }
        else if(data.message) {
            FailedModal(data.message, 900)
        }
    };
    const helpOptions = useMemo(() => {
        let choices = dataEmergencyDetail?.sosEventHelpProtocol[1]?.choices || []
        if (choices) {
            return choices.map((item: any) => {
                return {
                    id: item?.id,
                    label: item?.name
                }
            })
        }
        return []
    }, [dataEmergencyDetail])


    return (
        <div className="flex flex-col w-full h-full overflow-hidden" style={{ maxHeight: '100%' }}>
            <div className=" overflow-y-auto flex flex-col justify-center items-center " >
                <div className="p-4 md:p-6 !mt-auto">
                    {/* Corrective Action Steps */}
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 ">
                            1. Corrective action steps
                        </h2>
                        <p className="text-[#929292] text-lg font-medium mb-6 leading-relaxed">
                            Call the resident and inform them of the details of the incident that needs to be reported.
                        </p>
                    </div>

                    {/* Help Options */}
                    <div className="pb-4">
                        {
                            enableContractOfficer && (
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 ">
                                    2. What kind of help do you need?
                                </h2>        
                            )
                        }
                        
                        {
                            enableContractOfficer && (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    { helpOptions.length > 0 && helpOptions.map((option: any) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect(option.id)}
                                            className={`
                                            cursor-pointer
                                            !mb-4
                                            w-full p-3 !rounded-xl border-2 text-center font-medium 
                                            transition-all duration-200 outline-none
                                            ${selectedOption === option.id
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-blue-300 bg-white text-blue-600 hover:border-blue-400 hover:bg-blue-25'
                                                }
                                        `}
                                            type="button"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    {
                                        helpOptions.length === 0 && (
                                            <div className="text-center text-gray-500">
                                                No options available
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChooseContractPerson;