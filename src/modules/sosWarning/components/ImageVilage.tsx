import { Card } from "antd";
const ImageVillage = ({ uploadedImage }: { uploadedImage: string }) => {
  return (
    <>
        <div className="flex flex-row justify-between items-center  p-5 py-3 bg-[#ECF4FF]">
          <div className="flex justify-between w-full">
            <div className="d-flex justify-center align-center w-full">
              <div className="text-xs text-[#002C55] text-center mr-2">
                Project name
              </div>
              <div className="font-bold text-[#002C55] text-center">AITAN1</div>
            </div>
            <div className="d-flex justify-center w-full">
              <div className="text-xs text-[#002C55] text-center">
                Plan type
              </div>
              <div className="font-bold text-[#002C55] text-center">
                Village
              </div>
            </div>
            <div className="d-flex justify-center w-full">
              <div className="text-xs text-[#002C55] text-center">
                Condo type
              </div>
              <div className="font-bold text-[#002C55] text-center">-</div>
            </div>
            <div className="d-flex justify-center w-full">
              <div className="text-xs text-[#002C55] text-center">Floor</div>
              <div className="font-bold text-[#002C55] text-center">-</div>
            </div>
          </div>
        </div>
        <div className="">
          <img
            src={uploadedImage}
            alt="Plan"
            className="w-full h-[500px] object-contain"
          />
        </div>
        {/* สามารถ overlay tooltip/alert ได้ที่นี่ */}
    </>
  );
};

export default ImageVillage;
