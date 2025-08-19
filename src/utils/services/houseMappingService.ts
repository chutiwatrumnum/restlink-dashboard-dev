// ไฟล์: src/utils/services/houseMappingService.ts

import axiosVMS from "../../configs/axiosVMS";
import { HouseRecord } from "../../stores/interfaces/House";

class HouseMappingService {
    private houseCache: Map<string, string> = new Map();
    private isLoading: boolean = false;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getHouseAddress(houseId: string): Promise<string> {
        if (!houseId) return "-";

        // ตรวจสอบ cache ก่อน
        if (this.houseCache.has(houseId)) {
            return this.houseCache.get(houseId) || houseId;
        }

        // ถ้ากำลังโหลดอยู่ ให้ return houseId ไปก่อน
        if (this.isLoading) {
            return houseId;
        }

        // ตรวจสอบว่าข้อมูลใน cache หมดอายุหรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.houseCache.size === 0) {
            await this.refreshHouseCache();
        }

        return this.houseCache.get(houseId) || houseId;
    }

    async refreshHouseCache(): Promise<void> {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            console.log('🏠 Refreshing house mapping cache...');

            // เรียก API เพื่อดึงข้อมูล house ทั้งหมด
            const response = await axiosVMS.get('/api/collections/house/records', {
                params: {
                    perPage: 500, // เอาเยอะๆ เพื่อให้ครอบคลุม
                    page: 1
                }
            });

            if (response.data?.items) {
                // สร้าง mapping จาก id -> address
                response.data.items.forEach((house: HouseRecord) => {
                    this.houseCache.set(house.id, house.address);
                });

                this.lastFetchTime = Date.now();
                console.log(`✅ House mapping cache refreshed with ${response.data.items.length} houses`);
            }
        } catch (error) {
            console.error('❌ Failed to refresh house mapping cache:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async getMultipleHouseAddresses(houseIds: string[]): Promise<Map<string, string>> {
        const result = new Map<string, string>();

        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.houseCache.size === 0) {
            await this.refreshHouseCache();
        }

        // สร้าง mapping สำหรับ houseIds ที่ต้องการ
        houseIds.forEach(houseId => {
            if (houseId) {
                result.set(houseId, this.houseCache.get(houseId) || houseId);
            }
        });

        return result;
    }

    clearCache(): void {
        this.houseCache.clear();
        this.lastFetchTime = 0;
    }

    getCacheSize(): number {
        return this.houseCache.size;
    }

    isCacheValid(): boolean {
        const now = Date.now();
        return (now - this.lastFetchTime) <= this.CACHE_DURATION && this.houseCache.size > 0;
    }
}

// Export singleton instance
export const houseMappingService = new HouseMappingService();