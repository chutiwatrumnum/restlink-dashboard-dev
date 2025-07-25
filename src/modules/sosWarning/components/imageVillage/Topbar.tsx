import React from 'react';
import { useEffect } from 'react';
import { dataAllMap } from '../../../../stores/interfaces/SosWarning';
import { Row, Col, Button, Card } from "antd";
interface TopbarProps {
  projectName: string;
  mode?: 'preview' | 'work-it';
  onModeChange?: (mode: 'preview' | 'work-it') => void;
  dataMapAll: dataAllMap;
}

const Topbar = ({ projectName, mode = 'preview', onModeChange, dataMapAll }: TopbarProps) => {
  // useEffect(() => {
  //   console.log(dataMapAll,'dataMapAll');
  // }, [dataMapAll]);
  const handleModeChange = (newMode: 'preview' | 'work-it') => {
    onModeChange?.(newMode);
  };
  return (
    <>

      <Row gutter={0} >
        <Col
          span={24}
          sm={24}
          md={24}
          lg={24}
        >
          <div className="flex flex-row justify-between items-center 
          p-5 py-3 bg-[#ECF4FF] h-[64px]">
            <div className="flex justify-between w-full" >
              <div className="d-flex justify-center align-center w-full">
                <div className="text-xs text-[#002C55] text-center mr-2">
                  Project name
                </div>
                <div className="font-bold text-[#002C55] text-center">{dataMapAll.projectName || '-'}</div>
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
        </Col>


        {/* <Col
          span={12}
          sm={12}
          md={12}
          lg={12}
        >
          <div className="flex flex-row justify-end items-center  h-[64px]">
            <div className="flex bg-white  w-full  h-full">
              <button
                onClick={() => handleModeChange('preview')}
                className={`flex-1 py-2  text-sm font-medium transition-all duration-200 ${mode === 'preview'
                    ? 'bg-sky-300 !text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#002C55] hover:bg-gray-50'
                  }`}
              >
                preview
              </button>
              <button
                onClick={() => handleModeChange('work-it')}
                className={`flex-1 py-2  text-sm font-medium transition-all duration-200 ${mode === 'work-it'
                    ? 'bg-sky-300 !text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#002C55] hover:bg-gray-50'
                  }`}
              >
                Edit
              </button>
            </div>
          </div>
        </Col> */}

      </Row>




    </>
  );
};
export default Topbar;
