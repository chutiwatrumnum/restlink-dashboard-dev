// ไฟล์: src/utils/services/vmsInvitationSearchService.ts - Clean Version

import axiosVMS from "../../configs/axiosVMS";
import { InvitationRecord, VMSInvitationResponse } from "../../stores/interfaces/Invitation";

class VMSInvitationSearchService {

    async searchInvitations(searchTerm: string, page: number = 1, perPage: number = 10): Promise<{
        data: InvitationRecord[];
        total: number;
    }> {
        try {
            if (!searchTerm || !searchTerm.trim()) {
                return this.getAllInvitations(page, perPage);
            }

            const term = searchTerm.trim();

            const [directResults, matchingHouseIds, matchingVehicleIds] = await Promise.all([
                this.searchDirectInInvitations(term, page, perPage),
                this.searchHousesByAddress(term),
                this.searchVehiclesByLicensePlate(term)
            ]);

            const allResults = new Map<string, InvitationRecord>();

            directResults.data.forEach(invitation => {
                allResults.set(invitation.id, invitation);
            });

            if (matchingHouseIds.length > 0) {
                const houseInvitations = await this.getInvitationsByHouseIds(matchingHouseIds);
                houseInvitations.forEach(invitation => {
                    allResults.set(invitation.id, invitation);
                });
            }

            if (matchingVehicleIds.length > 0) {
                const vehicleInvitations = await this.getInvitationsByVehicleIds(matchingVehicleIds);
                vehicleInvitations.forEach(invitation => {
                    allResults.set(invitation.id, invitation);
                });
            }

            const finalResults = Array.from(allResults.values());

            return {
                data: finalResults,
                total: finalResults.length
            };

        } catch (error) {
            console.error("Error in searchInvitations:", error);
            throw error;
        }
    }

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
                    (item: VMSInvitationResponse) => this.mapToInvitationRecord(item)
                );

                return {
                    data: invitations,
                    total: response.data.totalItems || 0
                };
            }

            return { data: [], total: 0 };
        } catch (error) {
            console.error("Error in searchDirectInInvitations:", error);
            return { data: [], total: 0 };
        }
    }

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
            console.error("Error searching houses:", error);
            return [];
        }
    }

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
            console.error("Error searching vehicles:", error);
            return [];
        }
    }

    private async getInvitationsByHouseIds(houseIds: string[]): Promise<InvitationRecord[]> {
        try {
            if (houseIds.length === 0) return [];

            const houseFilter = houseIds.map(id => `house_id="${id}"`).join('||');

            const response = await axiosVMS.get('/api/collections/invitation/records', {
                params: {
                    perPage: 500,
                    filter: `(${houseFilter})`,
                    sort: '-created'
                }
            });

            if (response.data && response.data.items) {
                return response.data.items.map((item: VMSInvitationResponse) =>
                    this.mapToInvitationRecord(item)
                );
            }

            return [];
        } catch (error) {
            console.error("Error getting invitations by house IDs:", error);
            return [];
        }
    }

    private async getInvitationsByVehicleIds(vehicleIds: string[]): Promise<InvitationRecord[]> {
        try {
            if (vehicleIds.length === 0) return [];

            const response = await axiosVMS.get('/api/collections/invitation/records', {
                params: {
                    perPage: 500,
                    sort: '-created'
                }
            });

            if (response.data && response.data.items) {
                const matchingInvitations = response.data.items.filter((item: VMSInvitationResponse) => {
                    if (!item.vehicle_id || !Array.isArray(item.vehicle_id)) return false;
                    return item.vehicle_id.some(vId => vehicleIds.includes(vId));
                });

                return matchingInvitations.map((item: VMSInvitationResponse) =>
                    this.mapToInvitationRecord(item)
                );
            }

            return [];
        } catch (error) {
            console.error("Error getting invitations by vehicle IDs:", error);
            return [];
        }
    }

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
                    (item: VMSInvitationResponse) => this.mapToInvitationRecord(item)
                );

                return {
                    data: invitations,
                    total: response.data.totalItems || 0
                };
            }

            return { data: [], total: 0 };
        } catch (error) {
            console.error("Error getting all invitations:", error);
            return { data: [], total: 0 };
        }
    }

    private mapToInvitationRecord(item: VMSInvitationResponse): InvitationRecord {
        return {
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
        };
    }
}

export const vmsInvitationSearchService = new VMSInvitationSearchService();