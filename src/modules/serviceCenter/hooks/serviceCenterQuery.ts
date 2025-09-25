import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ChartPileServiceCenter, ServiceCenterChartPayloadType, ServiceCenterDataType, ServiceCenterPayloadType, ServiceCenterSelectListType, StatCardProps } from "../../../stores/interfaces/ServiceCenter";

// Helper function to handle null/undefined unit data
const handleUnitData = (unit: any) => {
    if (!unit) {
        return {
            unitNo: "N/A",
            roomAddress: "N/A",
            floor: 0
        };
    }

    return {
        unitNo: unit.unitNo || "N/A",
        roomAddress: unit.roomAddress || "N/A",
        floor: unit.floor || 0
    };
};

// Helper function to handle null/undefined user data
const handleUserData = (user: any) => {
    if (!user) {
        return {
            firstName: "Unknown",
            lastName: "User",
            familyName: "User",
            givenName: "Unknown",
            middleName: ""
        };
    }

    return {
        firstName: user.firstName || "Unknown",
        lastName: user.lastName || "User",
        familyName: user.familyName || user.lastName || "User",
        givenName: user.givenName || user.firstName || "Unknown",
        middleName: user.middleName || ""
    };
};

// Helper function to handle null/undefined service type data
const handleServiceTypeData = (serviceType: any) => {
    if (!serviceType) {
        return {
            nameCode: "unknown",
            nameEn: "Unknown Service"
        };
    }

    return {
        nameCode: serviceType.nameCode || "unknown",
        nameEn: serviceType.nameEn || "Unknown Service"
    };
};

// Helper function to handle null/undefined status data
const handleStatusData = (status: any) => {
    if (!status) {
        return {
            nameCode: "unknown",
            nameEn: "Unknown Status"
        };
    }

    return {
        nameCode: status.nameCode || "unknown",
        nameEn: status.nameEn || "Unknown Status"
    };
};

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

        try {
            const { data } = await axios.get("/service-center/dashboard/list", { params });
            return data;
        } catch (error) {
            console.error("Error fetching service center list:", error);
            return { data: [], total: 0 };
        }
    };

    const query = useQuery({
        queryKey: ["serviceCenterList", payloadQuery],
        queryFn: () => getServiceCenterServiceListQuery(payloadQuery),
        select(data) {
            if (!data.data || !Array.isArray(data.data)) {
                return { data: [], total: data.total || 0 };
            }

            const dataTableList = data.data.map((item: ServiceCenterDataType) => {
                // Handle null/undefined data with fallbacks
                const processedUnit = handleUnitData(item.unit);
                const processedCreatedBy = handleUserData(item.createdBy);
                const processedServiceType = handleServiceTypeData(item.serviceType);
                const processedStatus = handleStatusData(item.status);

                return {
                    ...item,
                    // Processed data
                    unit: processedUnit,
                    createdBy: processedCreatedBy,
                    serviceType: processedServiceType,
                    status: processedStatus,

                    // Derived fields with null handling
                    serviceTypeName: processedServiceType.nameEn,
                    statusName: processedStatus.nameEn,
                    roomAddress: processedUnit.roomAddress,
                    issue: item.cause != null ? item.cause : "",
                    fullname: `${processedCreatedBy.givenName} ${processedCreatedBy.familyName}`.trim(),
                    tel: item.tel || "N/A",

                    // Boolean fields with proper defaults
                    requestCloseCase: Boolean(item.requestCloseCase),
                    requestNewAppointment: Boolean(item.requestNewAppointment),
                    requestReSchedule: Boolean(item.requestReSchedule),

                    // Handle image items
                    imageItems: Array.isArray(item.imageItems) ? item.imageItems : [],

                    // Handle dates
                    createdAt: item.createdAt || new Date(),
                    actionDate: item.actionDate || null,
                    completedDate: item.completedDate || null,
                    acknowledgeDate: item.acknowledgeDate || null,
                };
            });

            return { data: dataTableList, total: data.total || dataTableList.length };
        },
        retry: (failureCount, error: any) => {
            // Only retry on network errors, not on 4xx errors
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
    });
    return { ...query };
};

export const useServiceCenterByServiceIDQuery = (payloadQuery: number) => {
    const query = useQuery({
        queryKey: ["serviceCenterByServiceID", payloadQuery],
        queryFn: () => getServiceCenterServiceListQuery(payloadQuery),
        select(data) {
            if (!data) {
                return null;
            }

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

            // Handle null/undefined data with fallbacks
            const processedUnit = handleUnitData(data.unit);
            const processedCreatedBy = handleUserData(data.createdBy);
            const processedServiceType = handleServiceTypeData(data.serviceType);
            const processedStatus = handleStatusData(data.status);

            return {
                ...data,
                // Processed data
                unit: processedUnit,
                createdBy: processedCreatedBy,
                serviceType: processedServiceType,
                status: processedStatus,

                // Derived fields
                serviceTypeName: processedServiceType.nameEn,
                statusName: processedStatus.nameEn,
                roomAddress: processedUnit.roomAddress,
                issue: data.cause != null ? data.cause : "",
                fullname: `${processedCreatedBy.firstName} ${processedCreatedBy.lastName}`.trim(),

                // Boolean fields with proper defaults
                requestCloseCase: Boolean(data.requestCloseCase),
                requestNewAppointment: Boolean(data.requestNewAppointment),
                requestReSchedule: Boolean(data.requestReSchedule),
            };
        },
        retry: (failureCount, error: any) => {
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
            }
            return failureCount < 2;
        },
    });
    return { ...query };
};

export const useServiceCenterStatusTypeQuery = () => {
    const getServiceCenterStatusType = async () => {
        try {
            const result = await axios.get("/service-center/dashboard/status");
            const dataSelectLists: ServiceCenterSelectListType[] = [];

            if (result.data?.data && Array.isArray(result.data.data)) {
                result.data.data.map((e: any) => {
                    const dataSelectList: ServiceCenterSelectListType = {
                        label: e.nameEn || "Unknown Status",
                        value: e.id?.toString() || "0",
                    };
                    dataSelectLists.push(dataSelectList);
                });
            }

            return dataSelectLists;
        } catch (error) {
            console.error("Error fetching service center status types:", error);
            return [];
        }
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
        retry: 2,
    });

    return { ...query };
};

export const useServiceCenterServiceChartQuery = (payloadQuery: ServiceCenterChartPayloadType) => {
    const getServiceCenterServiceChart = async (payload: ServiceCenterChartPayloadType) => {
        try {
            const { data } = await axios.get("/service-center/summary", { params: payload });
            return data;
        } catch (error) {
            console.error("Error fetching service center chart data:", error);
            return { cardStatus: [], cardStatusByMonth: [], serviceType: [] };
        }
    };

    const query = useQuery({
        queryKey: ["serviceCenterChart", payloadQuery],
        queryFn: () => getServiceCenterServiceChart(payloadQuery),
        select(data) {
            const dataCardStatus: StatCardProps[] = [];

            if (data.cardStatus && Array.isArray(data.cardStatus)) {
                data.cardStatus.map((item: ChartPileServiceCenter) => {
                    const dataCard: StatCardProps = {
                        title: item.status || "Unknown",
                        value: item.total || 0,
                    };
                    dataCardStatus.push(dataCard);
                });
            }

            return {
                cardStatus: dataCardStatus,
                cardStatusByMonth: data.cardStatusByMonth || [],
                serviceType: data.serviceType || [],
            };
        },
        retry: 2,
    });

    return { ...query };
};

export const useServiceCenterIssueTypeQuery = () => {
    const getServiceCenterIssueType = async () => {
        try {
            const result = await axios.get("/service-center/dashboard/type");
            const dataSelectLists: ServiceCenterSelectListType[] = [];

            if (result.data?.data && Array.isArray(result.data.data)) {
                result.data.data.map((e: any) => {
                    const dataSelectList: ServiceCenterSelectListType = {
                        label: e.nameEn || "Unknown Type",
                        value: e.id?.toString() || "0",
                    };
                    dataSelectLists.push(dataSelectList);
                });
            }

            return dataSelectLists;
        } catch (error) {
            console.error("Error fetching service center issue types:", error);
            return [];
        }
    };

    const query = useQuery({
        queryKey: ["serviceCenterIssueType"],
        queryFn: () => getServiceCenterIssueType(),
        retry: 2,
    });

    return { ...query };
};

export const getServiceCenterServiceListQuery = async (serviceId: number) => {
    console.log("🔍 [API] Fetching service center data for ID:", serviceId);

    try {
        const { data } = await axios.get(`/service-center/dashboard/${serviceId}`);
        console.log("✅ [API] Service center data received:", data);

        if (!data.data) {
            return null;
        }

        const item = data.data;

        // Process appointment data to handle both old and new formats
        if (item.appointmentDate && Array.isArray(item.appointmentDate)) {
            item.appointmentDate = item.appointmentDate.map((appointment: any) => {
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

        // Handle null/undefined data with fallbacks
        const processedUnit = handleUnitData(item.unit);
        const processedCreatedBy = handleUserData(item.createdBy);
        const processedServiceType = handleServiceTypeData(item.serviceType);
        const processedStatus = handleStatusData(item.status);

        const processedData = {
            ...item,
            // Processed data
            unit: processedUnit,
            createdBy: processedCreatedBy,
            serviceType: processedServiceType,
            status: processedStatus,

            // Boolean fields with proper defaults
            requestCloseCase: Boolean(item.requestCloseCase),
            requestNewAppointment: Boolean(item.requestNewAppointment),
            requestReSchedule: Boolean(item.requestReSchedule),
        };

        console.log("📋 [API] Processed data with defaults:", {
            requestCloseCase: processedData.requestCloseCase,
            requestNewAppointment: processedData.requestNewAppointment,
            requestReSchedule: processedData.requestReSchedule,
            unit: processedData.unit,
            createdBy: processedData.createdBy,
        });

        return processedData;
    } catch (error) {
        console.error("❌ [API] Failed to fetch service center data:", error);
        // Return a minimal data structure instead of throwing
        return {
            id: serviceId,
            unit: handleUnitData(null),
            createdBy: handleUserData(null),
            serviceType: handleServiceTypeData(null),
            status: handleStatusData(null),
            requestCloseCase: false,
            requestNewAppointment: false,
            requestReSchedule: false,
            description: "",
            tel: "N/A",
            createdAt: new Date(),
            imageItems: []
        };
    }
};