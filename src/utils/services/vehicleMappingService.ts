// ไฟล์: src/utils/services/vehicleMappingService.ts - Clean Version

import axiosVMS from "../../configs/axiosVMS";
import { VehicleRecord } from "../../stores/interfaces/Vehicle";

class VehicleMappingService {
    private vehicleCache: Map<string, string> = new Map();
    private vehicleDetailCache: Map<string, VehicleRecord> = new Map();
    private isLoading: boolean = false;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getVehicleLicensePlate(vehicleId: string): Promise<string> {
        if (!vehicleId) return "-";

        if (this.vehicleCache.has(vehicleId)) {
            return this.vehicleCache.get(vehicleId) || vehicleId;
        }

        if (this.isLoading) {
            return vehicleId;
        }

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleCache.size === 0) {
            await this.refreshVehicleCache();
        }

        return this.vehicleCache.get(vehicleId) || vehicleId;
    }

    async getVehicleDetails(vehicleId: string): Promise<VehicleRecord | null> {
        if (!vehicleId) return null;

        if (this.vehicleDetailCache.has(vehicleId)) {
            return this.vehicleDetailCache.get(vehicleId) || null;
        }

        if (this.isLoading) {
            return null;
        }

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        return this.vehicleDetailCache.get(vehicleId) || null;
    }

    async refreshVehicleCache(): Promise<void> {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            const response = await axiosVMS.get('/api/collections/vehicle/records', {
                params: {
                    perPage: 500,
                    page: 1
                }
            });

            if (response.data?.items) {
                this.vehicleCache.clear();
                this.vehicleDetailCache.clear();

                response.data.items.forEach((vehicle: VehicleRecord) => {
                    this.vehicleCache.set(vehicle.id, vehicle.license_plate);
                    this.vehicleDetailCache.set(vehicle.id, vehicle);
                });

                this.lastFetchTime = Date.now();
            }
        } catch (error) {
            console.error("Error refreshing vehicle mapping cache:", error);
        } finally {
            this.isLoading = false;
        }
    }

    async getMultipleVehicleLicensePlates(vehicleIds: string[]): Promise<Map<string, string>> {
        const result = new Map<string, string>();

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleCache.size === 0) {
            await this.refreshVehicleCache();
        }

        vehicleIds.forEach(vehicleId => {
            if (vehicleId) {
                result.set(vehicleId, this.vehicleCache.get(vehicleId) || vehicleId);
            }
        });

        return result;
    }

    async getMultipleVehicleDetails(vehicleIds: string[]): Promise<Map<string, VehicleRecord>> {
        const result = new Map<string, VehicleRecord>();

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        vehicleIds.forEach(vehicleId => {
            if (vehicleId) {
                const vehicleDetail = this.vehicleDetailCache.get(vehicleId);
                if (vehicleDetail) {
                    result.set(vehicleId, vehicleDetail);
                }
            }
        });

        return result;
    }

    async searchVehiclesByLicensePlate(searchTerm: string): Promise<VehicleRecord[]> {
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        const results: VehicleRecord[] = [];
        const searchLower = searchTerm.toLowerCase();

        this.vehicleDetailCache.forEach((vehicle) => {
            if (vehicle.license_plate.toLowerCase().includes(searchLower)) {
                results.push(vehicle);
            }
        });

        return results;
    }

    async getVehiclesByHouseId(houseId: string): Promise<VehicleRecord[]> {
        if (!houseId) return [];

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        const results: VehicleRecord[] = [];

        this.vehicleDetailCache.forEach((vehicle) => {
            if (vehicle.house_id === houseId) {
                results.push(vehicle);
            }
        });

        return results;
    }

    async getVehiclesByTier(tier: string): Promise<VehicleRecord[]> {
        if (!tier) return [];

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        const results: VehicleRecord[] = [];

        this.vehicleDetailCache.forEach((vehicle) => {
            if (vehicle.tier === tier) {
                results.push(vehicle);
            }
        });

        return results;
    }

    async mapLicensePlatesFromArray(vehicleIds: string[]): Promise<string[]> {
        if (!vehicleIds || vehicleIds.length === 0) return [];

        const vehicleMapping = await this.getMultipleVehicleLicensePlates(vehicleIds);
        return vehicleIds.map(vehicleId => vehicleMapping.get(vehicleId) || vehicleId);
    }

    async getActiveVehicles(): Promise<VehicleRecord[]> {
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        const results: VehicleRecord[] = [];
        const currentTime = new Date();

        this.vehicleDetailCache.forEach((vehicle) => {
            const expireTime = new Date(vehicle.expire_time);
            if (expireTime > currentTime) {
                results.push(vehicle);
            }
        });

        return results;
    }

    clearCache(): void {
        this.vehicleCache.clear();
        this.vehicleDetailCache.clear();
        this.lastFetchTime = 0;
    }

    getCacheSize(): number {
        return this.vehicleCache.size;
    }

    isCacheValid(): boolean {
        const now = Date.now();
        return (now - this.lastFetchTime) <= this.CACHE_DURATION && this.vehicleCache.size > 0;
    }

    getAllMappings(): Map<string, string> {
        return new Map(this.vehicleCache);
    }

    getAllVehicleDetails(): Map<string, VehicleRecord> {
        return new Map(this.vehicleDetailCache);
    }

    getVehicleStats(): {
        total: number;
        byTier: Record<string, number>;
        active: number;
        expired: number;
    } {
        const stats = {
            total: this.vehicleDetailCache.size,
            byTier: {} as Record<string, number>,
            active: 0,
            expired: 0
        };

        const currentTime = new Date();

        this.vehicleDetailCache.forEach((vehicle) => {
            if (stats.byTier[vehicle.tier]) {
                stats.byTier[vehicle.tier]++;
            } else {
                stats.byTier[vehicle.tier] = 1;
            }

            const expireTime = new Date(vehicle.expire_time);
            if (expireTime > currentTime) {
                stats.active++;
            } else {
                stats.expired++;
            }
        });

        return stats;
    }
}

export const vehicleMappingService = new VehicleMappingService();