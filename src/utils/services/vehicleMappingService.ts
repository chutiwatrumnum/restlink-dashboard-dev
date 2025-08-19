// ไฟล์: src/utils/services/vehicleMappingService.ts

import axiosVMS from "../../configs/axiosVMS";
import { VehicleRecord } from "../../stores/interfaces/Vehicle";

class VehicleMappingService {
    private vehicleCache: Map<string, string> = new Map();
    private vehicleDetailCache: Map<string, VehicleRecord> = new Map();
    private isLoading: boolean = false;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Get vehicle license plate by vehicle ID
     */
    async getVehicleLicensePlate(vehicleId: string): Promise<string> {
        if (!vehicleId) return "-";

        // ตรวจสอบ cache ก่อน
        if (this.vehicleCache.has(vehicleId)) {
            return this.vehicleCache.get(vehicleId) || vehicleId;
        }

        // ถ้ากำลังโหลดอยู่ ให้ return vehicleId ไปก่อน
        if (this.isLoading) {
            return vehicleId;
        }

        // ตรวจสอบว่าข้อมูลใน cache หมดอายุหรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleCache.size === 0) {
            await this.refreshVehicleCache();
        }

        return this.vehicleCache.get(vehicleId) || vehicleId;
    }

    /**
     * Get full vehicle details by vehicle ID
     */
    async getVehicleDetails(vehicleId: string): Promise<VehicleRecord | null> {
        if (!vehicleId) return null;

        // ตรวจสอบ cache ก่อน
        if (this.vehicleDetailCache.has(vehicleId)) {
            return this.vehicleDetailCache.get(vehicleId) || null;
        }

        // ถ้ากำลังโหลดอยู่ ให้ return null ไปก่อน
        if (this.isLoading) {
            return null;
        }

        // ตรวจสอบว่าข้อมูลใน cache หมดอายุหรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        return this.vehicleDetailCache.get(vehicleId) || null;
    }

    /**
     * Refresh vehicle cache by fetching all vehicles from API
     */
    async refreshVehicleCache(): Promise<void> {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            console.log('🚗 Refreshing vehicle mapping cache...');

            // เรียก API เพื่อดึงข้อมูล vehicle ทั้งหมด
            const response = await axiosVMS.get('/api/collections/vehicle/records', {
                params: {
                    perPage: 500, // เอาเยอะๆ เพื่อให้ครอบคลุม
                    page: 1
                }
            });

            if (response.data?.items) {
                // เคลียร์ cache เก่า
                this.vehicleCache.clear();
                this.vehicleDetailCache.clear();

                // สร้าง mapping ใหม่
                response.data.items.forEach((vehicle: VehicleRecord) => {
                    // Map ID -> License Plate
                    this.vehicleCache.set(vehicle.id, vehicle.license_plate);

                    // Map ID -> Full Vehicle Details
                    this.vehicleDetailCache.set(vehicle.id, vehicle);
                });

                this.lastFetchTime = Date.now();
                console.log(`✅ Vehicle mapping cache refreshed with ${response.data.items.length} vehicles`);
                console.log('🚗 Sample vehicle mappings:', Array.from(this.vehicleCache.entries()).slice(0, 3));
            }
        } catch (error) {
            console.error('❌ Failed to refresh vehicle mapping cache:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get multiple vehicle license plates by vehicle IDs
     */
    async getMultipleVehicleLicensePlates(vehicleIds: string[]): Promise<Map<string, string>> {
        const result = new Map<string, string>();

        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleCache.size === 0) {
            await this.refreshVehicleCache();
        }

        // สร้าง mapping สำหรับ vehicleIds ที่ต้องการ
        vehicleIds.forEach(vehicleId => {
            if (vehicleId) {
                result.set(vehicleId, this.vehicleCache.get(vehicleId) || vehicleId);
            }
        });

        return result;
    }

    /**
     * Get multiple vehicle details by vehicle IDs
     */
    async getMultipleVehicleDetails(vehicleIds: string[]): Promise<Map<string, VehicleRecord>> {
        const result = new Map<string, VehicleRecord>();

        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.vehicleDetailCache.size === 0) {
            await this.refreshVehicleCache();
        }

        // สร้าง mapping สำหรับ vehicleIds ที่ต้องการ
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

    /**
     * Search vehicles by license plate (supports partial matching)
     */
    async searchVehiclesByLicensePlate(searchTerm: string): Promise<VehicleRecord[]> {
        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
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

    /**
     * Get vehicles by house ID
     */
    async getVehiclesByHouseId(houseId: string): Promise<VehicleRecord[]> {
        if (!houseId) return [];

        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
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

    /**
     * Get vehicles by tier (staff, resident, invited visitor)
     */
    async getVehiclesByTier(tier: string): Promise<VehicleRecord[]> {
        if (!tier) return [];

        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
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

    /**
     * Utility method เพื่อ map license plates จาก array of vehicle IDs
     */
    async mapLicensePlatesFromArray(vehicleIds: string[]): Promise<string[]> {
        if (!vehicleIds || vehicleIds.length === 0) return [];

        const vehicleMapping = await this.getMultipleVehicleLicensePlates(vehicleIds);
        return vehicleIds.map(vehicleId => vehicleMapping.get(vehicleId) || vehicleId);
    }

    /**
     * Get active vehicles (not expired)
     */
    async getActiveVehicles(): Promise<VehicleRecord[]> {
        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
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

    /**
     * Clear cache
     */
    clearCache(): void {
        this.vehicleCache.clear();
        this.vehicleDetailCache.clear();
        this.lastFetchTime = 0;
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return this.vehicleCache.size;
    }

    /**
     * Check if cache is valid
     */
    isCacheValid(): boolean {
        const now = Date.now();
        return (now - this.lastFetchTime) <= this.CACHE_DURATION && this.vehicleCache.size > 0;
    }

    /**
     * Get all vehicle mappings (สำหรับ debug หรือ display ใน UI)
     */
    getAllMappings(): Map<string, string> {
        return new Map(this.vehicleCache);
    }

    /**
     * Get all vehicle details (สำหรับ debug หรือ display ใน UI)
     */
    getAllVehicleDetails(): Map<string, VehicleRecord> {
        return new Map(this.vehicleDetailCache);
    }

    /**
     * Get vehicle statistics
     */
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
            // Count by tier
            if (stats.byTier[vehicle.tier]) {
                stats.byTier[vehicle.tier]++;
            } else {
                stats.byTier[vehicle.tier] = 1;
            }

            // Count active vs expired
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

// Export singleton instance
export const vehicleMappingService = new VehicleMappingService();