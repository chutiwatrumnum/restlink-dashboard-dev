import { useEffect } from "react";
import { Button, message } from "antd";
import CardWarning from "../components/securityAlarm/CardWarning";
import CardEmergency from "../components/securityAlarm/CardEmergency";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { useNavigate } from "react-router-dom";
import { SecurityAlarmProvider } from "../contexts/SecurityAlarmContext";
import { callCustomer,closeJob,closeCase } from "../service/api/SOSwarning";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
const SecurityAlarm = () => {
    const dispatch = useDispatch();
    const { dataEmergencyDetail } = useSelector((state: RootState) => state.sosWarning);
    let processReceiveCase = async (member: any,status:boolean)=>{
        let contact = member.user.contact
        let contact2 = member.user.contact2
        let contact3 = member.user.contact3
        let dataContact:any[] = []
        
        if(contact!='-'){
            dataContact = [...dataContact, contact]
        }
        if(contact2!='-'){
            dataContact = [...dataContact, contact2]
        }
        if(contact3!='-'){
            dataContact = [...dataContact, contact3]
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
                dataEventInfo.sosEventInfo.step = dataCallCustomer.step
                dataEventInfo.sosEventInfo.isCompleted = dataCallCustomer.is_completed
                dataEventInfo.sosEventInfo.event_help_id = dataCallCustomer.event_help_id
                dataEventInfo.sosEventInfo.sosCallHistories =  [{
                    createdAt: new Date().toISOString(),
                }]
                // dataCallCustomer.sosCallHistories
                dispatch.sosWarning.setDataEmergencyDetail(dataEventInfo)
                SuccessModal("ติดต่อลูกบ้านสำเร็จ")
            }
            else {
                message.success('ส่งข้อมูลสำเร็จ')
            }
        }else{
            message.error(data.message)
        }
    }
    const handleCallCustomer = async (member: any,status:boolean,setCallTime:any) => {
        ConfirmModal({
            title : "ยินยันติดต่อลูกบ้าน",
            okMessage : status ? "ติดต่อลูกบ้านสำเร็จ" : "ติดต่อลูกบ้านไม่สำเร็จ",
            cancelMessage : "ยกเลิก",
            onOk : () => {
                processReceiveCase(member,status)
                setCallTime(new Date().toISOString())
            },
            onCancel : () => {
                console.log('ยกเลิก')
            },
        })
    };
    // useEffect(() => {
    //     if( Object.keys(dataEmergencyDetail).length === 0){
    //         navigate('/dashboard/manage-plan')
    //     }
    // }, [dataEmergencyDetail])
    const typeEmergency = {
        emergency: <CardEmergency></CardEmergency>,
        DeviceWarning: <CardWarning></CardWarning>
    }
    return (
        <SecurityAlarmProvider handleCallCustomer={handleCallCustomer}>
            <div className="!h-full">
                {typeEmergency[dataEmergencyDetail.type as keyof typeof typeEmergency]}
            </div>
        </SecurityAlarmProvider>
    )
}

export default SecurityAlarm;