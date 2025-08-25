import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import React, { useMemo } from 'react';
import './tepStep.css';
import { RootState } from '../../../../stores';
import { Button } from 'antd';

interface StepData {
  title: string;
  time: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface TepStepProps {
  currentStep?: number;
}

const TepStep: React.FC<TepStepProps> = ({ currentStep = 1 }) => {
    const { dataEmergencyDetail } = useSelector((state: RootState) => 
        state.sosWarning);
  const [stepsEmergency, setStepsEmergency] = React.useState<StepData[]>([
    {
      title: 'รับเคส',
      time: '00:00:00',
      description: 'รับเคสจากระบบ',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      title: 'โทรติดต่อลูกค้า',
      time: '00:00:00',
      description: 'โทรติดต่อลูกค้า',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      title: 'ปิดงาน',
      time: '00:00:00',
      description: 'ปิดงาน',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      title: 'ปิดเคส',
      time: '00:00:00',
      description: 'ปิดเคส',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4
    }
  ]);
  const [stepsDeviceWarning, setStepsDeviceWarning] = React.useState<StepData[]>([
    {
      title: 'รับเคส',
      time: '00:00:01',
      description: 'รับเคสจากระบบ',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      title: 'โทรติดต่อลูกค้า',
      time: '00:00:00',
      description: 'โทรติดต่อลูกค้า',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      title: 'ปิดงาน',
      time: '00:00:00',
      description: 'ปิดงาน',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
  ]);
 
  const stepsWithTime = useMemo(() => {
    let dataObj = {
      emergency: stepsEmergency,
      DeviceWarning: stepsDeviceWarning
    };
    let dataTime = JSON.parse(JSON.stringify(dataObj[dataEmergencyDetail?.type as keyof typeof dataObj]));


    dataTime = dataTime.map((item: any, index: number) => {
      let date = new Date(dataEmergencyDetail?.sosEventInfo?.sosCallHistories[index]?.createdAt);
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();

      // ตรวจสอบว่า hours, minutes, seconds ไม่เป็น NaN
      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        let strHours = hours.toString().padStart(2, '0');
        let strMinutes = minutes.toString().padStart(2, '0');
        let strSeconds = seconds.toString().padStart(2, '0');
        item.time = `${strHours}:${strMinutes}:${strSeconds}`;
      } else {
        item.time = '00:00:00';
      }
      return item;
    });
    return dataTime;
  }, [dataEmergencyDetail, stepsEmergency, stepsDeviceWarning]);

  return (
    <div className="tep-step-container">
      <div className="steps-wrapper">
        {stepsWithTime.map((step, index) => (
          <div key={index} className="step-item">
            <div className={`step-circle ${step.isActive ? 'active' : ''} ${step.isCompleted ? 'completed' : ''}`}>
            </div>
            
            
            <div className="step-content">
              <h3 className="step-title">{step.title}</h3>
              <div className="step-time">{step.time}</div>
              <p className="step-description">{step.description}</p>
            </div>
            
            
            {index < stepsEmergency.length - 1 && (
              <div className={`step-connector ${currentStep > index + 1 ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TepStep;
