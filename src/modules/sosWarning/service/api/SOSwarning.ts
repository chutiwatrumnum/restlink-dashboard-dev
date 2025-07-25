import { createPlanCondo } from "../../../../stores/interfaces/SosWarning";
import axios from "../../../../configs/axiosSOS";
const version = "/"


const getAddress = async (unitId: number) => {
    try {
        let obj = {
            params: {
                unitId: unitId
            }
        }
        const data = await axios.get(`/sos${version}dashboard/address`, obj);
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
        const data = await axios.get(`/sos${version}dashboard/master-data`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getVillageData = async () => {
    try {
        const data = await axios.get(`/sos${version}dashboard/plan-info`);
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
        const response = await axios.post(`/sos${version}dashboard/upload-plan`, formData, {
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

const createVillage = async (data: any) => {
    try {
        const response = await axios.post(`/sos/dashboard/village`, data);
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
        const response = await axios.post(`/sos${version}dashboard/village/marker`, data);
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

const updateMarker = async (data: any) => {
    try {
        const response = await axios.put(`/sos${version}dashboard/marker`, data);
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


const deleteMarker = async (id: number|string) => {
    try {
        const params = {
            params: {
                id: id
            }
        }
        const response = await axios.delete(`/sos${version}dashboard/marker`, params);
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



export {
    getAddress,
    getMasterData,
    getVillageData,
    uploadPlan,
    createVillage,
    createMarker,
    deleteMarker,
    updateMarker,
    deletePlanAccount,
    createCondo,
    getEmergency,
    readIssueEmergency,
    completeEmergency
};
