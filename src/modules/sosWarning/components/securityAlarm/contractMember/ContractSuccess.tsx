import React from 'react';
import IconSuccess from "../../../../../assets/images/IconSuccess.png";
import { useNavigate } from 'react-router-dom';
// import { useGlobal } from "../../../contexts/Global";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../stores';
const ContractSuccess = () => {
    const { statusCaseReceiveCast } = useSelector((state: RootState) => state.sosWarning);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoBack = () => {
        if(statusCaseReceiveCast) {
            navigate('/dashboard/history-building')
            dispatch.sosWarning.setSelectOfficer({})
            dispatch.sosWarning.setStep(0)
            dispatch.sosWarning.setDataEmergencyDetail({})
        }else {
            dispatch.sosWarning.setStep(0)
            dispatch.sosWarning.setDataEmergencyDetail({})
        }
        
    };

    return (
        <div className="w-full h-full min-h-[500px] flex flex-col justify-center items-center p-4 lg:p-6">
            {/* Success Icon */}
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6">
                <img src={IconSuccess} alt="IconSuccess" 
                className="w-full h-full" />
            </div>
            
            {/* Success Message */}
            <h2 className="text-xl font-medium text-[#38BE43] 
            text-center  !m-8 !mt-0">
                Completed successfully
            </h2>

            {/* Go Back Button */}
            <button
                onClick={handleGoBack}
                className="w-full !text-white bg-green-500 
                !rounded-xl
                text-white rounded-xl py-3 px-6 text-base font-medium 
                cursor-pointer transition-colors duration-200 outline-none
                 hover:bg-green-600 active:bg-green-700 "
                type="button"
            >
                Press to go back
            </button>
        </div>
    );
};

export default ContractSuccess;