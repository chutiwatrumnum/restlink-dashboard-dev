import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ChartPileServiceCenter, ServiceCenterChartPayloadType, ServiceCenterDataType, ServiceCenterPayloadType, ServiceCenterSelectListType, StatCardProps } from "../../../stores/interfaces/ServiceCenter";

export const useServiceCenterServiceListQuery = (payloadQuery: ServiceCenterPayloadType) => {
    const getServiceCenterServiceListQuery = async (payload: ServiceCenterPayloadType) => {
        const params: any = {
            curPage: payload.curPage,
            perPage: payload.perPage,
        };
        if (payload.unitId) {
            params.unitId = payload.unitId;

        }
        if (payload.startMonth || payload.endMonth) {
            params.startMonth = payload.startMonth;
            params.endMonth = payload.endMonth;
        }
        if (payload.serviceTypeId) {
            params.serviceTypeId = payload.serviceTypeId;
        }
        if (payload.search) {
            params.roomAddress = payload.search;
        }
        if (payload.status) {
            params.status = payload.status;
        }
        const { data } = await axios.get("/service-center/dashboard/list", { params });
        return data;
    };
    const query = useQuery({
        queryKey: ["serviceCenterList", payloadQuery],
        queryFn: () => getServiceCenterServiceListQuery(payloadQuery),
        select(data) {
            if (!data.data) {
                return { data: [], total: data.total };
            }
            const dataTableList = data.data.map((item: ServiceCenterDataType) => {
                return {
                    ...item,
                    serviceTypeName: item.serviceType.nameEn,
                    statusName: item.status.nameEn,
                    roomAddress: item.unit.roomAddress,
                    issue: item.cause != null ? item.cause : "",
                    fullname: item.createdBy.givenName + " " + item.createdBy.familyName,
                    // ✅ เปลี่ยนเป็น requestReSchedule
                    requestCloseCase: item.requestCloseCase || false,
                    requestNewAppointment: item.requestNewAppointment || false,
                    requestReSchedule: item.requestReSchedule || false,
                };
            });
            return { data: dataTableList, total: data.total };
        },
        retry: false,
    });
    return { ...query };
};

export const useServiceCenterByServiceIDQuery = (payloadQuery: number) => {
    const query = useQuery({
        queryKey: ["serviceCenterByServiceID", payloadQuery],
        queryFn: () => getServiceCenterServiceListQuery(payloadQuery),
        select(data) {
            // Process appointment data to handle both old and new formats
            if (data.appointmentDate && Array.isArray(data.appointmentDate)) {
                data.appointmentDate = data.appointmentDate.map((appointment: any) => {
                    // If it's the new format with startTime and endTime, keep as is
                    if (typeof appointment === "object" && appointment.startTime && appointment.endTime) {
                        return appointment;
                    }
                    // If it's legacy format (just date string), convert to new format
                    if (typeof appointment === "string") {
                        return {
                            date: appointment,
                            startTime: null,
                            endTime: null
                        };
                    }
                    return appointment;
                });
            }

            data.serviceTypeName = data.serviceType.nameEn;
            data.statusName = data.status.nameEn;
            data.roomAddress = data.unit.roomAddress;
            data.issue = data.cause != null ? data.cause : "";
            data.fullname = data.createdBy.firstName + " " + data.createdBy.lastName;

            // ✅ เปลี่ยนเป็น requestReSchedule
            data.requestCloseCase = data.requestCloseCase || false;
            data.requestNewAppointment = data.requestNewAppointment || false;
            data.requestReSchedule = data.requestReSchedule || false;

            return data;
        },
        retry: false,
    });
    return { ...query };
};

export const useServiceCenterStatusTypeQuery = () => {
    const getServiceCenterStatusType = async () => {
        const result = await axios.get("/service-center/dashboard/status");
        const dataSelectLists: ServiceCenterSelectListType[] = [];

        result.data.data.map((e: any) => {
            const dataSelectList: ServiceCenterSelectListType = {
                label: e.nameEn,
                value: e.id.toString(),
            };
            dataSelectLists.push(dataSelectList);
        });
        return dataSelectLists;
    };
    const query = useQuery({
        queryKey: ["serviceCenterType"],
        queryFn: () => getServiceCenterStatusType(),
        select(data) {
            const tabsList = data.map((item: any) => {
                return {
                    ...item,
                    key: item.value,
                };
            });
            return { data: data, tabsList: tabsList };
        },
        retry: false,
    });

    return { ...query };
};

export const useServiceCenterServiceChartQuery = (payloadQuery: ServiceCenterChartPayloadType) => {
    const getServiceCenterServiceChart = async (payload: ServiceCenterChartPayloadType) => {
        const { data } = await axios.get("/service-center/summary", { params: payload }); //payload as any);
        return data;
    };
    const query = useQuery({
        queryKey: ["serviceCenterList", payloadQuery],
        queryFn: () => getServiceCenterServiceChart(payloadQuery),
        select(data) {
            const dataCardStatus: StatCardProps[] = [];
            data.cardStatus.map((item: ChartPileServiceCenter) => {
                const dataCard: StatCardProps = {
                    title: item.status,
                    value: item.total,
                };
                dataCardStatus.push(dataCard);
            });
            return {
                cardStatus: dataCardStatus,
                cardStatusByMonth: data.cardStatusByMonth,
                serviceType: data.serviceType,
            };
        },
        retry: false,
    });

    return { ...query };
};

export const useServiceCenterIssueTypeQuery = () => {
    const getServiceCenterIssueType = async () => {
        const result = await axios.get("/service-center/dashboard/type");
        const dataSelectLists: ServiceCenterSelectListType[] = [];

        result.data.data.map((e: any) => {
            const dataSelectList: ServiceCenterSelectListType = {
                label: e.nameEn,
                value: e.id.toString(),
            };
            dataSelectLists.push(dataSelectList);
        });
        return dataSelectLists;
    };
    const query = useQuery({
        queryKey: ["serviceCenterIssueType"],
        queryFn: () => getServiceCenterIssueType(),
        retry: false,
    });

    return { ...query };
};

export const getServiceCenterServiceListQuery = async (serviceId: number) => {
    console.log("🔍 [API] Fetching service center data for ID:", serviceId);

    try {
        const { data } = await axios.get(`/service-center/dashboard/${serviceId}`);
        console.log("✅ [API] Service center data received:", data);

        // Process appointment data to handle both old and new formats
        if (data.data.appointmentDate && Array.isArray(data.data.appointmentDate)) {
            data.data.appointmentDate = data.data.appointmentDate.map((appointment: any) => {
                // If it's the new format with startTime and endTime, keep as is
                if (typeof appointment === "object" && appointment.startTime && appointment.endTime) {
                    return appointment;
                }
                // If it's legacy format (just date string), convert to new format
                if (typeof appointment === "string") {
                    return {
                        date: appointment,
                        startTime: null,
                        endTime: null
                    };
                }
                return appointment;
            });
        }

        // ✅ เปลี่ยนเป็น requestReSchedule
        data.data.requestCloseCase = data.data.requestCloseCase ?? false;
        data.data.requestNewAppointment = data.data.requestNewAppointment ?? false;
        data.data.requestReSchedule = data.data.requestReSchedule ?? false;

        console.log("📋 [API] Processed data with defaults:", {
            requestCloseCase: data.data.requestCloseCase,
            requestNewAppointment: data.data.requestNewAppointment,
            requestReSchedule: data.data.requestReSchedule,
        });

        return data.data;
    } catch (error) {
        console.error("❌ [API] Failed to fetch service center data:", error);
        throw error;
    }
};