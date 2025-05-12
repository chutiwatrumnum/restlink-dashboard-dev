import axios from "axios";
import { DataType, conditionPage, ExpandedDataType, IchildData, IApprovedBody } from "../../../../stores/interfaces/Visitor";
import { paramsdata } from "./paramsAPI";
import { statusSuccess } from "../../../../constant/status_code";
import dayjs from "dayjs";
const getdataVisitorLoglist = async (params: conditionPage) => {
    let url = `/events/visitor/events-log?`;
    const resultparams = await paramsdata(params);

    if (resultparams.status) {
        url += resultparams.paramsstr;
    }

    try {
        const result = await axios.get(url);
        const AllDataResident = result.data.dataList;
        let data: DataType[] = [];
        let allChildData: IchildData = {};

        AllDataResident.forEach((item: any) => {
            // สร้างข้อมูลหลัก
            let userdata: DataType = {
                key: item.id,
                name: item.createdBy.fullName,
                totalVisitor: item.visitorList.length,
                createdAt: item.createdAt,
                bookingAt: item.joinAt,
                startTime: item.events?.startTime || "-",
                endTime: item.events?.endTime || "-",
                isApproveAll: item.isApproveAll,
                isRejectAll: item.isRejectAll,
                status: item.status || "Pending",
            };

            // สร้างข้อมูลลูก
            if (item.visitorList.length > 0) {
                let childData: ExpandedDataType[] = [];

                item.visitorList.forEach((child: any) => {
                    childData.push({
                        key: child.id,
                        name: child.fullName,
                        status: child.status,
                        createDate: dayjs().toString(),
                        iuNumber: child.iuNumber || "-",
                        licensePlate: child.licensePlate || "-",
                        type: child.type,
                        approved: child.approve,
                        reject: child.reject,
                    });
                });

                allChildData[item.id] = childData;
            } else {
                userdata.status = "confirmed";
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
        console.error("Error:", err);
        return { status: false };
    }
};

// อนุมัติ visitor ใน facility
const ApprovedId = async (params: IApprovedBody, type: boolean) => {
    try {
        let data: any;

        // true = header, false = child
        if (type) {
            data = {
                refBookingId: params.id,
                status: params.status,
            };
        } else {
            data = {
                visitorId: params.id,
                status: params.status,
            };
        }

        console.log("Request data:", data);
        const result = await axios.put(`/visitor/facilities/confirm`, data);
        console.log("Response:", result);

        return result.status === statusSuccess;
    } catch (err) {
        console.error("Error:", err);
        return false;
    }
};

// อนุมัติ visitor logs
const ApprovedVisitorLogsId = async (params: IApprovedBody, type: boolean) => {
    try {
        let data: any;

        // true = header, false = child
        if (type) {
            data = {
                refId: params.id,
                status: params.status,
            };
        } else {
            data = {
                visitorId: params.id,
                status: params.status,
            };
        }

        console.log("Request data:", data);
        const result = await axios.put(`/events/visitor/confirm`, data);
        console.log("Response:", result);

        return result.status === statusSuccess;
    } catch (err) {
        console.error("Error:", err);
        return false;
    }
};

// ดาวน์โหลด visitor logs
const dowloadVisitorLogs = async () => {
    try {
        const now = dayjs();
        const response = await axios({
            url: `/visitor/facilities/download`,
            method: "GET",
            responseType: "blob",
        });

        // สร้างลิงก์ดาวน์โหลด
        const href = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", `${now.format("DD-MM-YYYY")}.pdf`);
        document.body.appendChild(link);
        link.click();

        // ทำความสะอาด
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    } catch (err) {
        console.error("Download error:", err);
    }
};

export { ApprovedId, ApprovedVisitorLogsId, getdataVisitorLoglist, dowloadVisitorLogs };