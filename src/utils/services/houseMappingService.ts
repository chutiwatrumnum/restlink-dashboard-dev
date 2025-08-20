// แก้ไข src/utils/services/houseMappingService.ts เพื่อปรับปรุงประสิทธิภาพ

import axiosVMS from "../../configs/axiosVMS";
import { HouseRecord } from "../../stores/interfaces/House";

class HouseMappingService {
    private houseCache: Map<string, HouseRecord> = new Map(); // เก็บข้อมูลเต็ม
    private addressCache: Map<string, string> = new Map(); // เก็บเฉพาะ address
    private isLoading: boolean = false;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getHouseAddress(houseId: string): Promise<string> {
        if (!houseId) return "-";

        // ตรวจสอบ address cache ก่อน
        if (this.addressCache.has(houseId)) {
            return this.addressCache.get(houseId) || houseId;
        }

        // ถ้ากำลังโหลดอยู่ ให้ return houseId ไปก่อน
        if (this.isLoading) {
            return houseId;
        }

        // ตรวจสอบว่าข้อมูลใน cache หมดอายุหรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.addressCache.size === 0) {
            await this.refreshHouseCache();
        }

        return this.addressCache.get(houseId) || houseId;
    }

    async getHouseDetails(houseId: string): Promise<HouseRecord | null> {
        if (!houseId) return null;

        // ตรวจสอบ house cache ก่อน
        if (this.houseCache.has(houseId)) {
            return this.houseCache.get(houseId) || null;
        }

        // ถ้ากำลังโหลดอยู่ ให้ return null ไปก่อน
        if (this.isLoading) {
            return null;
        }

        // ตรวจสอบว่าข้อมูลใน cache หมดอายุหรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.houseCache.size === 0) {
            await this.refreshHouseCache();
        }

        return this.houseCache.get(houseId) || null;
    }

    async refreshHouseCache(): Promise<void> {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            console.log('🏠 Refreshing house mapping cache...');

            let allHouses: HouseRecord[] = [];
            let currentPage = 1;
            let hasMoreData = true;

            // ดึงข้อมูลทุกหน้าจนหมด
            while (hasMoreData) {
                const response = await axiosVMS.get('/api/collections/house/records', {
                    params: {
                        perPage: 500,
                        page: currentPage
                    }
                });

                if (response.data?.items && response.data.items.length > 0) {
                    allHouses = [...allHouses, ...response.data.items];

                    // ตรวจสอบว่ามีหน้าถัดไปหรือไม่
                    const totalPages = response.data.totalPages || 1;
                    hasMoreData = currentPage < totalPages;
                    currentPage++;
                } else {
                    hasMoreData = false;
                }
            }

            // เคลียร์ cache เก่าและสร้างใหม่
            this.houseCache.clear();
            this.addressCache.clear();

            // สร้าง mapping ใหม่
            allHouses.forEach((house: HouseRecord) => {
                this.houseCache.set(house.id, house);
                this.addressCache.set(house.id, house.address);
            });

            this.lastFetchTime = Date.now();
            console.log(`✅ House mapping cache refreshed with ${allHouses.length} houses`);
            console.log('🏠 Sample mappings:', Array.from(this.addressCache.entries()).slice(0, 3));

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
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.addressCache.size === 0) {
            await this.refreshHouseCache();
        }

        // สร้าง mapping สำหรับ houseIds ที่ต้องการ
        houseIds.forEach(houseId => {
            if (houseId) {
                result.set(houseId, this.addressCache.get(houseId) || houseId);
            }
        });

        return result;
    }

    async searchHousesByAddress(searchTerm: string): Promise<HouseRecord[]> {
        // ตรวจสอบว่าต้องโหลดข้อมูลใหม่หรือไม่
        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.houseCache.size === 0) {
            await this.refreshHouseCache();
        }

        const results: HouseRecord[] = [];
        const searchLower = searchTerm.toLowerCase();

        this.houseCache.forEach((house) => {
            if (house.address.toLowerCase().includes(searchLower)) {
                results.push(house);
            }
        });

        return results;
    }

    clearCache(): void {
        this.houseCache.clear();
        this.addressCache.clear();
        this.lastFetchTime = 0;
    }

    getCacheSize(): number {
        return this.addressCache.size;
    }

    isCacheValid(): boolean {
        const now = Date.now();
        return (now - this.lastFetchTime) <= this.CACHE_DURATION && this.addressCache.size > 0;
    }

    // Get all address mappings (สำหรับ debug หรือ display ใน UI)
    getAllAddressMappings(): Map<string, string> {
        return new Map(this.addressCache);
    }

    // Get all house details (สำหรับ debug หรือ display ใน UI)
    getAllHouseDetails(): Map<string, HouseRecord> {
        return new Map(this.houseCache);
    }

    // Get statistics
    getHouseStats(): {
        total: number;
        byArea: Record<string, number>;
        cacheAge: number;
    } {
        const stats = {
            total: this.houseCache.size,
            byArea: {} as Record<string, number>,
            cacheAge: Date.now() - this.lastFetchTime
        };

        this.houseCache.forEach((house) => {
            if (stats.byArea[house.area]) {
                stats.byArea[house.area]++;
            } else {
                stats.byArea[house.area] = 1;
            }
        });

        return stats;
    }

    // Force refresh (สำหรับใช้ใน UI)
    async forceRefresh(): Promise<void> {
        this.lastFetchTime = 0; // Reset เพื่อบังคับให้ refresh
        await this.refreshHouseCache();
    }
}

// Export singleton instance
export const houseMappingService = new HouseMappingService();