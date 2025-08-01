export interface CommonType {
  masterData?: MasterDataType;
  accessibility?: AccessibilityType;
  unitOptions: { label: string; value: number }[];
  unitFilter?: number;
}

export interface MasterDataType {
  test: boolean;
}

export interface AccessibilityType {
  team_user_profile: MenuItemAccessibilityType;
  team_user_management: MenuItemAccessibilityType;
  team_facility_management: MenuItemAccessibilityType;
  team_announcement: MenuItemAccessibilityType;
  team_team_management: MenuItemAccessibilityType;
}
export interface MenuItemAccessibilityType {
  permissionCode: string;
  permissionName: string;
  allowAdd: boolean;
  allowView: boolean;
  allowDelete: boolean;
  allowEdit: boolean;
}
