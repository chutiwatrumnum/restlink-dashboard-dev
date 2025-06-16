import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
    AppointmentSlot,
    AppointmentSlotState,
    FormattedAppointmentData,
    AppointmentValidationResult
} from "../stores/interfaces/ServiceCenter";

/**
 * Convert backend appointment data to component state format
 */
export const convertBackendToSlotState = (
    appointmentData: any[]
): AppointmentSlotState[] => {
    if (!appointmentData || !Array.isArray(appointmentData)) {
        return [{ id: "1", date: null, timeRange: null }];
    }

    const slots = appointmentData.map((appointment: any, index: number) => {
        const slotId = (index + 1).toString();

        // Handle new format with startTime and endTime
        if (
            typeof appointment === "object" &&
            appointment.date &&
            appointment.startTime &&
            appointment.endTime
        ) {
            return {
                id: slotId,
                date: dayjs(appointment.date),
                timeRange: [
                    dayjs(appointment.startTime, "HH:mm"),
                    dayjs(appointment.endTime, "HH:mm"),
                ] as [Dayjs, Dayjs],
            };
        }

        // Handle legacy format (just date)
        if (typeof appointment === "string" || appointment.date) {
            const dateStr = typeof appointment === "string" ? appointment : appointment.date;
            return {
                id: slotId,
                date: dayjs(dateStr),
                timeRange: null,
            };
        }

        // Fallback for invalid data
        return {
            id: slotId,
            date: null,
            timeRange: null,
        };
    });

    return slots.length > 0 ? slots : [{ id: "1", date: null, timeRange: null }];
};

/**
 * Convert component state to backend format
 */
export const convertSlotStateToBackend = (
    slots: AppointmentSlotState[]
): FormattedAppointmentData[] => {
    console.log("🔄 Converting slot state to backend format...");
    console.log("📥 Input slots:", slots);

    const validSlots = slots.filter((slot) =>
        slot.date &&
        slot.timeRange &&
        slot.timeRange[0] &&
        slot.timeRange[1]
    );

    console.log("✅ Valid slots found:", validSlots.length);

    const result = validSlots.map((slot) => {
        const formatted = {
            date: slot.date!.format("YYYY-MM-DD"),
            startTime: slot.timeRange![0]?.format("HH:mm") || "",
            endTime: slot.timeRange![1]?.format("HH:mm") || "",
        };

        console.log(`📅 Slot formatted:`, formatted);
        return formatted;
    });

    console.log("📤 Final backend format:", result);
    return result;
};

/**
 * Validate appointment slots
 */
export const validateAppointmentSlots = (
    slots: AppointmentSlotState[]
): AppointmentValidationResult => {
    console.log("🔍 Starting appointment slots validation...");
    console.log("📥 Slots to validate:", slots);

    const validSlots = slots.filter(
        (slot) =>
            slot.date &&
            slot.timeRange &&
            slot.timeRange[0] &&
            slot.timeRange[1]
    );

    console.log(`✅ Found ${validSlots.length} complete slots out of ${slots.length} total slots`);

    // Check if at least one complete slot exists
    if (validSlots.length === 0) {
        console.log("❌ No complete slots found");
        return {
            isValid: false,
            message: "กรุณาเลือกอย่างน้อย 1 วันพร้อมช่วงเวลาที่สมบูรณ์",
        };
    }

    // Check for duplicate dates
    const dates = validSlots.map((slot) => slot.date?.format("YYYY-MM-DD"));
    const uniqueDates = new Set(dates);
    console.log("📅 Dates found:", dates);
    console.log("🔄 Unique dates:", Array.from(uniqueDates));

    if (dates.length !== uniqueDates.size) {
        console.log("❌ Duplicate dates found");
        return {
            isValid: false,
            message: "ไม่สามารถเลือกวันที่เดียวกันได้",
        };
    }

    // Validate time ranges
    for (let i = 0; i < validSlots.length; i++) {
        const slot = validSlots[i];
        console.log(`⏰ Validating time range for slot ${i + 1}:`, {
            date: slot.date?.format("YYYY-MM-DD"),
            startTime: slot.timeRange?.[0]?.format("HH:mm"),
            endTime: slot.timeRange?.[1]?.format("HH:mm"),
        });

        if (slot.timeRange && slot.timeRange[0] && slot.timeRange[1]) {
            if (slot.timeRange[1].isBefore(slot.timeRange[0])) {
                console.log(`❌ Invalid time range in slot ${i + 1}: end time before start time`);
                return {
                    isValid: false,
                    message: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น",
                };
            }

            // Check if time difference is at least 30 minutes
            const timeDiff = slot.timeRange[1].diff(slot.timeRange[0], "minutes");
            console.log(`⏱️ Time difference for slot ${i + 1}: ${timeDiff} minutes`);

            if (timeDiff < 30) {
                console.log(`❌ Time range too short in slot ${i + 1}: ${timeDiff} minutes`);
                return {
                    isValid: false,
                    message: "ช่วงเวลานัดหมายต้องมีอย่างน้อย 30 นาที",
                };
            }
        }
    }

    console.log("✅ All validations passed");
    return { isValid: true };
};

/**
 * Format appointment data for display
 */
export const formatAppointmentForDisplay = (
    appointmentData: any[] | null | undefined
): string => {
    if (!appointmentData || !Array.isArray(appointmentData) || appointmentData.length === 0) {
        return "N/A";
    }

    const firstSlot = appointmentData[0];

    if (typeof firstSlot === "object" && firstSlot.date) {
        let displayText = dayjs(firstSlot.date).format("DD/MM/YYYY");

        if (firstSlot.startTime && firstSlot.endTime) {
            displayText += ` (${firstSlot.startTime}-${firstSlot.endTime})`;
        }

        if (appointmentData.length > 1) {
            displayText += ` +${appointmentData.length - 1} more`;
        }

        return displayText;
    } else if (typeof firstSlot === "string") {
        // Legacy format
        let displayText = dayjs(firstSlot).format("DD/MM/YYYY");

        if (appointmentData.length > 1) {
            displayText += ` +${appointmentData.length - 1} more`;
        }

        return displayText;
    }

    return "N/A";
};

/**
 * Check if appointment slot is complete (has date and time range)
 */
export const isSlotComplete = (slot: AppointmentSlotState): boolean => {
    return !!(
        slot.date &&
        slot.timeRange &&
        slot.timeRange[0] &&
        slot.timeRange[1]
    );
};

/**
 * Generate time slots for a day (helper for UI)
 */
export const generateTimeSlots = (
    startHour: number = 9,
    endHour: number = 17,
    intervalMinutes: number = 30
): { value: string; label: string }[] => {
    const slots: { value: string; label: string }[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const timeValue = dayjs().hour(hour).minute(minute).format("HH:mm");
            const timeLabel = dayjs().hour(hour).minute(minute).format("HH:mm");
            slots.push({ value: timeValue, label: timeLabel });
        }
    }

    return slots;
};

/**
 * Check if two time ranges overlap
 */
export const doTimeRangesOverlap = (
    range1: [Dayjs, Dayjs],
    range2: [Dayjs, Dayjs]
): boolean => {
    const [start1, end1] = range1;
    const [start2, end2] = range2;

    return start1.isBefore(end2) && start2.isBefore(end1);
};

/**
 * Sort appointment slots by date and time
 */
export const sortAppointmentSlots = (
    slots: AppointmentSlotState[]
): AppointmentSlotState[] => {
    return [...slots].sort((a, b) => {
        if (!a.date || !b.date) return 0;

        const dateComparison = a.date.valueOf() - b.date.valueOf();
        if (dateComparison !== 0) return dateComparison;

        // If same date, sort by start time
        if (a.timeRange?.[0] && b.timeRange?.[0]) {
            return a.timeRange[0].valueOf() - b.timeRange[0].valueOf();
        }

        return 0;
    });
};