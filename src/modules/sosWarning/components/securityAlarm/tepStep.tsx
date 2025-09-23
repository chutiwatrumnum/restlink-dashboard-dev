import { useSelector } from 'react-redux';
import { Button } from 'antd';
import React, { useMemo } from 'react';
import './tepStep.css';
import { RootState } from '../../../../stores';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { dispatch } from '../../../../stores';

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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dataEmergencyDetail, statusCaseReceiveCast } = useSelector((state: RootState) => state.sosWarning);
  const [stepsEmergency, setStepsEmergency] = React.useState<StepData[]>([
    {
      title: 'Step 1',
      time: '00:00:00',
      description: 'Description of the procedure',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      title: 'Step 2',
      time: '00:00:00',
      description: 'Call the operator',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      title: 'Step 3',
      time: '00:00:00',
      description: 'Follow up on the results',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      title: 'Step 4',
      time: '00:00:00',
      description: 'Completed',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4
    }
  ]);
  const [stepsDeviceWarning, setStepsDeviceWarning] = React.useState<StepData[]>([
    {
      title: 'Step 1',
      time: '00:00:01',
      description: 'Description of the procedure',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      title: 'Step 2',
      time: '00:00:00',
      description: 'Call the operator',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      title: 'Step 3',
      time: '00:00:00',
      description: 'Follow up on the results',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
  ]);
 
  const stepsWithTime: StepData[] = useMemo(() => {
    const dataObj: Record<'emergency' | 'DeviceWarning' | 'device', StepData[]> = {
      emergency: stepsEmergency,
      DeviceWarning: stepsDeviceWarning,
      device: stepsDeviceWarning
    };
    let dataTime: StepData[] = JSON.parse(JSON.stringify(dataObj[dataEmergencyDetail?.type as keyof typeof dataObj] || []));

    dataTime = dataTime.map((item: StepData, index: number) => {
      
      const date = new Date(dataEmergencyDetail?.sosEventInfo?.sosEventLogs?.[index]?.createdAt);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
        const strHours = hours.toString().padStart(2, '0');
        const strMinutes = minutes.toString().padStart(2, '0');
        const strSeconds = seconds.toString().padStart(2, '0');
        item.time = `${strHours}:${strMinutes}:${strSeconds}`;
      } else {
        item.time = '00:00:00';
      }

      // อัปเดตสถานะขั้นตอนตาม currentStep ปัจจุบัน
      item.isActive = currentStep === index + 1;
      item.isCompleted = currentStep > index + 1;
      return item;
    });
    return dataTime;
  }, [dataEmergencyDetail, stepsEmergency, stepsDeviceWarning, currentStep]);


  const handleBack = () => {
    dispatch.sosWarning.setDataEmergencyDetail({})
    dispatch.sosWarning.setStep(0)
    if (statusCaseReceiveCast) {
      navigate('/dashboard/history-building')
    }
  }


  return (
    <>

      <div className="tep-step-container">
        <div className="w-full md:w-auto">
          <Button
              type="primary"
              className="w-full !font-semibold !rounded-xl lg:w-[100px] !h-[40px] !bg-[#3C8BF1] !mb-4  md:mb-0"
              onClick={handleBack}
          >
              Back
          </Button>
        </div>
        <div className="steps-wrapper">
          {stepsWithTime.map((step: StepData, index: number) => (
            <div key={index} className="step-item">
              <div className={`step-circle ${step.isActive ? 'active' : ''} ${step.isCompleted ? 'completed' : ''}`}>
              </div>
              
              
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <div className="step-time">{step.time}</div>
                <p className="step-description">{step.description}</p>
              </div>
              
              
              {index < stepsWithTime.length - 1 && (
                <div className={`step-connector ${currentStep > index + 1 ? 'completed' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TepStep;
