import React, { useState,useMemo } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../../../../../stores";
import { chooseContractOfficer } from "../../../service/api/SOSwarning";
const ChooseContractPerson = ({ statusContract, setStatusContract }: { statusContract: string, setStatusContract: (status: string) => void }) => {
    const [selectedOption, setSelectedOption] = useState<string>('');
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const handleOptionSelect = async (optionId: string) => {
        let obj = {
            "eventHelpId": optionId || 0
        }
        let eventId = dataEmergencyDetail.sosEventInfo.id
        let data = await chooseContractOfficer(eventId,obj)
        if(data.status){
            setStatusContract("callOfficer")
        }
    };
    const helpOptions = useMemo(() => {
        let choices = dataEmergencyDetail?.sosEventHelpProtocol[1]?.choices || []
        if(choices){
            return choices.map((item:any) => {
                return {    
                    id: item?.id,
                    label: item?.name
                }
            })
        }
        return []
    }, [dataEmergencyDetail])


    return (
        <div className="w-full h-full overflow-hidden" style={{ maxHeight: '100%' }}>
            <div className="h-full overflow-y-auto" style={{ height: '100%', maxHeight: '100%' }}>
                <div className="p-4 md:p-6">
                    {/* Corrective Action Steps */}
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 font-sarabun">
                            1. Corrective action steps
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed font-sarabun">
                            Call the resident and inform them of the details of the incident that needs to be reported.
                        </p>
                    </div>

                    {/* Help Options */}
                    <div className="pb-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 font-sarabun">
                            2. What kind of help do you need?
                        </h2>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {helpOptions.map((option:any) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    className={`
                                        cursor-pointer
                                        !mb-4
                                        w-full p-3 rounded-xl border-2 text-center font-medium font-sarabun
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChooseContractPerson;