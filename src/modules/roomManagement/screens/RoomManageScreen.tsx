// Hooks
import { useState, useEffect } from "react";
import "../styles/roomManage.css";
// Components
import Header from "../../../components/templates/Header";
import { Pagination, Tabs } from "antd";
import FloorComponent from "../components/FloorComponent";
import UnitComponent from "../components/UnitComponent";
import AddUserModal from "../components/AddUserModal";

// Types
import type { PaginationProps, TabsProps } from "antd";
import { Floor, Unit } from "../../../stores/interfaces/Management";

// Data
import {
  getBlockListQuery,
  getFloorListQuery,
  getMemberListQuery,
  getUnitListQuery,
} from "../../../utils/queriesGroup/roomManageQueries";
import { getProjectIDQuery } from "../../../utils/queriesGroup/authQueries";

const RoomManageScreen = () => {
  // Variables

  // States
  const [currentBlockId, setCurrentBlockId] = useState<number>();
  const [currentFloor, setCurrentFloor] = useState<Floor>();
  const [currentUnit, setCurrentUnit] = useState<Unit>();

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUnitForModal, setSelectedUnitForModal] = useState<Unit | null>(
    null
  );

  // Functions
  const onTabsChange = (key: string) => {
    // console.log(parseInt(key));
    const currentId = parseInt(key);
    setCurrentBlockId(currentId);
    clearData();
  };

  const onFloorClick = (floor: Floor) => {
    console.log("FLOOR DATA : ", floor);
    setCurrentFloor(floor);
  };

  const clearData = () => {
    setCurrentFloor(undefined);
    setCurrentUnit(undefined);
  };

  const onPageFloorChange: PaginationProps["onChange"] = (page) => {
    console.log(page);
  };

  const onPageUnitChange: PaginationProps["onChange"] = (page) => {
    console.log(page);
  };

  // Modal handlers
  const handleEditClick = (unit: Unit) => {
    setCurrentUnit(unit);
    setSelectedUnitForModal(unit);
    setIsAddUserModalOpen(true);
    console.log("EDIT CLICKED - Unit data:", unit);
    console.log("Unit has owner:", !!unit.unitOwner);
    console.log("Unit family count:", unit.family);
  };

  const handleAddMemberClick = (unit: Unit) => {
    setCurrentUnit(unit);
    setSelectedUnitForModal(unit);
    setIsAddUserModalOpen(true);
    console.log("ADD MEMBER CLICKED - Unit data:", unit);
    console.log("Unit has owner:", !!unit.unitOwner);
    console.log("Unit family count:", unit.family);
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
    setSelectedUnitForModal(null);
  };

  // Data
  const { data: projectData } = getProjectIDQuery();
  const { data: blockData } = getBlockListQuery();

  const { data: floorData } = getFloorListQuery({
    curPage: 1,
    perPage: 20,
    blockId: currentBlockId ? currentBlockId : -1,
    shouldFetch: !!currentBlockId,
  });

  const { data: unitData, isLoading: isUnitLoading } = getUnitListQuery({
    curPage: 1,
    perPage: 20,
    floorId: currentFloor ? currentFloor.id : -1,
    shouldFetch: !!currentFloor,
  });

  const { data: memberData, isLoading: isMemberLoading } = getMemberListQuery({
    unitId: currentUnit?.id ?? -999,
    shouldFetch: currentUnit?.family ? currentUnit?.family > 0 : false,
  });

  // Components

  const items: TabsProps["items"] = blockData?.data.map((block) => ({
    key: block.id.toString(),
    label: block.blockName,
    children: null,
  }));

  useEffect(() => {
    if (blockData !== undefined) {
      console.log("BLOCK DATA : ", blockData);
    }
    if (floorData !== undefined) {
      console.log("FLOOR DATA : ", floorData);
    }
    if (unitData !== undefined) {
      console.log("UNIT DATA : ", unitData);
    }
    if (memberData !== undefined) {
      console.log("MEMBER DATA : ", memberData);
    }
  }, [blockData, floorData, unitData, memberData]);

  useEffect(() => {
    setCurrentBlockId(blockData?.data[0].id);
  }, [blockData]);

  // Helper function เพื่อสร้าง initial members จาก unit data
  const getInitialMembers = (unit: Unit) => {
    const members = [];

    // เพิ่มเจ้าของห้องถ้ามี
    if (unit.unitOwner && unit.unitOwner.givenName) {
      members.push({
        id: `owner-${unit.id}`,
        userId: `owner-user-${unit.id}`,
        firstName: unit.unitOwner.givenName,
        lastName: unit.unitOwner.familyName || "",
        email: unit.unitOwner.email || "",
        roleId: 1,
        roleName: "Owner",
        imageProfile: unit.unitOwner.imageProfile,
      });
    }

    return members;
  };

  return (
    <>
      <div className="flex flex-row w-full justify-between items-start">
        <Header
          title={
            currentFloor ? `Floor ${currentFloor.floorName}` : "Room management"
          }
        />
        {currentFloor ? (
          <span
            onClick={clearData}
            className="text-2xl/[40px] font-normal hover:cursor-pointer">
            {"< Back"}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col justify-center items-center w-full pl-4">
        {/* Section 1 */}
        <section className="flex flex-row justify-between items-center w-full">
          <span className="text-3xl font-normal">
            {projectData?.projectName}
          </span>
          <span className="text-3xl font-normal">
            {`Total number of floors ${floorData?.total}`}
          </span>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col justify-center items-start w-full mt-4">
          <Tabs
            // defaultActiveKey={blockData?.data[0].id.toString()}
            items={items}
            onChange={onTabsChange}
          />
          {!currentFloor ? (
            <div className="flex flex-col w-full h-full justify-between items-end">
              <div className="grid grid-cols-5 gap-4 w-full mb-8">
                {floorData?.data.map((floor) => (
                  <FloorComponent
                    key={floor.id}
                    floor={floor}
                    onFloorClick={onFloorClick}
                  />
                ))}
              </div>
              <Pagination
                defaultCurrent={1}
                pageSize={20}
                onChange={onPageFloorChange}
                total={floorData?.total}
                showSizeChanger={false}
              />
            </div>
          ) : (
            <div className="flex flex-col w-full h-full justify-between items-end">
              <div className="grid grid-cols-4 gap-4 w-full max-2xl:grid-cols-3 mb-8">
                {unitData
                  ? unitData?.data.map((unit) => (
                      <UnitComponent
                        key={unit.id}
                        unit={unit}
                        onEditClick={() => handleEditClick(unit)}
                        onAddMemberClick={() => handleAddMemberClick(unit)}
                      />
                    ))
                  : null}
              </div>
              <Pagination
                defaultCurrent={1}
                pageSize={20}
                onChange={onPageUnitChange}
                total={unitData?.total}
                showSizeChanger={false}
              />
            </div>
          )}
        </section>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseModal}
        unitInfo={
          selectedUnitForModal
            ? {
                address: selectedUnitForModal.roomAddress,
                roomNo: selectedUnitForModal.unitNo,
                unitId: selectedUnitForModal.id,
              }
            : undefined
        }
        // ส่งข้อมูลสมาชิกเริ่มต้นจาก unit data
        initialMembers={
          selectedUnitForModal ? getInitialMembers(selectedUnitForModal) : []
        }
      />
    </>
  );
};

export default RoomManageScreen;
