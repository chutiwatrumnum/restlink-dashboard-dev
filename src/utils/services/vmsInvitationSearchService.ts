// ไฟล์: src/utils/services/vmsInvitationSearchService.ts

import axiosVMS from "../../configs/axiosVMS";
import { InvitationRecord, VMSInvitationResponse } from "../../stores/interfaces/Invitation";

class VMSInvitationSearchService {

    /**
     * ค้นหา invitation แบบครอบคลุม (ชื่อ, ที่อยู่บ้าน, ป้ายทะเบียน)
     */
    async searchInvitations(searchTerm: string, page: number = 1, perPage: number = 10): Promise<{
        data: InvitationRecord[];
        total: number;
    }> {
        try {
            console.log('🔍 Searching invitations with term:', searchTerm);

            if (!searchTerm || !searchTerm.trim()) {
                // ถ้าไม่มี search term ให้ return ข้อมูลทั้งหมด
                return this.getAllInvitations(page, perPage);
            }

            const term = searchTerm.trim();

            // 1. ค้นหาโดยตรงใน invitation collection
            const directSearchPromise = this.searchDirectInInvitations(term, page, perPage);

            // 2. ค้นหา house IDs ที่ match กับ address
            const houseSearchPromise = this.searchHousesByAddress(term);

            // 3. ค้นหา vehicle IDs ที่ match กับ license plate
            const vehicleSearchPromise = this.searchVehiclesByLicensePlate(term);

            // รอให้ทุก search เสร็จ
            const [directResults, matchingHouseIds, matchingVehicleIds] = await Promise.all([
                directSearchPromise,
                houseSearchPromise,
                vehicleSearchPromise
            ]);

            console.log('🏠 Matching house IDs:', matchingHouseIds);
            console.log('🚗 Matching vehicle IDs:', matchingVehicleIds);

            // รวม results
            const allResults = new Map<string, InvitationRecord>();

            // เพิ่ม direct search results
            directResults.data.forEach(invitation => {
                allResults.set(invitation.id, invitation);
            });

            // ค้นหา invitations ที่มี house_id ตรงกับที่หา
            if (matchingHouseIds.length > 0) {
                const houseInvitations = await this.getInvitationsByHouseIds(matchingHouseIds);
                houseInvitations.forEach(invitation => {
                    allResults.set(invitation.id, invitation);
                });
            }

            // ค้นหา invitations ที่มี vehicle_id ตรงกับที่หา  
            if (matchingVehicleIds.length > 0) {
                const vehicleInvitations = await this.getInvitationsByVehicleIds(matchingVehicleIds);
                vehicleInvitations.forEach(invitation => {
                    allResults.set(invitation.id, invitation);
                });
            }

            const finalResults = Array.from(allResults.values());

            console.log(`✅ Search completed: ${finalResults.length} total matches`);

            return {
                data: finalResults,
                total: finalResults.length
            };

        } catch (error) {
            console.error('❌ Error in searchInvitations:', error);
            throw error;
        }
    }

    /**
     * ค้นหาโดยตรงใน invitation collection
     */
    private async searchDirectInInvitations(searchTerm: string, page: number, perPage: number): Promise<{
        data: InvitationRecord[];
        total: number;
    }> {
        try {
            const response = await axiosVMS.get('/api/collections/invitation/records', {
                params: {
                    page,
                    perPage,
                    filter: `(guest_name~"${searchTerm}"||note~"${searchTerm}"||house_id~"${searchTerm}")`,
                    sort: '-created'
                }
            });

            if (response.data && response.data.items) {
                const invitations: InvitationRecord[] = response.data.items.map(
                    (item: VMSInvitationResponse) => ({
                        id: item.id,
                        code: item.code || "",
                        guest_name: item.guest_name,
                        house_id: item.house_id,
                        issuer: item.issuer || "",
                        note: item.note || "",
                        type: item.type,
                        active: item.active,
                        authorized_area: Array.isArray(item.authorized_area) ? item.authorized_area : [],
                        vehicle_id: Array.isArray(item.vehicle_id) ? item.vehicle_id : [],
                        start_time: item.start_time,
                        expire_time: item.expire_time,
                        stamped_time: item.stamped_time || "",
                        stamper: item.stamper || "",
                        created: item.created,
                        updated: item.updated,
                    })
                );

                return {
                    data: invitations,
                    total: response.data.totalItems || 0
                };
            }

            return { data: [], total: 0 };
        } catch (error) {
            console.error('❌ Error in searchDirectInInvitations:', error);
            return { data: [], total: 0 };
        }
    }

    /**
     * ค้นหา house IDs ที่ address ตรงกับ search term
     */
    private async searchHousesByAddress(searchTerm: string): Promise<string[]> {
        try {
            const response = await axiosVMS.get('/api/collections/house/records', {
                params: {
                    perPage: 500,
                    filter: `address~"${searchTerm}"`
                }
            });

            if (response.data && response.data.items) {
                return response.data.items.map((house: any) => house.id);
            }

            return [];
        } catch (error) {
            console.error('❌ Error searching houses:', error);
            return [];
        }
    }

    /**
     * ค้นหา vehicle IDs ที่ license plate ตรงกับ search term
     */
    private async searchVehiclesByLicensePlate(searchTerm: string): Promise<string[]> {
        try {
            const response = await axiosVMS.get('/api/collections/vehicle/records', {
                params: {
                    perPage: 500,
                    filter: `license_plate~"${searchTerm}"`
                }
            });

            if (response.data && response.data.items) {
                return response.data.items.map((vehicle: any) => vehicle.id);
            }

            return [];
        } catch (error) {
            console.error('❌ Error searching vehicles:', error);
            return [];
        }
    }

    /**
     * ค้นหา invitations ที่มี house_id ตรงกับที่ระบุ
     */
    private async getInvitationsByHouseIds(houseIds: string[]): Promise<InvitationRecord[]> {
        try {
            if (houseIds.length === 0) return [];

            // สร้าง filter condition สำหรับ house_id
            const houseFilter = houseIds.map(id => `house_id="${id}"`).join('||');

            const response = await axiosVMS.get('/api/collections/invitation/records', {
                params: {
                    perPage: 500,
                    filter: `(${houseFilter})`,
                    sort: '-created'
                }
            });

            if (response.data && response.data.items) {
                return response.data.items.map((item: VMSInvitationResponse) => ({
                    id: item.id,
                    code: item.code || "",
                    guest_name: item.guest_name,
                    house_id: item.house_id,
                    issuer: item.issuer || "",
                    note: item.note || "",
                    type: item.type,
                    active: item.active,
                    authorized_area: Array.isArray(item.authorized_area) ? item.authorized_area : [],
                    vehicle_id: Array.isArray(item.vehicle_id) ? item.vehicle_id : [],
                    start_time: item.start_time,
                    expire_time: item.expire_time,
                    stamped_time: item.stamped_time || "",
                    stamper: item.stamper || "",
                    created: item.created,
                    updated: item.updated,
                }));
            }

            return [];
        } catch (error) {
            console.error('❌ Error getting invitations by house IDs:', error);
            return [];
        }
    }

    /**
     * ค้นหา invitations ที่มี vehicle_id ตรงกับที่ระบุ
     */
    private async getInvitationsByVehicleIds(vehicleIds: string[]): Promise<InvitationRecord[]> {
        try {
            if (vehicleIds.length === 0) return [];

            // ต้องค้นหาแบบ manual เพราะ vehicle_id เป็น array
            const response = await axiosVMS.get('/api/collections/invitation/records', {
                params: {
                    perPage: 500,
                    sort: '-created'
                }
            });

            if (response.data && response.data.items) {
                const matchingInvitations = response.data.items.filter((item: VMSInvitationResponse) => {
                    if (!item.vehicle_id || !Array.isArray(item.vehicle_id)) return false;

                    // ตรวจสอบว่า vehicle_id array มี ID ที่ match หรือไม่
                    return item.vehicle_id.some(vId => vehicleIds.includes(vId));
                });

                return matchingInvitations.map((item: VMSInvitationResponse) => ({
                    id: item.id,
                    code: item.code || "",
                    guest_name: item.guest_name,
                    house_id: item.house_id,
                    issuer: item.issuer || "",
                    note: item.note || "",
                    type: item.type,
                    active: item.active,
                    authorized_area: Array.isArray(item.authorized_area) ? item.authorized_area : [],
                    vehicle_id: Array.isArray(item.vehicle_id) ? item.vehicle_id : [],
                    start_time: item.start_time,
                    expire_time: item.expire_time,
                    stamped_time: item.stamped_time || "",
                    stamper: item.stamper || "",
                    created: item.created,
                    updated: item.updated,
                }));
            }

            return [];
        } catch (error) {
            console.error('❌ Error getting invitations by vehicle IDs:', error);
            return [];
        }
    }

    /**
     * ดึงข้อมูล invitations ทั้งหมด (เมื่อไม่มี search term)
     */
    private async getAllInvitations(page: number, perPage: number): Promise<{
        data: InvitationRecord[];
        total: number;
    }> {
        try {
            const response = await axiosVMS.get('/api/collections/invitation/records', {
                params: {
                    page,
                    perPage,
                    sort: '-created'
                }
            });

            if (response.data && response.data.items) {
                const invitations: InvitationRecord[] = response.data.items.map(
                    (item: VMSInvitationResponse) => ({
                        id: item.id,
                        code: item.code || "",
                        guest_name: item.guest_name,
                        house_id: item.house_id,
                        issuer: item.issuer || "",
                        note: item.note || "",
                        type: item.type,
                        active: item.active,
                        authorized_area: Array.isArray(item.authorized_area) ? item.authorized_area : [],
                        vehicle_id: Array.isArray(item.vehicle_id) ? item.vehicle_id : [],
                        start_time: item.start_time,
                        expire_time: item.expire_time,
                        stamped_time: item.stamped_time || "",
                        stamper: item.stamper || "",
                        created: item.created,
                        updated: item.updated,
                    })
                );

                return {
                    data: invitations,
                    total: response.data.totalItems || 0
                };
            }

            return { data: [], total: 0 };
        } catch (error) {
            console.error('❌ Error getting all invitations:', error);
            return { data: [], total: 0 };
        }
    }
}

// Export singleton instance
export const vmsInvitationSearchService = new VMSInvitationSearchService();