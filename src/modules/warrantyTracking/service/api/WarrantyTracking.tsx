import axios from "axios";



const getWarrantyTracking = async (dataFilter: any = {}) => {
    try {
        let obj = {
            params: {
                ...dataFilter
            }
        }
        const data = await axios.get(`/warranty-tracking/dashboard`, obj);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const getWarrantyById = async (id: string) => {
    try {
        const response = await axios.get(`/warranty-tracking/dashboard/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}


const updateWarrantyById = async (id: string, formData: any) => {
    try {
        const response = await axios.put(`/warranty-tracking/dashboard/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
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





const createWarrantyTracking = async (formData: any) => {
    try {
        const response = await axios.post(`/warranty-tracking/dashboard`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
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


const deleteWarrantyTracking = async (id: string) => {
    try {
        const data = await axios.delete(`/warranty-tracking/dashboard/${id}`);
        if (data.status === 200 || data.status === 201) {
            let result = { status: true, ...data.data }
            return result
        }
    } catch (error) {
        console.error(error);
        return { status: false, data: null }
    }
}






export {
    getWarrantyTracking,
    getWarrantyById,
    createWarrantyTracking,
    updateWarrantyById,
    deleteWarrantyTracking
};
