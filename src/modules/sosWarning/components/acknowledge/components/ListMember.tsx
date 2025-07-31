import { Member } from "../../../../../stores/interfaces/SosWarning";
import { readIssueEmergency, completeEmergency } from "../../../service/api/SOSwarning";
import SuccessModal from "../../../../../components/common/SuccessModal";
interface ListMemberProps {
    member: Member;
    count: boolean;
    idMarker: string;
    setIsModalOpen: (isOpen: boolean) => void;
}
    
export const ListMember = ({ member, count, idMarker, setIsModalOpen }: ListMemberProps) => {
    const handleComplete = async () => {
      console.log(idMarker,'idMarker-test')
        let data = {
            eventId: idMarker
        }
        let res = await readIssueEmergency(data)
        if (res.status) {
            console.log(res,'res-test')
            let eventId = res.result.eventId
            let dataComplete = {
                eventId: eventId
            }
            let resComplete = await completeEmergency(dataComplete)
            if (resComplete.status) {
                // console.log(resComplete,'resComplete-test')
                setIsModalOpen(false)
                SuccessModal("Acknowledge Emergency Success", 900)
            }
        }
    }
    return (
        <>
        <div className={` border-gray-200 p-4 ${count ? 'border-b-2' : ''}`}>
            <div className="flex justify-start items-start mb-3 w-full">
                <div className="w-full">
                <h3 className="font-bold text-3xl">{member?.name || '-'}</h3>
                    <div className="flex justify-start items-start w-full">
                        {member?.role === 1 && (
                            <div className="text-[#5387ea]  !font-medium text-2xl mr-auto">Owner</div>
                        )}
                        {member?.role === 0 && (
                            <div className="text-[#5e5e5e]  !font-medium text-2xl mr-auto">(Family)</div>
                        )}
                        <div className="flex gap-2">
                            <button 
                            onClick={handleComplete}
                            className="  
                            w-[120px] bg-[#47a075] hover:bg-[#008000] 
                            !text-white px-4 py-2 rounded-md text-sm font-semibold cursor-pointer tracking-wider">
                            Success
                            </button>
                            <button className="
                            w-[120px] bg-[#cb3d38] hover:bg-[#FF0000] !text-white font-semibold px-4 py-2 rounded-md text-sm cursor-pointer tracking-wider">
                            Failed ({member?.failedCount })
                            </button>
                        </div>
                    </div>
                </div>
            </div>            
            <div className="flex items-center text-gray-600">
              <span
                className="flex items-center justify-center bg-[#5387ea] text-white rounded-full w-8 h-8 p-1 mr-2"
                style={{ minWidth: '2rem', minHeight: '2rem' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/>
                </svg>
              </span>
              <span className="mr-4 text-2xl mr-auto font-medium">{member?.phone || '-'}</span>
              <span className="text-sm text-gray-500">
                (Last call {member?.lastCall || '-'})
              </span>
            </div>
          </div>
        </>
    )
}