interface BuildingCondoProps {
  buildingPlan: {
    condoType: string;
    floor: number;
    numberOfBuilding: number;
  }
}

const BuildingCondo: React.FC<BuildingCondoProps> = ({ buildingPlan }) => {
  if (!buildingPlan) return null;
  const { floor, numberOfBuilding } = buildingPlan;

  return (
    <div className="flex justify-center items-center p-8">
      {Array.from({ length: numberOfBuilding }).map((_, bIdx) => (
        <div key={bIdx} className="inline-block bg-[#f5dfff]  mx-2 ">
          <div className="flex flex-col-reverse items-center">
            {[...Array(floor)].map((_, i) => (
              <>
                <div key={i} className="flex items-center m-0.5 px-4 ">
                  <div className="w-4 h-4 bg-white border border-gray-300" />
                  <div className="w-4 h-4 bg-white border border-gray-300" />
                  <div className="w-6 text-center font-bold text-[#222222] text-xl mx-auto">{floor - i}</div>
                  <div className="w-4 h-4 bg-white border border-gray-300" />
                  <div className="w-4 h-4 bg-white border border-gray-300" />
                </div>
                {i !== floor - 1 && (
                  <div className="h-[2px] w-full bg-white " />
                )}
              </>
            ))}
          </div>
          <div className="text-center font-bold text-lg mt-2">Building {bIdx + 1}</div>
        </div>
      ))}
    </div>
  );
};

export default BuildingCondo;