import React, { useState,useMemo } from "react";
import { Button, Col, Row } from "antd";
import TepStep from "../../components/securityAlarm/tepStep";
import { useDispatch,useSelector } from "react-redux";
import { RootState } from "../../../../stores";
import { useNavigate } from "react-router-dom";


import ListMember from "../../components/securityAlarm/ListMember";
import ContractMember from "../../components/securityAlarm/ContractMember";
import DeviceList from "../../components/securityAlarm/DeviceList";

interface HouseholdMember {
    id: string;
    name: string;
    role: string;
    phone: string;
    lastCall: string;
    status: 'success' | 'failed' | 'pending';
}

interface DoorSensor {
    id: string;
    name: string;
    type: string;
    deviceId: string;
    sensorType: string;
    batteryLevel: number;
    status: 'intrusion' | 'normal';
}

const SecurityAlarm = () => {
    // const [statusStep, setStatusStep] = useState<string>('success');
    const dispatch = useDispatch();
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const navigate = useNavigate();
    const [statusContract, setStatusContract] = useState<string>("contract");
    const [householdMembers] = useState<HouseholdMember[]>([
        {
            id: '1',
            name: 'Warunya Thacharoenying',
            role: 'Homeowner',
            phone: '0845625785',
            lastCall: '22/11/2025 11:11',
            status: 'success'
        },
        {
            id: '2',
            name: 'Warunya Thacharoenying',
            role: 'Homeowner',
            phone: '0845625785',
            lastCall: '22/11/2025 11:11',
            status: 'failed'
        },
        {
            id: '3',
            name: 'Warunya Thacharoenying',
            role: 'Homeowner',
            phone: '0845625785',
            lastCall: '22/11/2025 11:11',
            status: 'success'
        }
    ]);

    const [doorSensors] = useState<DoorSensor[]>([
        {
            id: '1',
            name: 'DOOR SENSOR (Left door)',
            type: 'Door sensor',
            deviceId: '000324',
            sensorType: 'Door sensor',
            batteryLevel: 80,
            status: 'intrusion'
        },
        {
            id: '2',
            name: 'DOOR SENSOR (Left door)',
            type: 'Door sensor',
            deviceId: '000325',
            sensorType: 'Door sensor',
            batteryLevel: 75,
            status: 'normal'
        }
    ]);

    const checkEnableContract = useMemo(() => {
        return dataEmergencyDetail.sosEventInfo.step >= 2
    }, [dataEmergencyDetail])

    const handleUpdateStatus = (memberId: string, status: 'success' | 'failed') => {
        console.log(`Updating member ${memberId} status to: ${status}`);
    };

    return (
        <div className="min-h-screen lg:h-screen flex flex-col overflow-auto lg:overflow-hidden">
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-6">
                {/* Stepper */}
                    <TepStep currentStep={dataEmergencyDetail.sosEventInfo.step} />

                {/* Main Content - Row Layout */}
                {/* <div className="text-end mb-4 w-full sm:w-full md:w-auto">
                    <Button 
                        type="primary"
                        className="ms-auto w-full sm:w-full md:w-[150px]"
                        onClick={()=>{
                            navigate('/dashboard/manage-plan')
                        }}
                    >
                        Back
                    </Button>
                </div> */}
                <Row gutter={[16, 16]} className="flex-1 ">
                    {/* Left Column - Household Members List + Action Steps */}
                    <Col xs={24} lg={16} className="flex">
                        <div className="bg-white rounded-lg flex-1 min-h-[400px] lg:h-[calc(100vh-256px)] flex flex-col overflow-hidden">
                            <Row className="!h-full !py-4 flex-1">
                                {/* Household Members List */}
                                <Col 
                                    xs={24} 
                                    sm={24} 
                                    md={24} 
                                    lg={14} 
                                    xl={14}
                                    className={`h-full lg:border-r-2 lg:border-[#C6C8C9]`}>
                                    <div className="px-4 h-full overflow-y-auto">
                                        <ListMember/>
                                    </div>
                                    <div className="block lg:hidden border-b-2 border-[#C6C8C9] mx-4 mt-2"></div>
                                </Col>

                                        <Col 
                                            xs={24} 
                                            sm={24} 
                                            md={24} 
                                            lg={10} 
                                            xl={10}
                                            className="h-full">
                                            <div className="h-full overflow-y-auto px-4 lg:px-0">
                                                <ContractMember 
                                                checkEnableContract={checkEnableContract}
                                                statusContract={statusContract} setStatusContract={setStatusContract}></ContractMember>
                                            </div>
                                        </Col>
                            </Row>
                        </div>
                    </Col>

                    {/* Right Column - Door Sensors */}
                    <Col xs={24} lg={8} className="flex">
                        <div className="flex-1 min-h-[400px] lg:h-[calc(100vh-256px)] overflow-hidden">
                            <DeviceList doorSensors={doorSensors} />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default SecurityAlarm;