import { useState,useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores/";
import { Row, Col } from "antd";
import { getVillageData } from "../service/api/SOSwarning";
import { CondoProvider } from "../contexts/Condo";
import Building from "./buildingCondo/Building";
import { useGlobal } from "../contexts/Global";
let BuildingCondo = ({ onDataFloorChange }: { onDataFloorChange?: (dataFloor: any) => void }) => {
    const [dataBuilding,setDataBuilding] = useState<any>(null);
    const { dataEmergency } = useGlobal();
    useEffect(()=>{
        let getDataBuilding = async () => {
            let data = await getVillageData();
            if(data.status){

            // Duplicate floors และแบ่งตึกถ้าเกิน 20 ชั้น
            // if (data.result?.building && Array.isArray(data.result.building)) {
            //     const maxFloorsPerBuilding = 20;
            //     let newBuildings: any[] = [];
            //     data.result.building.forEach((building: any, buildingIndex: number) => {
            //         if (building.floors && Array.isArray(building.floors)) {
            //             const originalFloors = [...building.floors];
            //             let targetFloorCount = 0;
                        
            //             if (buildingIndex === 0) {
            //                 targetFloorCount = 30; 
            //             } else if (buildingIndex === 1) {
            //                 targetFloorCount = 50; 
            //             } else {
            //                 targetFloorCount = originalFloors.length; 
            //             }
                        
            //             let allFloors = [...originalFloors];
            //             let floorIdCounter = 40000 + (buildingIndex * 1000);
                        
            //             while (allFloors.length < targetFloorCount) {
            //                 const sourceFloorIndex = (allFloors.length - originalFloors.length) % originalFloors.length;
            //                 const sourceFloor = originalFloors[sourceFloorIndex];
                            
            //                 const duplicatedFloor = {
            //                     ...sourceFloor,
            //                     floorId: floorIdCounter + allFloors.length + 1,
            //                     numberOfFloor: allFloors.length + 1
            //                 };
                            
            //                 allFloors.push(duplicatedFloor);
            //             }
                        
            //             if (allFloors.length <= maxFloorsPerBuilding) {
            //                 newBuildings.push({
            //                     ...building,
            //                     floors: allFloors,
            //                     floorsSize: allFloors.length
            //                 });
            //             } else {
            //                 let subBuildingIndex = 1;
            //                 for (let i = 0; i < allFloors.length; i += maxFloorsPerBuilding) {
            //                     const subFloors = allFloors.slice(i, i + maxFloorsPerBuilding);
            //                     const subBuildingName = `${building.blockName}`;
                                
            //                     newBuildings.push({
            //                         ...building,
            //                         blockId: building.blockId * 100 + subBuildingIndex,
            //                         blockName: subBuildingName,
            //                         floors: subFloors,
            //                         floorsSize: subFloors.length
            //                     });
                                
            //                     subBuildingIndex++;
            //                 }
            //             }
            //         } else {
            //             newBuildings.push(building);
            //         }
            //     });  
            //     data.result.building = newBuildings;
            // }
            // console.log(data.result.building,'dataAllMap.result.building')
                setDataBuilding(data.result)
            }
            
        }
        getDataBuilding();
    },[dataEmergency])
    return (
        <CondoProvider dataBuilding={dataBuilding}>
            <Building onDataFloorChange={onDataFloorChange}></Building>
        </CondoProvider>
    )
}

export default BuildingCondo;