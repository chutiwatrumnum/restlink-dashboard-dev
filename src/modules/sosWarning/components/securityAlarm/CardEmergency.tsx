import React, { useState, useMemo } from "react";
import { Button, Col, Row } from "antd";
import TepStep from "./tepStep";
import ListMember from "./ListMember";
import ContractOfficer from "./ContractOfficer";
import ContractMember from "./ContractMember";
import DeviceList from "./DeviceList";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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

const CardEmergency = () => {
    const dispatch = useDispatch();
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const navigate = useNavigate();
    const [statusStep, setStatusStep] = useState<string>('success');
    const [statusContract, setStatusContract] = useState<string>(
        dataEmergencyDetail.sosEventInfo.step === 3 ? "form" :
            dataEmergencyDetail.sosEventInfo.step === 4 ? "success" :
                "contract"
    );
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



    const enableContractOfficer = useMemo(() => {
        return dataEmergencyDetail.sosEventInfo.step >= 2
    }, [dataEmergencyDetail])


    const currentStep = useMemo(() => {
        return dataEmergencyDetail.sosEventInfo.step
    }, [dataEmergencyDetail])


    return (
        <div className="min-h-screen lg:h-screen font-sarabun flex flex-col lg:overflow-hidden">
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-6">
                {/* Stepper */}
                <div className="mb-8">
                    <TepStep currentStep={currentStep} />
                </div>
                {/* Main Content - Row Layout */}
                <Row gutter={[16, 16]} className="flex-1">
                    {/* Left Column - Household Members List + Action Steps */}
                    <Col xs={24} lg={16} className="flex">
                        <div className="bg-white rounded-lg flex-1 min-h-[400px] lg:h-[calc(100vh-220px)] flex flex-col overflow-hidden">
                            <Row className="!h-full flex-1">
                                {/* Household Members List */}
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={enableContractOfficer ? 14 : 24}
                                    xl={enableContractOfficer ? 14 : 24}
                                    className={`h-full ${enableContractOfficer ? 'lg:border-r-2 lg:border-[#C6C8C9]' : ''}`}>
                                    <div className="px-4 h-full overflow-y-auto">
                                        <ListMember />
                                    </div>

                                </Col>
                                {
                                    enableContractOfficer && (
                                        <Col
                                            xs={24}
                                            sm={24}
                                            md={24}
                                            lg={10}
                                            xl={10}
                                            className="h-full">
                                            <div className="h-full overflow-y-auto">
                                                <ContractOfficer statusContract={statusContract} setStatusContract={setStatusContract}></ContractOfficer>
                                            </div>
                                        </Col>
                                    )
                                }

                            </Row>
                        </div>
                    </Col>

                    {/* Right Column - Door Sensors */}
                    <Col xs={24} lg={8} className="flex">
                        <div className=" h-full bg-white rounded-lg flex-1 min-h-[400px] lg:h-[calc(100vh-220px)] overflow-hidden">
                            <DeviceList doorSensors={doorSensors} />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CardEmergency;