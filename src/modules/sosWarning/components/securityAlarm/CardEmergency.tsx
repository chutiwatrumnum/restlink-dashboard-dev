import React, { useState, useMemo } from "react";
import { Button, Col, Row, Card } from "antd";
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
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const [statusContract, setStatusContract] = useState<string>(
        dataEmergencyDetail?.sosEventInfo?.step === 3 ? "form" :
            dataEmergencyDetail?.sosEventInfo?.step === 4 ? "success" :
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
        return dataEmergencyDetail?.sosEventInfo?.step >= 2
    }, [dataEmergencyDetail])


    const currentStep = useMemo(() => {
        return dataEmergencyDetail?.sosEventInfo?.step
    }, [dataEmergencyDetail])


    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-6 min-h-0">
                
                <Card className="!mb-6 !border-none">
                    <TepStep currentStep={currentStep} />
                </Card>
                <Row gutter={[20, 20]} className="flex-1 min-h-0" style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Left Column - Household Members List + Action Steps */}
                    <Col xs={24} lg={16} className="flex pr-0 md:pr-4" style={{ height: '100%' }}>
                        <div className="bg-white rounded-lg flex-1 flex flex-col min-h-0 overflow-hidden" style={{ height: '100%' }}>
                            <Row className="flex-1 min-h-0 !py-4" style={{ height: '100%' }}>
                                {/* Household Members List */}
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={14}
                                    xl={14}
                                    className="lg:border-r-2 lg:border-[#C6C8C9] flex flex-col"
                                    style={{ height: '100%' }}>
                                    <div className="px-4 flex-1 min-h-0 overflow-y-auto" style={{ height: '100%' }}>
                                        <ListMember />
                                    </div>
                                    <div className="block hidden border-b-2 border-[#C6C8C9] mx-4 mt-2"></div>

                                </Col>
                                <Col
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={10}
                                    xl={10}
                                    className="flex flex-col"
                                    style={{ height: '100%' }}>
                                    <div className="flex-1 min-h-0 overflow-y-auto" style={{ height: '100%' }}>
                                        <ContractOfficer 
                                        enableContractOfficer={enableContractOfficer}
                                        statusContract={statusContract} setStatusContract={setStatusContract}></ContractOfficer>
                                    </div>
                                </Col>
                                    
                                

                            </Row>
                        </div>
                    </Col>

                    {/* Right Column - Door Sensors */}
                    <Col xs={24} lg={8} className="flex pl-0 md:pl-4" style={{ height: '100%' }}>
                        <div className="rounded-lg flex-1 min-h-0 overflow-hidden" style={{ height: '100%' }}>
                            <DeviceList doorSensors={doorSensors} />
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CardEmergency;