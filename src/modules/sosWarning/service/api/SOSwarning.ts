import { createPlanCondo } from "../../../../stores/interfaces/SosWarning";
import axios from "../../../../configs/axiosSOS";
const version = "/"


const getEvent = async (dataFilter: any = {}) => {
    try {
        let obj = {
            params: {
                ...dataFilter
            }
        }
        const data = await axios.get(`/sos${version}event/dashboard`, obj);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}

const getEventSummary = async (dataEvent: any = {}) => {
    try {
        let obj = {
            params: {
                ...dataEvent
            }
        }
        const data = await axios.get(`/sos${version}event/dashboard/summary`, obj);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getAddress = async (unitId: number) => {
    try {
        let obj = {
            params: {
                unitId: unitId
            }
        }
        const data = await axios.get(`/sos${version}plan/dashboard/marker/address`, obj);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}

const getMasterData = async () => {
    try {
        const data = await axios.get(`/sos${version}plan/dashboard/marker/master-data`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getVillageData = async (floorId?:string | null) => {
    try {
        // /sos${version}dashboard/plan-info
        let params = {
            params: {
                floorId: floorId || null
            }
        }
        const data = await axios.get(`/sos${version}plan/dashboard/info`,params);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    } 
}


const uploadPlan = async (imgFile: File, onProgressUpdate?: (progressPercent: number) => void) => {
    try {
        const formData = new FormData();
        formData.append('imgFile', imgFile);
        const response = await axios.post(`/sos${version}plan/dashboard/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent: any) => {
                if (onProgressUpdate && progressEvent.total) {
                    const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
                    onProgressUpdate(Math.floor(percentComplete));
                }
            }
        });
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


    


    const updatePlanPlural = async (data: any) => {
        try {
            const response = await axios.put(`/sos${version}plan/dashboard/img/by-floor`, data);
            if (response.status === 200 || response.status === 201) {
                let result = { status: true, ...response.data }
                return result
            }
            else return { status: false, data: null }
    
        } catch (error) {
            console.error(error);
            return { status: false, data: null }
        }
    }

    const updatePlanSingular = async (data: any) => {
        try {
            const response = await axios.put(`/sos${version}plan/dashboard/img`, data);
            if (response.status === 200 || response.status === 201) {
                let result = { status: true, ...response.data }
                return result
            }
            else return { status: false, data: null }
        } catch (error) {
            console.error(error);
            return { status: false, data: null }
        }
    }



const createVillage = async (data: any) => {
    try {
        const response = await axios.post(`/sos${version}dashboard/village`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }

    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const createMarker = async (data: any) => {
    try {
        const response = await axios.post(`/sos${version}plan/dashboard/marker`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null ,message:error?.message }
    }
}

const updateMarker = async (data: any) => {
    try {
        const response = await axios.put(`/sos${version}plan/dashboard/marker`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null,message:error?.message }
    }
}


const deleteMarker = async (id: number|string) => {
    try {
        const params = {
            params: {
                id: id
            }
        }
        const response = await axios.delete(`/sos${version}plan/dashboard/marker`, params);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}

const deletePlanAccount = async (id: string) => {
    try {
        const params = {
            params: {
                id: id
            }
        }
        const response = await axios.delete(`/sos${version}dashboard/plan-info`, params);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getEmergency = async () => {
    try {
        const data = await axios.get(`/sos/emergency/dashboard`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
} 


const readIssueEmergency = async (data: any) => {
    try {
        const response = await axios.post(`/sos/emergency/dashboard/confirm`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }

    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}
const completeEmergency = async (data: any) => {
    try {
        const response = await axios.post(`/sos/emergency/dashboard/complete`,data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }

    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


/////condo
const createCondo = async (data: createPlanCondo) => {
    try {
        
        const response = await axios.post(`/sos${version}dashboard/condo`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}
/////sos warning
const getSosWarning = async () => {
    try {
        const data = await axios.get(`/sos${version}event/dashboard`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getEventPending = async () => {
    try {
        const data = await axios.get(`/sos${version}event/dashboard/pending`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getSosWarningById = async (eventId: string) => {
    try {
        const data = await axios.get(`/sos${version}event/dashboard/${eventId}`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        return { status: false, data: null,message:error?.message }
    }
}

const receiveCast = async (eventId: string) => {
    try {
        const response = await axios.put(`/sos/event/dashboard/${eventId}/receive`);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null ,message:error?.message }
    }
}

const callCustomer = async (eventId: string, data: any) => {
    try {
        const response = await axios.post(`/sos/event/dashboard/${eventId}/call-to-customer`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}

const chooseContractOfficer = async (eventId: string, data: any) => {
    try {
        const response = await axios.put(`/sos/event/dashboard/${eventId}/choose-solution`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null ,message:error?.message }
    }
}

const closeJob = async (eventId: string) => {
    try {
        const response = await axios.put(`/sos/event/dashboard/${eventId}/solve`);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null ,message:error?.message }
    }
}


const closeCase = async (eventId: string,data:{remark:string}) => {
    try {
        const response = await axios.put(`/sos${version}event/dashboard/${eventId}/complete`,data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else return { status: false, data: null }
    } catch (error) {
        console.error(error);
        return { status: false, data: null ,message:error?.message }
    }   
}




export {
    getEvent,
    getEventSummary,
    getAddress,
    getMasterData,
    getVillageData,
    uploadPlan,
    updatePlanPlural,
    updatePlanSingular,
    createVillage,
    createMarker,
    deleteMarker,
    updateMarker,
    deletePlanAccount,
    createCondo,
    getEmergency,
    getEventPending,
    readIssueEmergency,
    completeEmergency,
    getSosWarning,
    getSosWarningById,
    receiveCast,
    callCustomer,
    chooseContractOfficer,
    closeJob,
    closeCase
};
