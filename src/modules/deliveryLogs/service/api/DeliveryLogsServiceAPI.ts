import axios from "axios";
import { paramsdata } from "./paramsAPI";
import { AddNewDeliveryLogsType, conditionPage, dataDeliveryLogsType, EditDeliveryLogsType, blockDetail } from "../../../../stores/interfaces/DeliveryLogs";
import dayjs from "dayjs";

const getdataDeliveryLogslist = async (filter: conditionPage) => {
    let url: string = `/parcels/list`;
    const params = new URLSearchParams();
    params.append("perPage", filter.perPage.toString());
    params.append("curPage", filter.curPage.toString());
    if (filter.startDate) {
      params.append("startDate", filter.startDate);
    }
    if (filter.endDate) {
      params.append("endDate", filter.endDate);
    }
    if (filter.unitId) {
      params.append("unitId", filter.unitId);
    }
    if (filter.search) {
        params.append("search", filter.search);
    }
    if (filter.sort&&filter.sortBy) {
        params.append("sortBy", filter.sortBy);
        params.append("sort", filter.sort.slice(0, -3));
    }
    try {
        const result = await axios.get(url,{params});
        if (result.status < 400) {
            const AllDataDeliveryLogs = result.data.result.rows;
            let data: dataDeliveryLogsType[] = [];
            AllDataDeliveryLogs.map((e: any) => {
                let dataDeliveryLogs: dataDeliveryLogsType = {
                    key: e.id,
                    name: e.name,
                    contact: e.contact,
                    senderType: e.senderType,
                    trackingNumber: e.trackingNumber,
                    blockNo: e.blockNo,
                    unitNo: e.roomAddress,
                    createdAt: e.createdAt,
                    FromDateTime: `${e.startDate} ${e.startTime}`,
                    ToDateTime: `${e.endDate} ${e.endTime}`,
                    pickUpType: "-",
                    collected: e.collected,
                    reminderNotification: e.reminderNotification,
                    comment: e.comment,
                    blockId: e.blockId,
                    unitId: e.unitId,
                    startDate: e.startDate,
                    startTime: e.startTime,
                    endDate: e.endDate,
                    endTime: e.endTime,
                    pickUpLocation: e.pickUpLocation,
                    arrivalDate: e.arrivalDate,
                };
                if (e.pickUpType) {
                    dataDeliveryLogs.pickUpType = e.pickUpType;
                }
                data.push(dataDeliveryLogs);
            });

            return {
                total: result.data.result.total,
                status: true,
                datavalue: data,
            };
        } else {
            console.warn("status code:", result.status);
            console.warn("data error:", result.data);
        }
    } catch (err) {
        console.error("err:", err);
        return {
            total: null,
            status: false,
            datavalue: null,
        };
    }
};

const deleteDeliveryLogsById = async (id: string) => {
    try {
        const resultDelete = await axios.delete(`/parcels/delete/${id}`);
        if (resultDelete.status < 400) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
};

const editDeliveryLogs = async (req: EditDeliveryLogsType) => {
    try {
        const result = await axios.put("/parcels/update", req);
        if (result.status < 400) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};
const addDeliveryLogs = async (req: AddNewDeliveryLogsType) => {
    try {
        console.log("addDeliveryLogs:", req);
        const result = await axios.post("/parcels/create", req);

        if (result.status < 400) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
};

const changeCollectedById = async (id: number) => {
    const req = {
        id: id,
        collected: true,
    };
    try {
        const result = await axios.put("/parcels/collected", req);
        if (result.status < 400) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

const getUserByunit = async (value: string) => {
    try {
        const { status, data } = await axios.get(`/parcels/dashboard/user-by-unit?unitId=${value}`);
        if (status >= 400) {
            console.error(data.message);
            return {
                status: false,
                data: null,
            };
        }
        if (data.data.length === 0) {
            return {
                status: false,
                data: null,
            };
        }
        return {
            status: true,
            data: data.data,
        };
    } catch (error) {
        return {
            status: false,
            data: null,
        };
    }
};
const getDataBlock = async () => {
    try {
        const data = await axios.get("/parcels/dashboard/unit");
        if (data.status === 200) {
            console.log("data", data.data);

            const blocklst = data.data.data;
            let arrayBlock: blockDetail[] = [];
            blocklst.map((e: any) => {
                const block: blockDetail = {
                    label: e.roomAddress,
                    value: e.id,
                };
                arrayBlock.push(block);
            });
            if (arrayBlock.length > 0) {
                return {
                    status: true,
                    dataselectblock: arrayBlock,
                    datablock: blocklst,
                };
            } else {
                return {
                    status: false,
                    datablock: null,
                };
            }
        }
    } catch (error) {
        console.error(error);
        return {
            status: false,
            datablock: null,
        };
    }
};

const dowloadDeliveryLogs = async () => {
    var now = dayjs();
    axios({
        url: `parcel/download`, //your url
        method: "GET",
        responseType: "blob", // important
    }).then((response) => {
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);
        console.log("response.data======", response.data);
        // create "a" HTML element with href to file & click
        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", dayjs(now).format("DD-MM-YYYY")); //or any other extension
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        // document.body.removeChild(link);
        // URL.revokeObjectURL(href);
    });
};
export { getUserByunit, getdataDeliveryLogslist, editDeliveryLogs, addDeliveryLogs, deleteDeliveryLogsById, changeCollectedById, getDataBlock, dowloadDeliveryLogs };
