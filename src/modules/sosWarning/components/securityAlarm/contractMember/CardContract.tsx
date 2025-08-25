const CardContract = ({ statusContract, setStatusContract }: { statusContract: string, setStatusContract: (status: string) => void }) => {
    return (
        <>
            <div className=" p-6 h-full flex flex-col justify-center items-start">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sarabun">
                    1. Corrective action steps
                </h3>
                <p className="text-[#929292] text-sm mb-6 leading-relaxed font-sarabun">
                    Call the resident and inform them of the details of the incident that needs to be reported.
                </p>

                <div className=" w-full">
                    <h4 className="text-base font-semibold text-gray-900 font-sarabun text-left md:text-center">
                        Action Steps
                    </h4>
                    <button 
                    onClick={() => setStatusContract("form")}
                    className="w-full py-3 px-4 border-2 border-blue-500 
                    text-blue-600 rounded-xl font-medium hover:bg-blue-50 
                    transition-all duration-200 hover:shadow-md font-sarabun  
                    cursor-pointer
                    ">
                        Contact customers
                    </button>
                </div>
            </div>
        </>
    )
}

export default CardContract;