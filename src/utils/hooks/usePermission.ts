import {
  PermissionType,
  PermissionNameCode,
} from "../../stores/interfaces/Common";

type Action = "view" | "create" | "edit" | "delete";

export const usePermission = (permissions: PermissionType[] = []) => {
  const access = (code: PermissionNameCode, action: Action): boolean => {
    const found = permissions.find((p) => p.permissionNameCode === code);

    if (!found) return false; // ❌ ไม่เจอถือว่าไม่มีสิทธิ์

    switch (action) {
      case "view":
        return !!found.allowView;
      case "create":
        return !!found.allowAdd;
      case "edit":
        return !!found.allowEdit;
      case "delete":
        return !!found.allowDelete;
      default:
        return false;
    }
  };

  return { access };
};
