import { createModel } from "@rematch/core";
import { RootModel } from "./index";

import { SosWarningState } from "../interfaces/SosWarning";
export const sosWarning = createModel<RootModel>()({
  state: {
    dataEmergencyDetail:{},
    dataFloor:{},
    showToast:false,
    isLoading:false,
    floorIdGlobal:"",
    dataMapOriginal:{},
    test:"test",
    count:1,
    dataEmergency:null,
    statusCaseReceiveCast:false,
    selectOfficer:{},
    step:0
  } as SosWarningState,
  // SetupProjectState,
  
  reducers: {
    // Excel reducers
    setDataEmergencyDetail: (state, payload: any) => ({
      ...state,
      dataEmergencyDetail: payload,
    }),
    setDataFloor: (state, payload: any) => ({
      ...state,
      dataFloor: payload,
    }),
    setShowToast: (state, payload: any) => ({
      ...state,
      showToast: payload,
    }),
    setTest: (state, payload: any) => ({
      ...state,
      test: payload,
    }),
    setFloorIdGlobal: (state, payload: any) => ({
      ...state,
      floorIdGlobal: payload,
    }),
    setIsLoading: (state, payload: any) => ({
      ...state,
      isLoading: payload,
    }),
    setCount: (state, payload: any) => ({
      ...state,
      count: payload,
    }),
    setDataEmergency: (state, payload: any) => ({
      ...state,
      dataEmergency: payload,
    }),

    setStatusCaseReceiveCast: (state, payload: boolean) => ({
      ...state,
      statusCaseReceiveCast: payload
    }),
    setSelectOfficer: (state, payload: any) => ({
      ...state,
      selectOfficer: payload,
    }),

    setStep: (state, payload: number) => ({
      ...state,
      step: payload,
    }),


  },
  
  effects: (_: any) => ({
    // async setDataProject(){
    //   try {
    //     const response = await getProject();
    //     if(response.status){
    //       dispatch.setupProject.setProjectData(response || {});
    //     }
    //     else {
    //       dispatch.setupProject.setProjectData({});
    //     }
    //     return response; // return response เพื่อให้ caller รู้ว่าเสร็จแล้ว
    //   } catch (error) {
    //     console.error('Error in setDataProject:', error);
    //     dispatch.setupProject.setProjectData({});
    //     throw error; // throw error เพื่อให้ caller จัดการได้
    //   }
    // },


  })
}); 