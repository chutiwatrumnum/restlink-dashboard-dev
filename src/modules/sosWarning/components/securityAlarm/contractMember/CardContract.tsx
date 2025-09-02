const CardContract = ({ statusContract, setStatusContract, checkEnableContract }: { statusContract: string, setStatusContract: (status: string) => void, checkEnableContract: boolean }) => {
    return (
        <>
            <div className=" p-0 sm:p-0  lg:p-6 h-full flex flex-col justify-start items-start">
                
                <h3 className="text-lg font-semibold text-gray-900 mb-4 ">
                    1. Corrective action steps 
                </h3>
                <p className="text-[#929292] text-lg font-medium mb-6 leading-relaxed">
                    Call the resident and inform them of the details of the incident that needs to be reported.
                </p>
                
                {
                    checkEnableContract && (
                        <>
                            <div className=" w-full">
                                <h4 className="!text-2xl font-bold text-gray-900  text-left md:text-center">
                                    Action Steps
                                </h4>
                                <button 
                                onClick={() => setStatusContract("form")}
                                className="w-full py-3 px-4 border-2 border-blue-500 
                                text-blue-600 rounded-xl font-medium hover:bg-blue-50 
                                transition-all duration-200 hover:shadow-md   
                                cursor-pointer
                                ">
                                    Contact customers
                                </button>
                            </div>
                        </>       
                    )
                }



            </div>
        </>
    )
}

export default CardContract;