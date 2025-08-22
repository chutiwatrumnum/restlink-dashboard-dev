// ไฟล์: src/utils/services/houseMappingService.ts - Clean Version

import axiosVMS from "../../configs/axiosVMS";
import { HouseRecord } from "../../stores/interfaces/House";

class HouseMappingService {
    private houseCache: Map<string, HouseRecord> = new Map();
    private addressCache: Map<string, string> = new Map();
    private isLoading: boolean = false;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getHouseAddress(houseId: string): Promise<string> {
        if (!houseId) return "-";

        if (this.addressCache.has(houseId)) {
            return this.addressCache.get(houseId) || houseId;
        }

        if (this.isLoading) {
            return houseId;
        }

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.addressCache.size === 0) {
            await this.refreshHouseCache();
        }

        return this.addressCache.get(houseId) || houseId;
    }

    async getHouseDetails(houseId: string): Promise<HouseRecord | null> {
        if (!houseId) return null;

        if (this.houseCache.has(houseId)) {
            return this.houseCache.get(houseId) || null;
        }

        if (this.isLoading) {
            return null;
        }

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
            let allHouses: HouseRecord[] = [];
            let currentPage = 1;
            let hasMoreData = true;

            while (hasMoreData) {
                const response = await axiosVMS.get('/api/collections/house/records', {
                    params: {
                        perPage: 500,
                        page: currentPage
                    }
                });

                if (response.data?.items && response.data.items.length > 0) {
                    allHouses = [...allHouses, ...response.data.items];
                    const totalPages = response.data.totalPages || 1;
                    hasMoreData = currentPage < totalPages;
                    currentPage++;
                } else {
                    hasMoreData = false;
                }
            }

            this.houseCache.clear();
            this.addressCache.clear();

            allHouses.forEach((house: HouseRecord) => {
                this.houseCache.set(house.id, house);
                this.addressCache.set(house.id, house.address);
            });

            this.lastFetchTime = Date.now();
        } catch (error) {
            console.error("Error refreshing house mapping cache:", error);
        } finally {
            this.isLoading = false;
        }
    }

    async getMultipleHouseAddresses(houseIds: string[]): Promise<Map<string, string>> {
        const result = new Map<string, string>();

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.addressCache.size === 0) {
            await this.refreshHouseCache();
        }

        houseIds.forEach(houseId => {
            if (houseId) {
                result.set(houseId, this.addressCache.get(houseId) || houseId);
            }
        });

        return result;
    }

    async searchHousesByAddress(searchTerm: string): Promise<HouseRecord[]> {
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

    getAllAddressMappings(): Map<string, string> {
        return new Map(this.addressCache);
    }

    getAllHouseDetails(): Map<string, HouseRecord> {
        return new Map(this.houseCache);
    }

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

    async forceRefresh(): Promise<void> {
        this.lastFetchTime = 0;
        await this.refreshHouseCache();
    }
}

export const houseMappingService = new HouseMappingService();