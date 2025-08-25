import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"

const SocketRead = () => {
    const dispatch = useDispatch();
    // const { test } = useSelector((state: RootState) => state.sosWarning);
    const [count, setCount] = useState(0);
  return (
    <div className="relative" style={{zIndex:1000}}>
                  <button 
            type="button" 
            className="!h-[42px] !w-[100px] !bg-blue-500 !text-white rounded px-3"
            onClick={(e) => {
              setCount(count + 1);
              // e.preventDefault();
              // e.stopPropagation();
              // dispatch.sosWarning.setTest("test2");
              // dispatch.sosWarning.setShowToast(true);
              // แสดง toast notification ด้วย
            }}
          >
              Test SOS  {count}
          </button> 
    </div>
  )
}

export default SocketRead