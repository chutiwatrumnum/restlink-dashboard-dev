
import { useMemo } from 'react';
import { dataAllMap } from '../../../../stores/interfaces/SosWarning';
import { Row, Col, Button, Card } from "antd";
import { useSelector } from 'react-redux';
import { RootState } from '../../../../stores';

interface TopbarProps {
  projectName: string;
  mode?: 'preview' | 'work-it';
  onModeChange?: (mode: 'preview' | 'work-it') => void;
  dataMapAll: dataAllMap;
  dataFloorRef?: React.MutableRefObject<any>; // เปลี่ยนเป็น ref
}

const Topbar = ({ projectName, mode = 'preview', onModeChange, dataMapAll, dataFloorRef }: TopbarProps) => {
  const { projectData } = useSelector((state: RootState) => state.setupProject);
  // ลบการใช้ dataFloor จาก Redux state
  // const { dataFloor } = useSelector((state: RootState) => state.sosWarning);
  const handleModeChange = (newMode: 'preview' | 'work-it') => {
    onModeChange?.(newMode);
  };

  const typeProject = useMemo(() => {
    let projectType = projectData?.projectType?.nameCode || '';
    const strType = projectType.split('_');
    projectType = strType[strType.length - 1];
    return projectType;
  }, [projectData]);
  
  const displayBasement = useMemo(() => {
    const dataFloor = dataFloorRef?.current || {};
    if (!dataFloor || Object.keys(dataFloor).length === 0) return '-';
    if (dataFloor.numberOfFloor < 0) {
      return `B-${dataFloor.floorName}`;
    } else if (dataFloor.numberOfFloor === 0) {
      return "-";
    } else {
      return dataFloor.floorName;
    }
  }, [dataFloorRef?.current]);

  const buildingName = useMemo(() => {
    const dataFloor = dataFloorRef?.current || {};
    return dataFloor?.buildingName || '-';
  }, [dataFloorRef?.current]);


  return (
    <>

      <Row gutter={0} >
        <Col
          span={24}
          sm={24}
          md={24}
          lg={24}
        >

          {
            typeProject === 'village' && (
              <div className="flex flex-row justify-between items-center 
              p-5 py-3 bg-[#ECF4FF] h-[64px]">
                <div className="flex justify-between w-full" >
                  <div className="d-flex justify-center align-center w-full">
                    <div className="text-xs text-[#002C55] text-center mr-2">
                      Project name
                    </div>
                    <div className="font-bold text-[#002C55] text-center">{dataMapAll?.projectName || '-'}</div>
                  </div>
                  <div className="d-flex justify-center w-full">
                    <div className="text-xs text-[#002C55] text-center">Plan type</div>
                    <div className="font-bold text-[#002C55] text-center">Village</div>
                  </div>
                  <div className="d-flex justify-center w-full">
                    <div className="text-xs text-[#002C55] text-center">Condo type</div>
                    <div className="font-bold text-[#002C55] text-center">-</div>
                  </div>
                  <div className="d-flex justify-center w-full">
                    <div className="text-xs text-[#002C55] text-center">Floor</div>
                    <div className="font-bold text-[#002C55] text-center">-</div>
                  </div>
                </div>
              </div>
            )
          }

          {
            typeProject === 'condo' && (
              <div className="flex flex-row justify-between items-center 
              p-5 py-3 bg-[#ECF4FF] h-[64px]">
                <div className="flex justify-between w-full" >
                  <div className="d-flex justify-center align-center w-full">
                    <div className="text-xs text-[#002C55] text-center mr-2">
                      Project name
                    </div>
                    <div className="font-bold text-[#002C55] text-center">{dataMapAll?.projectName || '-'}</div>
                  </div>
                  <div className="d-flex justify-center w-full">
                    <div className="text-xs text-[#002C55] text-center">Plan type</div>
                    <div className="font-bold text-[#002C55] text-center">Condo</div>
                  </div>
                  <div className="d-flex justify-center w-full">
                    <div className="text-xs text-[#002C55] text-center">Condo type</div>
                    <div className="font-bold text-[#002C55] text-center">
                      {
                        projectData?.projectType?.nameEn || '-'
                      }
                    </div>
                  </div>
                  <div className="d-flex justify-center w-full">
                    <div className="text-xs text-[#002C55] text-center">Floor</div>
                    <div className="font-bold text-[#002C55] text-center"
                      onClick={() => console.log(dataFloorRef?.current, 'dataFloor')}
                    >
                      {displayBasement || '-'}
                    </div>
                  </div>

                  <div className="d-flex justify-center w-full">
                    <div className="text-xs text-[#002C55] text-center">
                      Building

                    </div>
                    <div
                      onClick={() => console.log(dataFloorRef?.current, 'dataFloor')}
                      className="font-bold text-[#002C55] text-center">
                      {buildingName}
                    </div>
                  </div>

                </div>
              </div>
            )
          }
        </Col>
      </Row>
    </>
  );
};
export default Topbar;
