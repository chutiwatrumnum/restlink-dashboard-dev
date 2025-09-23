import  { useEffect } from 'react'
import { Button, message } from "antd";
import CardWarning from "../components/securityAlarm/CardWarning";
import CardEmergency from "../components/securityAlarm/CardEmergency";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { SecurityAlarmProvider } from "../contexts/SecurityAlarmContext";
import { callCustomer } from "../service/api/SOSwarning";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import { useNavigate } from 'react-router-dom';
const SecurityAlarm = () => {
    const dispatch = useDispatch();
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    const navigate = useNavigate();
    let processReceiveCase = async (member: any,status:boolean)=>{
        let contact = member.user.contact
        let contact2 = member.user.contact2
        let contact3 = member.user.contact3
        let dataContact:any[] = []
        
        if(contact!='-'){
            dataContact = [contact]
        }
        if(contact2!='-'){
            dataContact = [contact2]
        }
        if(contact3!='-'){
            dataContact = [contact3]
        }
        if(dataContact.length === 0){
            return []
        }
        dataContact = dataContact.filter((arr:any) => arr.contract != '')
        let obj = {
            subId: member?.user?.sub || '',
            contactNumber: dataContact.join(','),
            isContacted:status,
        }
        let data = await callCustomer(dataEmergencyDetail.sosEventInfo.id,obj)

        if(data.status){
            if(status) {
                let dataCallCustomer = data.result
                let dataEventInfo =  JSON.parse(JSON.stringify(dataEmergencyDetail))
                dispatch.sosWarning.setStep(dataCallCustomer.step)
                dataEventInfo.sosEventInfo.step = dataCallCustomer.step
                dataEventInfo.sosEventInfo.isCompleted = dataCallCustomer.is_completed
                dataEventInfo.sosEventInfo.event_help_id = dataCallCustomer.event_help_id
                dataEventInfo.sosEventInfo.sosEventLogs =  [
                    ...dataEventInfo.sosEventInfo.sosEventLogs,
                    {
                    createdAt: new Date().toISOString(),
                }]
                // dataCallCustomer.sosCallHistories
                dispatch.sosWarning.setDataEmergencyDetail(dataEventInfo)
                SuccessModal("Contacted the resident successfully")
            }
            else {
                if(status){
                    message.success('Contacted the resident successfully')
                }
                else {
                    message.warning('Contacted the resident failed')
                }
            }
        }else{
            message.error(data.message)
        }
    }
    const handleCallCustomer = async (member: any,status:boolean,setCallTime:any) => {
        ConfirmModal({
            title : "Confirm contact resident",
            okMessage : "Confirm",
            cancelMessage : "Cancel",
            onOk : () => {
                processReceiveCase(member,status)
                setCallTime(new Date().toISOString())
            },
            onCancel : () => {
                console.log('Cancel')
            },
        })
    };

    useEffect(()=>{
        if(Object.keys(dataEmergencyDetail || {}).length === 0){
            navigate('/dashboard/manage-plan')
            // window.location.href = '/dashboard/manage-plan';
        }
    },[dataEmergencyDetail])

    // useEffect(() => {
    //     if( Object.keys(dataEmergencyDetail).length === 0){
    //         navigate('/dashboard/manage-plan')
    //     }
    // }, [dataEmergencyDetail])
    const typeEmergency = {
        emergency: <CardEmergency></CardEmergency>,
        DeviceWarning: <CardWarning></CardWarning>,
        device: <CardWarning></CardWarning>
    }
    return (
        <SecurityAlarmProvider handleCallCustomer={handleCallCustomer}>
            <div className="h-screen flex flex-col overflow-hidden rounded-b-2xl">
                <div className="flex-1 overflow-auto">
                    {typeEmergency[dataEmergencyDetail.type as keyof typeof typeEmergency]}
                </div>
            </div>
        </SecurityAlarmProvider>
    )
}

export default SecurityAlarm;