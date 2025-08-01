// Hooks
import { useState, useEffect } from "react";
import "../styles/roomManage.css";
// Components
import Header from "../../../components/templates/Header";
import { Pagination, Tabs } from "antd";
import FloorComponent from "../components/FloorComponent";
import UnitComponent from "../components/UnitComponent";
import RoomManageModal from "../components/RoomManageModal";
import SelectUserModal from "../components/SelectUserModal";

// Types
import type { PaginationProps, TabsProps } from "antd";
import {
  Floor,
  Unit,
  DeleteMemberPayload,
} from "../../../stores/interfaces/Management";

// Data
import {
  getBlockListQuery,
  getFloorListQuery,
  getMemberListQuery,
  getUnitListQuery,
} from "../../../utils/queriesGroup/roomManageQueries";
import { getProjectIDQuery } from "../../../utils/queriesGroup/authQueries";

// API
import { deleteMemberMutation } from "../../../utils/mutationsGroup/managementMutation";

const RoomManageScreen = () => {
  // States
  const [currentBlockId, setCurrentBlockId] = useState<number>();
  const [currentFloor, setCurrentFloor] = useState<Floor>();
  const [currentUnit, setCurrentUnit] = useState<Unit>();
  const [floorPage, setFloorPage] = useState<number>(1);
  const [unitPage, setUnitPage] = useState<number>(1);
  const [currentRoleId, setCurrentRoleId] = useState<number>(-1);
  const [isSelectUserModalOpen, setIsSelectUserModalOpen] = useState(false);

  // Data
  const { data: projectData } = getProjectIDQuery();
  const { data: blockData } = getBlockListQuery();

  const { data: floorData } = getFloorListQuery({
    curPage: floorPage,
    perPage: 20,
    blockId: currentBlockId ? currentBlockId : -1,
    shouldFetch: !!currentBlockId,
  });

  const { data: unitData, refetch: refetchUnit } = getUnitListQuery({
    curPage: unitPage,
    perPage: 20,
    floorId: currentFloor ? currentFloor.id : -1,
    shouldFetch: !!currentFloor,
  });

  const { data: memberData, refetch: refetchMember } = getMemberListQuery({
    unitId: currentUnit?.id ?? -999,
    shouldFetch: !!currentUnit,
  });

  // API
  const deleteMember = deleteMemberMutation();

  // Functions
  const onTabsChange = (key: string) => {
    // console.log(parseInt(key));
    const currentId = parseInt(key);
    setCurrentBlockId(currentId);
    clearData();
  };

  const onFloorClick = (floor: Floor) => {
    // console.log("FLOOR DATA : ", floor);
    setCurrentFloor(floor);
  };

  const clearData = () => {
    setCurrentFloor(undefined);
    setCurrentUnit(undefined);
  };

  const onPageFloorChange: PaginationProps["onChange"] = (page) => {
    // console.log(page);
    setFloorPage(page);
  };

  const onPageUnitChange: PaginationProps["onChange"] = (page) => {
    // console.log(page);
    setUnitPage(page);
  };

  const onAddUserClick = () => {
    setIsSelectUserModalOpen(true);
  };

  const onSelectUserClose = () => {
    setIsSelectUserModalOpen(false);
  };

  const onRoleSelected = (index: number) => {
    if (memberData) {
      const roleId = memberData[index]?.roleId;
      setCurrentRoleId(roleId);
    } else {
      // console.warn("Member data is undefined");
    }
  };

  const onAddSuccess = () => {
    setCurrentUnit(undefined);
    setIsSelectUserModalOpen(false);
    refetchUnit();
  };

  const onDeleteMember = (payload: DeleteMemberPayload) => {
    deleteMember.mutateAsync(payload).then(() => {
      refetchMember();
    });
  };

  // Components

  const items: TabsProps["items"] = blockData?.data.map((block) => ({
    key: block.id.toString(),
    label: block.blockName,
    children: null,
  }));

  // useEffect(() => {
  //   if (blockData !== undefined) {
  //     console.log("BLOCK DATA : ", blockData);
  //   }
  //   if (floorData !== undefined) {
  //     console.log("FLOOR DATA : ", floorData);
  //   }
  //   if (unitData !== undefined) {
  //     console.log("UNIT DATA : ", unitData);
  //   }
  //   if (memberData !== undefined) {
  //     console.log("MEMBER DATA : ", memberData);
  //   }
  // }, [blockData, floorData, unitData, memberData]);

  useEffect(() => {
    setCurrentBlockId(blockData?.data[0].id);
  }, [blockData]);

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
            className="text-2xl/[40px] font-normal hover:cursor-pointer"
          >
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
                        onEditClick={() => {
                          setCurrentUnit(unit);
                        }}
                        onAddMemberClick={() => {
                          setCurrentUnit(unit);
                        }}
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

      <RoomManageModal
        isModalOpen={currentUnit ? true : false}
        onCancel={() => {
          setCurrentUnit(undefined);
        }}
        unitData={currentUnit}
        memberData={memberData}
        onAdd={onAddUserClick}
        onDelete={onDeleteMember}
        onRoleSelected={onRoleSelected}
      />
      <SelectUserModal
        open={isSelectUserModalOpen}
        unitId={currentUnit?.id ?? -1}
        roleId={currentRoleId}
        onClose={onSelectUserClose}
        onSuccess={onAddSuccess}
      />
    </>
  );
};

export default RoomManageScreen;
