import homeAdd from "../../../../assets/images/setupProject/HomeAdd.png";
import { useGlobalUpload } from "../../screens/condominium/context/GlobalUpload";
interface MapAddPlanFloorProps {
    setStatusAddPlanFloor: (status: boolean) => void;
    resetForm: () => void;
}

const MapAddPlanFloor = ({ setStatusAddPlanFloor, resetForm }: MapAddPlanFloorProps) => {
    const { selectedBuilding, buildingData, setBuildingData } = useGlobalUpload();
    const handleClick = () => {
        resetForm();
        setStatusAddPlanFloor(true);
        setBuildingData({
            ...buildingData,
            [selectedBuilding]: {
                ...buildingData[selectedBuilding],
                imagePreview: '',
            }
        });
    };

    return (
        <>
            <div 
                onClick={handleClick}
                className="h-full min-h-[400px] border-1 border-[#4995FF] 
                border-dashed 
                rounded-xl 
                cursor-pointer
                flex flex-col items-center justify-center
                p-4">
                <img src={homeAdd} alt="homeAdd" className="" />
                <div className="text-center text-lg font-medium mt-4">
                    Add floor plan
                </div>
            </div>
        </>
    )
}

export default MapAddPlanFloor