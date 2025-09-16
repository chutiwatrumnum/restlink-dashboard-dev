import { useState,useEffect } from "react";

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
                // แบ่งตึกใหม่ทุก ๆ 20 ชั้นและต่อกันแนวนอน
                if (data.result?.building && Array.isArray(data.result.building)) {
                    const maxFloorsPerBuilding = 20;
                    const newBuildings: any[] = [];
                    data.result.building.forEach((building: any) => {
                        const floors = Array.isArray(building.floors) ? building.floors : [];
                        if (floors.length <= maxFloorsPerBuilding) {
                            newBuildings.push({
                                ...building,
                                floors,
                                floorsSize: floors.length
                            });
                        } else {
                            let subBuildingIndex = 1;
                            for (let i = 0; i < floors.length; i += maxFloorsPerBuilding) {
                                const subFloors = floors.slice(i, i + maxFloorsPerBuilding);
                                newBuildings.push({
                                    ...building,
                                    blockId: building.blockId * 100 + subBuildingIndex,
                                    blockName: building.blockName,
                                    floors: subFloors,
                                    floorsSize: subFloors.length
                                });
                                subBuildingIndex++;
                            }
                        }
                    });
                    data.result.building = newBuildings;
                }
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