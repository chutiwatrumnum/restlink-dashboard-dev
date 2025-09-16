// ไฟล์: src/utils/services/areaMappingService.ts - Clean Version

import axiosVMS from "../../configs/axiosVMS";
import { AreaRecord } from "../../stores/interfaces/Area";

class AreaMappingService {
    private areaCache: Map<string, string> = new Map();
    private isLoading: boolean = false;
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    async getAreaName(areaId: string): Promise<string> {
        if (!areaId) return "-";

        if (this.areaCache.has(areaId)) {
            return this.areaCache.get(areaId) || areaId;
        }

        if (this.isLoading) {
            return areaId;
        }

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
            const response = await axiosVMS.get('/api/collections/area/records', {
                params: {
                    perPage: 1000,
                    page: 1
                }
            });

            if (response.data?.items) {
                response.data.items.forEach((area: AreaRecord) => {
                    this.areaCache.set(area.id, area.name);
                });

                this.lastFetchTime = Date.now();
            }
        } catch (error) {
            console.error("Error refreshing area mapping cache:", error);
        } finally {
            this.isLoading = false;
        }
    }

    async getMultipleAreaNames(areaIds: string[]): Promise<Map<string, string>> {
        const result = new Map<string, string>();

        const now = Date.now();
        if (now - this.lastFetchTime > this.CACHE_DURATION || this.areaCache.size === 0) {
            await this.refreshAreaCache();
        }

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

    async mapAreaNamesFromArray(areaIds: string[]): Promise<string[]> {
        if (!areaIds || areaIds.length === 0) return [];

        const areaMapping = await this.getMultipleAreaNames(areaIds);
        return areaIds.map(areaId => areaMapping.get(areaId) || areaId);
    }

    getAllMappings(): Map<string, string> {
        return new Map(this.areaCache);
    }
}

export const areaMappingService = new AreaMappingService();