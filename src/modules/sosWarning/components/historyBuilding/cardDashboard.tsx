import React, { useMemo } from 'react';
import { DownloadOutlined, FileTextOutlined, DesktopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import CaseAll from '../../../../assets/icons/dashboardHistory/CaseAll.png';
import CaseEvent from '../../../../assets/icons/dashboardHistory/EventOccurred.png';
import CaseDevice from '../../../../assets/icons/dashboardHistory/ProblemDevice.png';
import CaseConfirm from '../../../../assets/icons/dashboardHistory/ConfirmSuccess.png';



interface DashboardCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    bgColor: string;
    iconColor: string;
    index: number;
    setStep: (step: string) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({  index, title, count, icon, bgColor, iconColor, setStep }) => {
    const coverIndex = useMemo(()=>{
        if(index == 3) {
            return '4'
        }
        return index ?  index.toString() : ''
    },[index])
    return (
        <div className="flex justify-end items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer" >
            {/* Icon Section */}
            <div 
                className={` flex items-center justify-center  `}
            >
                <div className="text-white text-xl">
                    {icon || '-'}
                </div>
            </div>
            
            {/* Content Section */}
            <div className="ms-auto">
                <div className="text-gray-600 text-sm mb-1 !text-xl">
                    {title || '-'}
                </div>
                <div className="text-end text-3xl font-bold text-gray-800">
                    {count || 0}
                </div>
            </div>
        </div>
    );
};

const CardDashboard = ({summaryStore , setStep}:{summaryStore:any, setStep:any}) => {
    const dashboardData = [
        {
            title: "All Cases",
            count: summaryStore.total,
            icon: <img src={CaseAll} className=" " alt="CaseAll" />,
            bgColor: "bg-blue-500",
            iconColor: "#3b82f6"
        },
        {
            title: "Emergency Events",
            count: summaryStore.emergency,
            icon: <img src={CaseEvent} className=" " alt="CaseEvent" />,
            bgColor: "bg-red-500", 
            iconColor: "#ef4444"
        },
        {   
            title: "Device Issues",
            count: summaryStore.deviceIssue,
            icon: <img src={CaseDevice} className=" " alt="CaseDevice" />,
            bgColor: "bg-orange-500",
            iconColor: "#f97316"
        },
        {
            title: "Confirmed Completed",
            count: summaryStore.complete,
            icon: <img src={CaseConfirm} className="" alt="CaseConfirm" />,
            bgColor: "bg-green-500",
            iconColor: "#22c55e"
        }
    ];

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.map((item, index) => (
                    <DashboardCard
                        key={index}
                        title={item.title}
                        count={item.count}
                        icon={item.icon}
                        bgColor={item.bgColor}
                        iconColor={item.iconColor}
                        setStep={setStep}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default CardDashboard;