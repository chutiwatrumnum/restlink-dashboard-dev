import axios from "axios";
import { DataType, ResidentAddNew, conditionPage, rejectRequest, ExpandedDataType, IchildData, IApprovedBody } from "../../../../stores/interfaces/Visitor";
import { paramsdata } from "./paramsAPI";
import { encryptStorage } from "../../../../utils/encryptStorage";
import { statusSuccess, statusCreated } from "../../../../constant/status_code";
import dayjs from "dayjs";
// const getdataVisitorlist = async (params: conditionPage) => {
//     let url: string = `/visitor/facilities?`;
//     const resultparams = await paramsdata(params);
//     if (resultparams.status) {
//         url = url + resultparams.paramsstr;
//         console.log("url:", url);
//     }
//     const token = await encryptStorage.getItem("accessToken");
//     if (token) {
//         try {
//             const result = await axios.get(url);
//             if (result.status === statusSuccess) {
//                 const AllDataResident = result.data.result.dataList;
//                 let data: DataType[] = [];
//                 let allChildData = {} as IchildData;
//                 AllDataResident.map((e: any, i: number) => {
//                     let childData: ExpandedDataType[] = [];
//                     let userdata: DataType = {
//                         key: e.id,
//                         name: e.createdBy.fullName,
//                         totalVisitor: e.visitorList.length,
//                         createdAt: e.createdAt,
//                         bookingAt: e.joinAt,
//                         startTime: e.startTime,
//                         endTime: e.endTime,
//                         isApproveAll: e.isApproveAll,
//                         isRejectAll: e.isRejectAll,
//                         status: e.status ? e.status : "Pending",
//                     };
//                     if (e.visitorList.length > 0) {
//                         e.visitorList.map((childitem: any, childindex: number) => {
//                             let childrenData: ExpandedDataType = {
//                                 key: childitem.id,
//                                 name: childitem.fullName,
//                                 status: childitem.status,
//                                 createDate: dayjs().toString(),
//                                 iuNumber: childitem.iuNumber ? childitem.iuNumber : "-",
//                                 licensePlate: childitem.licensePlate ? childitem.licensePlate : "-",
//                                 type: childitem.type,
//                                 approved: childitem.approve,
//                                 reject: childitem.reject,
//                             };
//                             childData.push(childrenData);
//                         });
//                         allChildData[e.id] = childData;
//                     } else {
//                         userdata.status = "confirmed";
//                     }
//                     data.push(userdata);
//                 });

//                 return {
//                     total: result.data.result.maxRowLength,
//                     status: true,
//                     datavlaue: data,
//                     childdata: allChildData,
//                 };
//             } else {
//                 console.warn("status code:", result.status);
//                 console.warn("data error:", result.data);
//             }
//         } catch (err) {
//             console.error("err:", err);
//         }
//     } else {
//         console.log("====================================");
//         console.log("token undefilend.....");
//         console.log("====================================");
//     }
// };

const ApprovedId = async (params: IApprovedBody, type: boolean) => {
    try {
        let data: any;
        //true = header or false = child
        if (type) {
            let dataHeader = {
                refBookingId: params.id,
                status: params.status,
            };
            data = dataHeader;
        } else {
            let dataChild = {
                visitorId: params.id,
                status: params.status,
            };
            data = dataChild;
        }
        console.log("request data:", data);
        const resultApproved = await axios.put(`/visitor/facilities/confirm`, data);
        console.log("resp Facility data", resultApproved);
        if (resultApproved.status === statusSuccess) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return {
            status: false,
        };
    }
};
const ApprovedVisitorLogsId = async (params: IApprovedBody, type: boolean) => {
    try {
        let data: any;
        //true = header or false = child
        if (type) {
            let dataHeader = {
                refId: params.id,
                status: params.status,
            };
            data = dataHeader;
        } else {
            let dataChild = {
                visitorId: params.id,
                status: params.status,
            };
            data = dataChild;
        }
        console.log("request data:", data);

        const resultApproved = await axios.put(`/visitor/events/confirm`, data);
        console.log("resp EvenLog data", resultApproved);

        if (resultApproved.status === statusSuccess) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return {
            status: false,
        };
    }
};

const getdataVisitorLoglist = async (params: conditionPage) => {
    let url: string = `/events/visitor/events-log?`;
    const resultparams = await paramsdata(params);
    if (resultparams.status) {
        url = url + resultparams.paramsstr;
    }
    try {
        const result = await axios.get(url);
        const AllDataResident = result.data.dataList;
        let data: DataType[] = [];
        let allChildData = {} as IchildData;
        AllDataResident.map((e: any, i: number) => {
            let childData: ExpandedDataType[] = [];
            let userdata: DataType = {
                key: e.id,
                name: e.createdBy.fullName,
                totalVisitor: e.visitorList.length,
                createdAt: e.createdAt,
                bookingAt: e.joinAt,
                startTime: e.events ? e.events.startTime : "-",
                endTime: e.events ? e.events.endTime : "-",
                isApproveAll: e.isApproveAll,
                isRejectAll: e.isRejectAll,
                status: e.status ? e.status : "Pending",
            };
            if (e.visitorList.length > 0) {
                e.visitorList.map((childitem: any) => {
                    let childrenData: ExpandedDataType = {
                        key: childitem.id,
                        name: childitem.fullName,
                        status: childitem.status,
                        createDate: dayjs().toString(),
                        iuNumber: childitem.iuNumber ? childitem.iuNumber : "-",
                        licensePlate: childitem.licensePlate ? childitem.licensePlate : "-",
                        type: childitem.type,
                        approved: childitem.approve,
                        reject: childitem.reject,
                    };
                    childData.push(childrenData);
                });
                allChildData[e.id] = childData;
            } else {
                userdata.status = "confrimed";
            }
            data.push(userdata);
        });

        return {
            total: result.data.maxRowLength,
            status: true,
            datavlaue: data,
            childdata: allChildData,
        };
    } catch (err) {
        console.error("err:", err);
    }
};

const dowloadVisitorLogs = async () => {
    var now = dayjs();
    axios({
        url: `/visitor/facilities/download`, //your url
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
export { ApprovedId, ApprovedVisitorLogsId, getdataVisitorLoglist, dowloadVisitorLogs };
