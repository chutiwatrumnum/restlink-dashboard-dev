interface TopbarProps {
    condoType: string;
    floor: number;
    buildingNumber: number;
    projectName: string;
  }
  
  const Topbar: React.FC<TopbarProps> = ({ condoType, floor, buildingNumber, projectName }) => {
    return (
      <>
        <div className="flex flex-row justify-between items-center  p-5 py-3 bg-[#ECF4FF]">
          <div className="flex justify-between w-full">
            <div className="d-flex justify-center align-center w-full">
              <div className="text-xs text-[#002C55] text-center mr-2">
                Project name
              </div>
              <div className="font-bold text-[#002C55] text-center">{projectName}</div>
            </div>
            <div className="d-flex justify-center w-full">
              <div className="text-xs text-[#002C55] text-center">Plan type</div>
              <div className="font-bold text-[#002C55] text-center">Condo</div>
            </div>
            <div className="d-flex justify-center w-full">
              <div className="text-xs text-[#002C55] text-center">Condo type</div>
              <div className="font-bold text-[#002C55] text-center">{condoType || '-'}</div>
            </div>
            <div className="d-flex justify-center w-full">
              <div className="text-xs text-[#002C55] text-center">Floor</div>
              <div className="font-bold text-[#002C55] text-center">{floor || '-'}</div>
            </div>
            <div className="d-flex justify-center w-full">
              <div className="text-xs text-[#002C55] text-center">Building</div>
              <div className="font-bold text-[#002C55] text-center">{buildingNumber || '-'}</div>
            </div>
          </div>
        </div>
      </>
    );
  };
  export default Topbar;
  