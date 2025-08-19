// ไฟล์: src/utils/services/vmsMappingService.ts

import { houseMappingService } from "./houseMappingService";
import { areaMappingService } from "./areaMappingService";

class VMSMappingService {

    async initializeAllMappings(): Promise<void> {
        console.log('🚀 Initializing all VMS mappings...');

        try {
            // โหลด mappings ทั้งหมดพร้อมกัน
            await Promise.all([
                houseMappingService.refreshHouseCache(),
                areaMappingService.refreshAreaCache()
            ]);

            console.log('✅ All VMS mappings initialized successfully');
            console.log(`📊 Mapping summary:`, {
                houses: houseMappingService.getCacheSize(),
                areas: areaMappingService.getCacheSize()
            });

        } catch (error) {
            console.error('❌ Failed to initialize VMS mappings:', error);
            throw error;
        }
    }

    async refreshAllMappings(): Promise<void> {
        console.log('🔄 Refreshing all VMS mappings...');

        try {
            await Promise.all([
                houseMappingService.refreshHouseCache(),
                areaMappingService.refreshAreaCache()
            ]);

            console.log('✅ All VMS mappings refreshed successfully');
        } catch (error) {
            console.error('❌ Failed to refresh VMS mappings:', error);
            throw error;
        }
    }

    clearAllCaches(): void {
        houseMappingService.clearCache();
        areaMappingService.clearCache();
        console.log('🧹 All VMS mapping caches cleared');
    }

    getMappingStatus(): {
        houses: { size: number; isValid: boolean };
        areas: { size: number; isValid: boolean };
    } {
        return {
            houses: {
                size: houseMappingService.getCacheSize(),
                isValid: houseMappingService.isCacheValid()
            },
            areas: {
                size: areaMappingService.getCacheSize(),
                isValid: areaMappingService.isCacheValid()
            }
        };
    }

    // Utility methods for quick access
    async getHouseAddress(houseId: string): Promise<string> {
        return houseMappingService.getHouseAddress(houseId);
    }

    async getAreaName(areaId: string): Promise<string> {
        return areaMappingService.getAreaName(areaId);
    }

    async getMultipleHouseAddresses(houseIds: string[]): Promise<Map<string, string>> {
        return houseMappingService.getMultipleHouseAddresses(houseIds);
    }

    async getMultipleAreaNames(areaIds: string[]): Promise<Map<string, string>> {
        return areaMappingService.getMultipleAreaNames(areaIds);
    }

    // สำหรับ map array ของ area IDs เป็น names
    async mapAreaNamesFromArray(areaIds: string[]): Promise<string[]> {
        return areaMappingService.mapAreaNamesFromArray(areaIds);
    }
}

// Export singleton instance
export const vmsMappingService = new VMSMappingService();