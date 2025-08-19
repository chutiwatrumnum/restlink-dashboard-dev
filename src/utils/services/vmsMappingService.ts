// ไฟล์: src/utils/services/vmsMappingService.ts (Updated with Vehicle support)

import { houseMappingService } from "./houseMappingService";
import { areaMappingService } from "./areaMappingService";
import { vehicleMappingService } from "./vehicleMappingService";

class VMSMappingService {

    async initializeAllMappings(): Promise<void> {
        console.log('🚀 Initializing all VMS mappings...');

        try {
            // โหลด mappings ทั้งหมดพร้อมกัน
            await Promise.all([
                houseMappingService.refreshHouseCache(),
                areaMappingService.refreshAreaCache(),
                vehicleMappingService.refreshVehicleCache()
            ]);

            console.log('✅ All VMS mappings initialized successfully');
            console.log(`📊 Mapping summary:`, {
                houses: houseMappingService.getCacheSize(),
                areas: areaMappingService.getCacheSize(),
                vehicles: vehicleMappingService.getCacheSize()
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
                areaMappingService.refreshAreaCache(),
                vehicleMappingService.refreshVehicleCache()
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
        vehicleMappingService.clearCache();
        console.log('🧹 All VMS mapping caches cleared');
    }

    getMappingStatus(): {
        houses: { size: number; isValid: boolean };
        areas: { size: number; isValid: boolean };
        vehicles: { size: number; isValid: boolean };
    } {
        return {
            houses: {
                size: houseMappingService.getCacheSize(),
                isValid: houseMappingService.isCacheValid()
            },
            areas: {
                size: areaMappingService.getCacheSize(),
                isValid: areaMappingService.isCacheValid()
            },
            vehicles: {
                size: vehicleMappingService.getCacheSize(),
                isValid: vehicleMappingService.isCacheValid()
            }
        };
    }

    // === HOUSE UTILITY METHODS ===
    async getHouseAddress(houseId: string): Promise<string> {
        return houseMappingService.getHouseAddress(houseId);
    }

    async getMultipleHouseAddresses(houseIds: string[]): Promise<Map<string, string>> {
        return houseMappingService.getMultipleHouseAddresses(houseIds);
    }

    // === AREA UTILITY METHODS ===
    async getAreaName(areaId: string): Promise<string> {
        return areaMappingService.getAreaName(areaId);
    }

    async getMultipleAreaNames(areaIds: string[]): Promise<Map<string, string>> {
        return areaMappingService.getMultipleAreaNames(areaIds);
    }

    // สำหรับ map array ของ area IDs เป็น names
    async mapAreaNamesFromArray(areaIds: string[]): Promise<string[]> {
        return areaMappingService.mapAreaNamesFromArray(areaIds);
    }

    // === VEHICLE UTILITY METHODS ===
    async getVehicleLicensePlate(vehicleId: string): Promise<string> {
        return vehicleMappingService.getVehicleLicensePlate(vehicleId);
    }

    async getMultipleVehicleLicensePlates(vehicleIds: string[]): Promise<Map<string, string>> {
        return vehicleMappingService.getMultipleVehicleLicensePlates(vehicleIds);
    }

    // สำหรับ map array ของ vehicle IDs เป็น license plates
    async mapLicensePlatesFromArray(vehicleIds: string[]): Promise<string[]> {
        return vehicleMappingService.mapLicensePlatesFromArray(vehicleIds);
    }

    async getVehicleDetails(vehicleId: string) {
        return vehicleMappingService.getVehicleDetails(vehicleId);
    }

    async searchVehiclesByLicensePlate(searchTerm: string) {
        return vehicleMappingService.searchVehiclesByLicensePlate(searchTerm);
    }

    async getVehiclesByHouseId(houseId: string) {
        return vehicleMappingService.getVehiclesByHouseId(houseId);
    }

    async getVehiclesByTier(tier: string) {
        return vehicleMappingService.getVehiclesByTier(tier);
    }

    async getActiveVehicles() {
        return vehicleMappingService.getActiveVehicles();
    }

    getVehicleStats() {
        return vehicleMappingService.getVehicleStats();
    }

    // === COMBINED MAPPING METHODS ===
    /**
     * Get comprehensive mapping information for a house
     */
    async getHouseCompleteInfo(houseId: string): Promise<{
        houseAddress: string;
        vehicles: any[];
        vehicleCount: number;
    }> {
        try {
            const [houseAddress, vehicles] = await Promise.all([
                this.getHouseAddress(houseId),
                this.getVehiclesByHouseId(houseId)
            ]);

            return {
                houseAddress,
                vehicles,
                vehicleCount: vehicles.length
            };
        } catch (error) {
            console.error('❌ Failed to get house complete info:', error);
            return {
                houseAddress: houseId,
                vehicles: [],
                vehicleCount: 0
            };
        }
    }

    /**
     * Get mapping information for areas with their vehicle counts
     */
    async getAreaWithVehicleCount(areaId: string): Promise<{
        areaName: string;
        vehicleCount: number;
    }> {
        try {
            const areaName = await this.getAreaName(areaId);

            // Count vehicles in this area
            const allVehicles = vehicleMappingService.getAllVehicleDetails();
            let vehicleCount = 0;

            allVehicles.forEach(vehicle => {
                if (vehicle.authorized_area.includes(areaId)) {
                    vehicleCount++;
                }
            });

            return {
                areaName,
                vehicleCount
            };
        } catch (error) {
            console.error('❌ Failed to get area with vehicle count:', error);
            return {
                areaName: areaId,
                vehicleCount: 0
            };
        }
    }

    /**
     * Get comprehensive statistics for all mappings
     */
    getComprehensiveStats(): {
        houses: number;
        areas: number;
        vehicles: number;
        vehicleStats: ReturnType<typeof vehicleMappingService.getVehicleStats>;
    } {
        return {
            houses: houseMappingService.getCacheSize(),
            areas: areaMappingService.getCacheSize(),
            vehicles: vehicleMappingService.getCacheSize(),
            vehicleStats: vehicleMappingService.getVehicleStats()
        };
    }
}

// Export singleton instance
export const vmsMappingService = new VMSMappingService();