// ไฟล์: src/utils/services/areaMappingService.ts

import axiosVMS from "../../configs/axiosVMS";
import { AreaRecord } from "../../stores/interfaces/Area";

class AreaMappingService {
    private areaCache: Map<string, string> = new Map();
    private isLoading: boolean = false;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getAreaName(areaId: string): Promise<string> {
        if (!areaId) return "-";

        // ตรวจสอบ cache ก่อน
        if (this.areaCache.has(areaId)) {
            return this.areaCache.get(areaId) || areaId;
        }

        // ถ้ากำลังโหลดอยู่ ให้ return areaId ไปก่อน
        if (this.isLoading) {
            return areaId;
        }

        // ตรวจสอบว่าข้อมูลใน cache หมดอายุหรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.areaCache.size === 0) {
            await this.refreshAreaCache();
        }

        return this.areaCache.get(areaId) || areaId;
    }

    async refreshAreaCache(): Promise<void> {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            console.log('📍 Refreshing area mapping cache...');

            // เรียก API เพื่อดึงข้อมูล area ทั้งหมด
            const response = await axiosVMS.get('/api/collections/area/records', {
                params: {
                    perPage: 500, // เอาเยอะๆ เพื่อให้ครอบคลุม
                    page: 1
                }
            });

            if (response.data?.items) {
                // สร้าง mapping จาก id -> name
                response.data.items.forEach((area: AreaRecord) => {
                    this.areaCache.set(area.id, area.name);
                });

                this.lastFetchTime = Date.now();
                console.log(`✅ Area mapping cache refreshed with ${response.data.items.length} areas`);
                console.log('📍 Area mappings:', Array.from(this.areaCache.entries()));
            }
        } catch (error) {
            console.error('❌ Failed to refresh area mapping cache:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async getMultipleAreaNames(areaIds: string[]): Promise<Map<string, string>> {
        const result = new Map<string, string>();

        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.areaCache.size === 0) {
            await this.refreshAreaCache();
        }

        // สร้าง mapping สำหรับ areaIds ที่ต้องการ
        areaIds.forEach(areaId => {
            if (areaId) {
                result.set(areaId, this.areaCache.get(areaId) || areaId);
            }
        });

        return result;
    }

    clearCache(): void {
        this.areaCache.clear();
        this.lastFetchTime = 0;
    }

    getCacheSize(): number {
        return this.areaCache.size;
    }

    isCacheValid(): boolean {
        const now = Date.now();
        return (now - this.lastFetchTime) <= this.CACHE_DURATION && this.areaCache.size > 0;
    }

    // Utility method เพื่อ map area names จาก array of area IDs
    async mapAreaNamesFromArray(areaIds: string[]): Promise<string[]> {
        if (!areaIds || areaIds.length === 0) return [];

        const areaMapping = await this.getMultipleAreaNames(areaIds);
        return areaIds.map(areaId => areaMapping.get(areaId) || areaId);
    }

    // Get all area mappings (สำหรับ debug หรือ display ใน UI)
    getAllMappings(): Map<string, string> {
        return new Map(this.areaCache);
    }
}

// Export singleton instance
export const areaMappingService = new AreaMappingService();