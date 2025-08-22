// ไฟล์: src/utils/services/vmsMappingService.ts - Clean Version

import { houseMappingService } from "./houseMappingService";
import { areaMappingService } from "./areaMappingService";
import { vehicleMappingService } from "./vehicleMappingService";

class VMSMappingService {

    async initializeAllMappings(): Promise<void> {
        try {
            await Promise.all([
                houseMappingService.refreshHouseCache(),
                areaMappingService.refreshAreaCache(),
                vehicleMappingService.refreshVehicleCache()
            ]);
        } catch (error) {
            console.error("Error initializing VMS mappings:", error);
            throw error;
        }
    }

    async refreshAllMappings(): Promise<void> {
        try {
            await Promise.all([
                houseMappingService.refreshHouseCache(),
                areaMappingService.refreshAreaCache(),
                vehicleMappingService.refreshVehicleCache()
            ]);
        } catch (error) {
            console.error("Error refreshing VMS mappings:", error);
            throw error;
        }
    }

    clearAllCaches(): void {
        houseMappingService.clearCache();
        areaMappingService.clearCache();
        vehicleMappingService.clearCache();
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

    // House methods
    async getHouseAddress(houseId: string): Promise<string> {
        return houseMappingService.getHouseAddress(houseId);
    }

    async getMultipleHouseAddresses(houseIds: string[]): Promise<Map<string, string>> {
        return houseMappingService.getMultipleHouseAddresses(houseIds);
    }

    // Area methods
    async getAreaName(areaId: string): Promise<string> {
        return areaMappingService.getAreaName(areaId);
    }

    async getMultipleAreaNames(areaIds: string[]): Promise<Map<string, string>> {
        return areaMappingService.getMultipleAreaNames(areaIds);
    }

    async mapAreaNamesFromArray(areaIds: string[]): Promise<string[]> {
        return areaMappingService.mapAreaNamesFromArray(areaIds);
    }

    // Vehicle methods
    async getVehicleLicensePlate(vehicleId: string): Promise<string> {
        return vehicleMappingService.getVehicleLicensePlate(vehicleId);
    }

    async getMultipleVehicleLicensePlates(vehicleIds: string[]): Promise<Map<string, string>> {
        return vehicleMappingService.getMultipleVehicleLicensePlates(vehicleIds);
    }

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

    // Combined methods
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
            console.error("Error getting house complete info:", error);
            return {
                houseAddress: houseId,
                vehicles: [],
                vehicleCount: 0
            };
        }
    }

    async getAreaWithVehicleCount(areaId: string): Promise<{
        areaName: string;
        vehicleCount: number;
    }> {
        try {
            const areaName = await this.getAreaName(areaId);
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
            console.error("Error getting area with vehicle count:", error);
            return {
                areaName: areaId,
                vehicleCount: 0
            };
        }
    }

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

export const vmsMappingService = new VMSMappingService();