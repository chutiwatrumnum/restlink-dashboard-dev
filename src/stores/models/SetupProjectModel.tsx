import { createModel } from "@rematch/core";
import { RootModel } from "./index";
import { CondoUnit, Basement, DataSetupUnitType } from "../interfaces/SetupProject";
import { getProject,getStepCondo } from "../../modules/setupProjectFirst/service/api/SetupProject";
import { encryptStorage } from "../../utils/encryptStorage";

interface SetupProjectState {
  projectData: any;
  excelData: {
    Condo: CondoUnit[];
    Basement: Basement[];
  };
  dataSetupUnit: DataSetupUnitType;
  step: number;
  uploadedFileName: string;
  isExcelUploaded: boolean;
  imageFileObject: File | null;
  uploadedImage: string | null;
  uploadedImageFileName: string;
  isImageUploaded: boolean;
}

const initialState: SetupProjectState = {
  projectData: {},
  excelData: {
    Condo: [],
    Basement: [],
  },
  dataSetupUnit: {
    block: [],
    floor: [],
  } as DataSetupUnitType,
  step: 0,
  uploadedFileName: '',
  isExcelUploaded: false,
  imageFileObject: null,
  uploadedImage: null,
  uploadedImageFileName: '',
  isImageUploaded: false,
};

export const setupProject = createModel<RootModel>()({
  state: initialState,
  
  reducers: {
    // Excel reducers
    setExcelData: (state, payload: { Condo: CondoUnit[]; Basement: Basement[]; }) => ({
      ...state,
      excelData: payload,
      isExcelUploaded: true
    }),
    
    setUploadedFileName: (state, payload: string) => ({
      ...state,
      uploadedFileName: payload
    }),
    
    clearExcelData: (state) => ({
      ...state,
      excelData: {
        Condo:[],
        Basement:[]
      },
      uploadedFileName: '',
      isExcelUploaded: false
    }),
    
    // Image reducers
    setImageData: (state, payload: { imageData: string; fileName: string;  }) => ({
      ...state,
      uploadedImage: payload.imageData,
      uploadedImageFileName: payload.fileName,
      isImageUploaded: true
    }),

    setImageFileObject: (state, payload: File) => ({
      ...state,
      imageFileObject: payload
    }),
    
    clearImageData: (state) => ({
      ...state,
      uploadedImage: null,
      uploadedImageFileName: '',
      isImageUploaded: false
    }),

    // Project data reducers
    setProjectData: (state, payload: any) => ({
      ...state,
      projectData: payload
    }),

    // Data setup unit reducers
    setDataSetupUnit: (state, payload: DataSetupUnitType) => ({
      ...state,
      dataSetupUnit: payload
    }),
    
    setStep: (state, payload: number) => ({
      ...state,
      step: payload
    }),

    setClearData: (state) => ({
      ...state,
      excelData: {
        Condo:[],
        Basement:[]
      },
      step: 3,
      uploadedFileName: '',
      isExcelUploaded: false,
      imageFileObject: null,
      uploadedImage: null,
      uploadedImageFileName: '',
      isImageUploaded: false,
    }),

    ////////////////////////// village

  },
  
  effects: (dispatch) => ({
    // Excel effects
    async uploadExcelFile(payload: { data: { Condo: CondoUnit[]; Basement: Basement[]; }; fileName: string }) {
      dispatch.setupProject.setExcelData(payload.data);
      dispatch.setupProject.setUploadedFileName(payload.fileName);
    },
    
    // Image effects
    async uploadImageFile(payload: { imageData: string; fileName: string }) {
      dispatch.setupProject.setImageData(payload);
    },
    async setDataProject(){
      try {
        // เช็ค token ก่อนทำงาน
        const access_token = await encryptStorage.getItem("access_token");
        if (!access_token || access_token === "undefined" || access_token === "") {
          dispatch.setupProject.setProjectData({});
          return { status: false, message: "No access token" };
        }
        const response = await getProject();
        if(response.status){
          dispatch.setupProject.setProjectData(response || {});
        }
        else {
          dispatch.setupProject.setProjectData({});
        }
        return response; // return response เพื่อให้ caller รู้ว่าเสร็จแล้ว
      } catch (error) {
        console.error('Error in setDataProject: ', error);
        dispatch.setupProject.setProjectData({});
        throw error; // throw error เพื่อให้ caller จัดการได้
      }
    },
    // วิธีที่ 1: ใช้ rootState parameter (แนะนำ)
    async getStepCondoModel(payload, rootState){
      try {
        // กันยิง API เมื่อยังไม่ล็อกอิน/เพิ่งล็อกเอาต์
        const access_token = await encryptStorage.getItem("access_token");
        if (!access_token || access_token === "undefined" || access_token === "") {
          return 0;
        }
        const response = await getStepCondo();
        if(response.status){
          dispatch.setupProject.setStep(response.result.step);
          
          const currentSetupState = (rootState as any).setupProject as SetupProjectState;
          
          if(response.result.step === 2 && response.result.data && 
            currentSetupState.dataSetupUnit.block.length === 0 &&
            currentSetupState.dataSetupUnit.floor.length === 0
          ){
            dispatch.setupProject.setDataSetupUnit(response.result.data);
          }
          return response.result.step;
        }
        return 0;
      } catch (error) {
        console.error('Error in getStepCondo:', error);
        return 0;
      }
    }

  })
}); 