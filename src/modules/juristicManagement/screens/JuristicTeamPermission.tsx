// src/modules/juristicManagement/screens/JuristicTeamPermission.tsx
import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

// Components
import Header from "../../../components/templates/Header";
import { callConfirmModal } from "../../../components/common/Modal";
import {
  Tabs,
  Form,
  Row,
  Col,
  Card,
  Button,
  Checkbox,
  Spin,
  Alert,
} from "antd";

// Hooks and API
import { usePermission } from "../../../utils/hooks/usePermission";
import { getJuristicTeamPermissionsQuery } from "../../../utils/queriesGroup/juristicTeamPermissionQueries";
import {
  useUpdateJuristicTeamPermissionsMutation,
  UpdateJuristicPermissionPayload,
} from "../../../utils/mutationsGroup/juristicTeamPermissionMutations";

// Types
import { RootState } from "../../../stores";
import type { TabsProps, CheckboxProps, CheckboxChangeEvent } from "antd";
import type {
  JuristicPermissionItem,
  JuristicRolePermissions,
} from "../../../utils/queriesGroup/juristicTeamPermissionQueries";

// Styles
import "../styles/userManagement.css";

// ========== INTERFACES ==========
interface PermissionState {
  [roleCode: string]: {
    [nameCode: string]: {
      id: number;
      allowAdd: boolean;
      allowView: boolean;
      allowDelete: boolean;
      allowEdit: boolean;
      lock?: boolean;
    };
  };
}

// ========== HELPER FUNCTIONS ==========
const formatDisplayName = (nameCode: string): string => {
  return nameCode
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const PERMISSION_OPTIONS = [
  "allowView",
  "allowEdit",
  "allowAdd",
  "allowDelete",
];
const PERMISSION_LABELS = {
  allowView: "View",
  allowEdit: "Edit",
  allowAdd: "Add",
  allowDelete: "Delete",
};

// ========== MAIN COMPONENT ==========
const JuristicTeamPermission = () => {
  // ========== STATES ==========
  const [form] = Form.useForm();
  const [permissionsState, setPermissionsState] = useState<PermissionState>({});
  const [activeRole, setActiveRole] = useState<string>("");

  // ========== HOOKS ==========
  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  const {
    data: permissionsData,
    isLoading,
    error,
    refetch,
  } = getJuristicTeamPermissionsQuery();

  const updateMutation = useUpdateJuristicTeamPermissionsMutation();

  // ========== COMPUTED VALUES ==========
  const availableRoles = useMemo(() => {
    const data = permissionsData?.result?.data;
    if (!data) return [];

    return data.map((roleData: JuristicRolePermissions) => ({
      code: roleData.roleManageCode,
      label: formatDisplayName(roleData.roleManageCode),
    }));
  }, [permissionsData]);

  const currentPermissions = useMemo(() => {
    return permissionsState[activeRole] || {};
  }, [permissionsState, activeRole]);

  const permissionCodes = useMemo(() => {
    return Object.keys(currentPermissions);
  }, [currentPermissions]);

  const canEdit = access("team_management", "edit");
  const canView = access("team_management", "view");

  // ========== EFFECTS ==========
  useEffect(() => {
    const data = permissionsData?.result?.data;
    if (!data) return;

    const newState: PermissionState = {};

    data.forEach((roleData: JuristicRolePermissions) => {
      newState[roleData.roleManageCode] = {};

      roleData.permissions.forEach((permission: JuristicPermissionItem) => {
        newState[roleData.roleManageCode][permission.nameCode] = {
          id: permission.id,
          allowAdd: permission.allowAdd,
          allowView: permission.allowView,
          allowDelete: permission.allowDelete,
          allowEdit: permission.allowEdit,
          lock: permission.lock || false,
        };
      });
    });

    setPermissionsState(newState);

    // Set first role as active if none selected
    if (!activeRole && data.length > 0) {
      setActiveRole(data[0].roleManageCode);
    }
  }, [permissionsData, activeRole]);

  // ========== HANDLERS ==========
  const handleCheckboxChange = (nameCode: string, checkedValues: string[]) => {
    setPermissionsState((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [nameCode]: {
          ...prev[activeRole][nameCode],
          allowAdd: checkedValues.includes("allowAdd"),
          allowView: checkedValues.includes("allowView"),
          allowDelete: checkedValues.includes("allowDelete"),
          allowEdit: checkedValues.includes("allowEdit"),
        },
      },
    }));
  };

  const handleSelectAll = (nameCode: string) => (e: CheckboxChangeEvent) => {
    const allChecked = e.target.checked;

    setPermissionsState((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [nameCode]: {
          ...prev[activeRole][nameCode],
          allowAdd: allChecked,
          allowView: allChecked,
          allowDelete: allChecked,
          allowEdit: allChecked,
        },
      },
    }));
  };

  const handleTabChange = (key: string) => {
    setActiveRole(key);
  };

  const handleReset = () => {
    const currentRoleName =
      availableRoles.find((role) => role.code === activeRole)?.label ||
      activeRole;

    callConfirmModal({
      title: "Reset permissions?",
      message: `Are you sure you want to clear all permissions for "${currentRoleName}"?`,
      okMessage: "Yes, Reset",
      cancelMessage: "Cancel",
      alertMessage:
        "This will clear all selected permissions for the current role.",
      onOk: () => {
        setPermissionsState((prev) => {
          const newState = { ...prev };
          if (newState[activeRole]) {
            const clearedPermissions = { ...newState[activeRole] };

            Object.keys(clearedPermissions).forEach((nameCode) => {
              clearedPermissions[nameCode] = {
                ...clearedPermissions[nameCode],
                allowAdd: false,
                allowView: false,
                allowDelete: false,
                allowEdit: false,
              };
            });

            newState[activeRole] = clearedPermissions;
          }

          return newState;
        });

        form.resetFields();
      },
    });
  };

  const handleSave = async () => {
    callConfirmModal({
      title: "Update permissions?",
      message: "Do you want to update permissions based on this information?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        try {
          const payload: UpdateJuristicPermissionPayload[] = [];

          Object.entries(currentPermissions).forEach(
            ([nameCode, permission]) => {
              payload.push({
                id: permission.id,
                allowAdd: permission.allowAdd,
                allowView: permission.allowView,
                allowDelete: permission.allowDelete,
                allowEdit: permission.allowEdit,
                permissionRoleManageCode: activeRole,
                featuresName: formatDisplayName(nameCode),
                permissionNameCode: nameCode as any,
              });
            }
          );

          await updateMutation.mutateAsync(payload);
        } catch (error) {
          // Error handling is done in the mutation
        }
      },
    });
  };

  // ========== HELPER FUNCTIONS FOR RENDER ==========
  const isAllChecked = (nameCode: string): boolean => {
    const permission = currentPermissions[nameCode];
    if (!permission) return false;

    return PERMISSION_OPTIONS.every(
      (option) => permission[option as keyof typeof permission]
    );
  };

  const getCheckedValues = (nameCode: string): string[] => {
    const permission = currentPermissions[nameCode];
    if (!permission) return [];

    return PERMISSION_OPTIONS.filter(
      (option) => permission[option as keyof typeof permission]
    );
  };

  // ========== RENDER FUNCTIONS ==========
  const renderPermissionCard = (nameCode: string) => {
    const permission = currentPermissions[nameCode];
    const isLocked = permission?.lock || false;
    const displayName = formatDisplayName(nameCode);

    return (
      <Col span={8} key={nameCode} style={{ marginBottom: 16 }}>
        <Card
          variant="borderless"
          hoverable={!isLocked}
          size="small"
          style={{
            opacity: isLocked ? 0.6 : 1,
            cursor: isLocked ? "not-allowed" : "default",
          }}>
          <Form.Item
            label={displayName}
            name={nameCode}
            className="custom-form-label">
            <Checkbox
              onChange={handleSelectAll(nameCode)}
              checked={isAllChecked(nameCode)}
              disabled={isLocked || !canEdit}>
              Select All
            </Checkbox>
            <Checkbox.Group
              options={PERMISSION_OPTIONS.map((option) => ({
                label:
                  PERMISSION_LABELS[option as keyof typeof PERMISSION_LABELS],
                value: option,
                disabled: isLocked || !canEdit,
              }))}
              value={getCheckedValues(nameCode)}
              onChange={(checkedValues) =>
                handleCheckboxChange(nameCode, checkedValues as string[])
              }
              className="checkboxGroup"
            />
          </Form.Item>
        </Card>
      </Col>
    );
  };

  const renderForm = () => (
    <Form
      form={form}
      name="juristicPermissionForm"
      layout="vertical"
      onFinish={handleSave}>
      <Row gutter={10}>{permissionCodes.map(renderPermissionCard)}</Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="text"
            size="large"
            onClick={handleReset}
            className="reset-button"
            loading={isLoading}
            disabled={!canEdit}
            style={{ marginRight: 16 }}>
            Reset
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSave}
            className="save-button"
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending || isLoading || !canEdit}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </Col>
      </Row>
    </Form>
  );

  const renderTabs = (): TabsProps["items"] =>
    availableRoles.map((role) => ({
      key: role.code,
      label: role.label,
      children: renderForm(),
    }));

  // ========== EARLY RETURNS ==========
  // if (error) {
  //   return (
  //     <>
  //       <Header title="Juristic team permission" />
  //       <Alert
  //         message="Error loading permissions"
  //         description={error.message || "Failed to load permission data"}
  //         type="error"
  //         showIcon
  //         action={
  //           <Button size="small" onClick={() => refetch()}>
  //             Retry
  //           </Button>
  //         }
  //       />
  //     </>
  //   );
  // }

  // if (!canView) {
  //   return (
  //     <>
  //       <Header title="Juristic team permission" />
  //       <Alert
  //         message="Access Denied"
  //         description="You don't have permission to view this page"
  //         type="warning"
  //         showIcon
  //       />
  //     </>
  //   );
  // }

  // ========== MAIN RENDER ==========
  return (
    <>
      <Header title="Juristic team permission" />
      <Card
        title="Permissions"
        className="custom-card-title"
        variant="outlined">
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading permissions...</div>
          </div>
        ) : (
          <Tabs
            tabBarGutter={2}
            animated={true}
            tabPosition="left"
            items={renderTabs()}
            className="custom-tabs"
            activeKey={activeRole}
            onChange={handleTabChange}
          />
        )}
      </Card>
    </>
  );
};

export default JuristicTeamPermission;
