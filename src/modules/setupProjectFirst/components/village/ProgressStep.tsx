

const ProgressStep = ({ stepValue, progressSteps = 4 }: { stepValue: number, progressSteps?: number }) => {

    return (
        <>
            <div className="flex justify-center mb-8 mt-10">
                <div className="flex items-center space-x-4">
                    {Array.from({ length: progressSteps }, (_, index) => (
                        <div key={index} className="flex items-center">
                            {index <= stepValue && <div className={`w-25 h-2 bg-blue-500 rounded cursor-pointer`}></div>}
                            {index > stepValue && <div className={`w-25 h-2 bg-gray-300 rounded cursor-pointer`}></div>}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ProgressStep;