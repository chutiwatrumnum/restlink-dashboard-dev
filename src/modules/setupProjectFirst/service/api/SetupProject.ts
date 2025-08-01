import { createPlanCondo } from "../../../../stores/interfaces/SosWarning";
import axios from "../../../../configs/axiosSOS";
const version = "/"


const getProject = async () => {
    try {
        const data = await axios.get(`/sos${version}plan/dashboard/project`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getStepCondo = async () => {
    try {
        const data = await axios.get(`/sos${version}plan/dashboard/project/status`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}

const uploadFilePlan = async (formData: FormData) => {
    try {


        const response = await axios.post(`/sos${version}plan/dashboard/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000, // 30 second timeout
        });



        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data };
            return result;
        } else {
            return { status: false, error: `Unexpected status: ${response.status}` };
        }
    } catch (error: any) {
        console.error('Upload error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText
        });

        return {
            status: false,
            error: error.response?.data || error.message || 'Upload failed'
        };
    }
};

const uploadFileSentApi = async (data: any) => {
    try {
        const response = await axios.post(`/sos${version}plan/dashboard/condo/setup-unit`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else {
            return { status: false, data: null }
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}

const uploadFileSentApiHome = async (data: any) => {
    try {
        const response = await axios.post(`/sos${version}plan/dashboard/village/setup`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else {
            return { status: false, data: null }
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}



const setupProjectCondoFinish = async (data: any) => {
    try {
        const response = await axios.post(`/sos/plan/dashboard/condo/finish`, data);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else {
            return { status: false, data: null }
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const deleteProject = async () => {
    try {
        const response = await axios.delete(`/sos/plan/dashboard/project`);
        if (response.status === 200 || response.status === 201) {
            let result = { status: true, ...response.data }
            return result
        }
        else {
            return { status: false, data: null }
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}



export {
    getProject,
    getStepCondo,
    uploadFileSentApi,
    uploadFilePlan,
    setupProjectCondoFinish,
    uploadFileSentApiHome,
    deleteProject
};
