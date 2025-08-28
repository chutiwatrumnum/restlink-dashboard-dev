
import DoorSensor from "../../../../assets/images/DoorSensor.png";
import Sensor from "../../../../assets/images/Sensor.png";
import Door from "../../../../assets/images/Door.png";
import DoorEmergency from "../../../../assets/images/DoorEmergency.png";
import Exclamation from "../../../../assets/images/Exclamation.png";

import Card from "../../../../assets/images/Card.png";
import Computer from "../../../../assets/images/Computer.png";
import Battery from "../../../../assets/images/Battery.png";
import noImg from "../../../../assets/images/noImg.jpeg";


import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../stores";

import { Button, Col } from "antd";
import { useNavigate } from "react-router-dom";

const DeviceList = ({ doorSensors }: { doorSensors: any }) => {
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const iconTitle = useMemo(() => {
        let dataObj = {
            'DeviceWarning': Sensor,
            'emergency': DoorEmergency
        }

        return dataObj[dataEmergencyDetail.type as keyof typeof dataObj]
    }, [dataEmergencyDetail])
    const iconStatus = useMemo(() => {
        let dataObj = {
            'DeviceWarning': Door,
            'emergency': Exclamation
        }
        return dataObj[dataEmergencyDetail.type as keyof typeof dataObj]
    }, [dataEmergencyDetail])

    const deviceDisplay = useMemo(() => {
        if (typeof dataEmergencyDetail?.sosEventDeviceRefs === 'object' &&
            !Array.isArray(dataEmergencyDetail?.sosEventDeviceRefs)) return []

        let objDevice = dataEmergencyDetail?.sosEventDeviceRefs || []
        return objDevice
    }, [dataEmergencyDetail])
    const navigate = useNavigate();
    return (
        <div className="!w-full !h-full">
            {deviceDisplay.length === 0 && (
                <div className="!w-full !h-full p-4 md:p-6 lg:p-0">
                    <div className="flex justify-center items-center w-full h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <span className="text-gray-500 font-sarabun !text-lg">ไม่มีอุปกรณ์</span>
                    </div>
                </div>
            )}

            {deviceDisplay.length > 0 && (
                <div className="w-full h-full py-4 md:py-6 lg:py-0">
                    <div className="
                    bg-white rounded-2xl 
                    overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
                    scrollbar-track-gray-100 h-full">
                                        {deviceDisplay.map((device: any, indexParent: number) => (
                                            <>
                                                <div key={indexParent} className="">
                                                    {/* Sensor Header */}
                                                    <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                                                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                                            <img src={iconTitle} alt="Door" className="w-10 h-10" />
                                                            <h3 className="text-lg font-semibold text-gray-900 font-sarabun">
                                                                {device.name}
                                                            </h3>
                                                        </div>
                                                    </div>

                                                    {/* Sensor Content */}

                                                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 h-full ">
                                                        {/* Door Sensor Image */}
                                                        <div className="flex justify-center mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                                                            <img src={device?.icon || noImg} alt="DoorSensor" className="w-full h-full object-scale-down" />
                                                        </div>

                                                        {/* Status */}
                                                        <div className="flex items-center justify-start gap-2 mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                                                            <img src={iconStatus} alt="Sensor" className="w-10 h-10" />
                                                            <span className=" font-semibold text-gray-900 font-sarabun">
                                                                {

                                                                }
                                                                <div className="flex flex-wrap gap-2">
                                                                    {
                                                                        device.events.map((event: any) => (
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {event}
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </span>
                                                        </div>

                                                        {/* Device Info */}
                                                        {
                                                            device.properties.map((property: any) => (
                                                                <>
                                                                    {
                                                                        (property || []).map((item: any, index: number) => (
                                                                            <>
                                                                                <div className="flex items-center justify-between text-sm rounded-lg p-2 sm:p-3 md:p-4 
                                                mt-2 sm:mt-3 md:mt-0 lg:mt-0">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <img src={Card} alt="Card" className="scale-75" />
                                                                                        <span className="text-gray-600  font-semibold font-sarabun ">{item?.ip || '-'}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <img src={Computer} alt="Computer" className="scale-75" />
                                                                                        <span className="text-gray-600 font-semibold font-sarabun">{device?.custom_name || '-'}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <img src={Battery} alt="Battery" className="scale-75" />
                                                                                        <span className="text-green-600 font-semibold font-sarabun">{item?.value || '0'}%</span>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        ))}
                                                                </>
                                                            ))
                                                        }

                                                    </div>
                                                </div>
                                            </>
                                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DeviceList;