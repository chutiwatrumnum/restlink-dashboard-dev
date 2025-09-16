

const TopbarListMember = ({ dataEmergencyDetail,HomeBlue }: any) => {
    return (
        <>
            <div className="pt-6 pb-4 px-0 border-gray-100 flex-shrink-0">
                <div className="w-full text-2xl text-[#002C55] mb-3 !font-semibold ">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <span className="!text-2xl"> Contact list of household members</span>
                    </div>
                </div>
                <div className="flex items-center text-gray-500">
                    <img src={HomeBlue} alt="HomeBlue" className="w-6 h-6 mr-5" />
                    <span className="text-sm !text-xl font-medium text-[#929292] ">
                        {dataEmergencyDetail?.sosEventInfo?.unit?.roomAddress || '-'}
                    </span>
                </div>
            </div>
        </>
    )
}

export default TopbarListMember