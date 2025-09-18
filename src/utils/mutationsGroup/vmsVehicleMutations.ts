import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import axiosVMS from "../../configs/axiosVMS";

// อัพเดต Interface ตาม API spec
export interface VMSVehiclePayload {
    license_plate: string;
    area_code: string;
    vehicle_color?: string; // เพิ่มสี
    vehicle_type?: string; // เพิ่มประเภท
    vehicle_brand?: string;
    tier: string;
    start_time: string;
    expire_time: string;
    authorized_area: string[];
    house_id: string;
    note?: string;
}

export interface VMSVehicleEditPayload extends VMSVehiclePayload {
    id: string;
}

// === CREATE VMS VEHICLE ===
export const useCreateVMSVehicleMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['createVMSVehicle'],
        retry: false,
        mutationFn: async (payload: VMSVehiclePayload) => {
            console.log('🚗 Creating VMS Vehicle');
            console.log('📥 Payload received:', payload);

            // สร้าง payload ตาม API spec
            const apiPayload: any = {
                license_plate: payload.license_plate,
                area_code: payload.area_code,
                tier: payload.tier,
                start_time: payload.start_time,
                expire_time: payload.expire_time,
                authorized_area: payload.authorized_area || [],
                house_id: payload.house_id
            };

            // เพิ่ม vehicle_color ถ้ามี
            if (payload.vehicle_color && payload.vehicle_color.trim()) {
                apiPayload.vehicle_color = payload.vehicle_color.trim();
            }

            // เพิ่ม vehicle_brand ถ้ามี
            if (payload.vehicle_brand && payload.vehicle_brand.trim()) {
                apiPayload.vehicle_brand = payload.vehicle_brand.trim();
            }

            // เพิ่ม vehicle_type ถ้ามี
            if (payload.vehicle_type) {
                apiPayload.vehicle_type = payload.vehicle_type;
            }

            // เพิ่ม note ถ้ามี
            if (payload.note && payload.note.trim()) {
                apiPayload.note = payload.note.trim();
            }

            console.log('📤 Final API payload:', JSON.stringify(apiPayload, null, 2));

            // เรียก API
            const response = await axiosVMS.post(
                '/api/collections/vehicle/records',
                apiPayload
            );

            console.log('✅ API Response:', response.data);
            return response.data;
        },
        onSuccess: (data) => {
            console.log('✅ Create vehicle success');
            message.success("create vehicle success!");

            // Refresh data
            queryClient.invalidateQueries({
                queryKey: ["vmsVehicles"]
            });
        },
        onError: (error: any) => {
            console.error('❌ Create vehicle error:', error);

            let errorMessage = "ไม่สามารถสร้างรถยนต์ได้";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};

// === UPDATE VMS VEHICLE ===
export const useUpdateVMSVehicleMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['updateVMSVehicle'],
        retry: false,
        mutationFn: async (payload: VMSVehicleEditPayload) => {
            console.log('🔄 Updating VMS Vehicle');

            const { id, ...updateData } = payload;

            const apiPayload: any = {
                license_plate: updateData.license_plate,
                area_code: updateData.area_code,
                tier: updateData.tier,
                start_time: updateData.start_time,
                expire_time: updateData.expire_time,
                authorized_area: updateData.authorized_area || [],
                house_id: updateData.house_id
            };

            // เพิ่ม vehicle_color ถ้ามี
            if (updateData.vehicle_color && updateData.vehicle_color.trim()) {
                apiPayload.vehicle_color = updateData.vehicle_color.trim();
            }

            // เพิ่ม vehicle_brand ถ้ามี
            if (updateData.vehicle_brand && updateData.vehicle_brand.trim()) {
                apiPayload.vehicle_brand = updateData.vehicle_brand.trim();
            }

            // เพิ่ม vehicle_type ถ้ามี
            if (updateData.vehicle_type) {
                apiPayload.vehicle_type = updateData.vehicle_type;
            }

            // เพิ่ม note ถ้ามี
            if (updateData.note && updateData.note.trim()) {
                apiPayload.note = updateData.note.trim();
            }

            console.log('📤 Update API payload:', JSON.stringify(apiPayload, null, 2));

            const response = await axiosVMS.patch(
                `/api/collections/vehicle/records/${id}`,
                apiPayload
            );

            console.log('✅ Update API Response:', response.data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            console.log('✅ Update vehicle success');
            message.success("อัปเดตรถยนต์สำเร็จ!");

            queryClient.invalidateQueries({
                queryKey: ["vmsVehicles"]
            });
            queryClient.invalidateQueries({
                queryKey: ["vmsVehicle", variables.id],
            });
        },
        onError: (error: any) => {
            console.error('❌ Update vehicle error:', error);

            let errorMessage = "ไม่สามารถอัปเดตรถยนต์ได้";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};

// === DELETE VMS VEHICLE ===
export const useDeleteVMSVehicleMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['deleteVMSVehicle'],
        retry: false,
        mutationFn: async (vehicleId: string) => {
            console.log('🗑️ Deleting VMS Vehicle:', vehicleId);

            const response = await axiosVMS.delete(
                `/api/collections/vehicle/records/${vehicleId}`
            );

            console.log('✅ Delete API Response:', response.data);
            return response.data;
        },
        onSuccess: () => {
            console.log('✅ Delete vehicle success');
            message.success("delete vehicle success!");

            queryClient.invalidateQueries({
                queryKey: ["vmsVehicles"]
            });
        },
        onError: (error: any) => {
            console.error('❌ Delete vehicle error:', error);

            let errorMessage = "ไม่สามารถลบรถยนต์ได้";

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
        }
    });
};