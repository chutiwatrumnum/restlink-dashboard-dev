import React, { useState, useEffect } from "react";
import {
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Avatar,
  Divider,
  message,
  List,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { TabsProps } from "antd";
import axios from "axios";

// Types for API
interface AddMemberPayload {
  unitId: number;
  userId: string;
  roleId: number;
  myHomeId: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageProfile?: string;
}

interface Member {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  roleName: string;
  imageProfile?: string;
}

interface Role {
  id: number;
  name: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitInfo?: {
    address: string;
    roomNo: string;
    unitId: number;
  };
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  unitInfo,
}) => {
  const [activeTab, setActiveTab] = useState("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | undefined>();
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Load roles และ current members เมื่อเปิด modal
  useEffect(() => {
    if (isOpen && unitInfo?.unitId) {
      console.log("Loading data for unit:", unitInfo);
      loadRoles();
      loadCurrentMembers();
    }
  }, [isOpen, unitInfo?.unitId]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("members"); // เริ่มที่ tab members เพื่อแสดงข้อมูลเจ้าของเดิม
      setSearchTerm("");
      setSearchResults([]);
      setSelectedRole(1);
      setCurrentMembers([]);
    }
  }, [isOpen]);

  // Load roles
  const loadRoles = async () => {
    try {
      // Mock roles - แทนที่ด้วย API call จริงถ้ามี
      setRoles([
        { id: 1, name: "Owner" },
        { id: 2, name: "Tenant" },
        { id: 3, name: "Inhabitant" },
      ]);
      setSelectedRole(1);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  // Load current members
  const loadCurrentMembers = async () => {
    if (!unitInfo?.unitId) return;

    setIsLoadingMembers(true);
    try {
      // เรียก API เพื่อดึงข้อมูลสมาชิกในห้อง
      const response = await axios.get(
        `/api/v1.0/room-management/member/list`,
        {
          params: { unitId: unitInfo.unitId },
        }
      );

      console.log("Members API response:", response.data);

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setCurrentMembers(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setCurrentMembers(response.data);
      } else {
        // ถ้า API ไม่มีข้อมูล ลองเรียก API อื่นที่อาจมีข้อมูลสมาชิก
        await loadMembersFromUnitData();
      }
    } catch (error) {
      console.error("Error loading members:", error);
      // ถ้า API แรกไม่ทำงาน ลองเรียก API สำรอง
      await loadMembersFromUnitData();
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // ดึงข้อมูลสมาชิกจาก unit data (API สำรอง)
  const loadMembersFromUnitData = async () => {
    try {
      // เรียก API ดึงข้อมูล unit เพื่อหาข้อมูลสมาชิก
      const unitResponse = await axios.get(
        `/api/v1.0/room-management/unit/${unitInfo?.unitId}`
      );

      console.log("Unit API response:", unitResponse.data);

      if (unitResponse.data && unitResponse.data.data) {
        const unitData = unitResponse.data.data;
        const members: Member[] = [];

        // เพิ่มเจ้าของห้อง (unitOwner) เฉพาะเมื่อมีข้อมูล
        if (
          unitData.unitOwner &&
          (unitData.unitOwner.givenName || unitData.unitOwner.firstName)
        ) {
          members.push({
            id: `owner-${unitData.unitOwner.id || "default"}`,
            userId:
              unitData.unitOwner.id ||
              unitData.unitOwner.userId ||
              "owner-default",
            firstName:
              unitData.unitOwner.givenName ||
              unitData.unitOwner.firstName ||
              "",
            lastName:
              unitData.unitOwner.familyName ||
              unitData.unitOwner.lastName ||
              "",
            email: unitData.unitOwner.email || "",
            roleId: 1, // Owner role
            roleName: "Owner",
            imageProfile: unitData.unitOwner.imageProfile,
          });
        }

        // เพิ่มสมาชิกอื่นๆ ถ้ามี
        if (unitData.members && Array.isArray(unitData.members)) {
          unitData.members.forEach((member: any, index: number) => {
            if (member.firstName || member.givenName) {
              // เช็คว่ามีข้อมูลจริง
              members.push({
                id: member.id || `member-${index}`,
                userId: member.userId || member.id || `user-${index}`,
                firstName: member.firstName || member.givenName || "",
                lastName: member.lastName || member.familyName || "",
                email: member.email || "",
                roleId: member.roleId || 3, // Default to Inhabitant
                roleName: member.roleName || getRoleName(member.roleId || 3),
                imageProfile: member.imageProfile,
              });
            }
          });
        }

        setCurrentMembers(members);
        console.log("Processed members:", members);
      } else {
        // ถ้าไม่มีข้อมูลจาก API ให้เซ็ตเป็น array ว่าง
        console.log("No unit data found, setting empty members");
        setCurrentMembers([]);
      }
    } catch (error) {
      console.error("Error loading unit data:", error);
      // ถ้าเกิด error ให้เซ็ตเป็น array ว่าง แทนที่จะใช้ mock data
      console.log("API error, setting empty members");
      setCurrentMembers([]);
    }
  };

  // Helper function ดึงชื่อ role
  const getRoleName = (roleId: number): string => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : "Inhabitant";
  };

  // Search users
  const handleSearch = async (value: string) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`/api/v1.0/users/search`, {
        params: {
          q: value,
          limit: 10,
        },
      });

      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback mock data
      const mockUsers: User[] = [
        {
          id: "user-3",
          firstName: "Lalita",
          lastName: "Pansuk",
          email: "lalita.p@example.com",
        },
        {
          id: "user-4",
          firstName: "Kusamala",
          lastName: "Deemak",
          email: "kusamala.d@example.com",
        },
      ].filter(
        (user) =>
          user.firstName.toLowerCase().includes(value.toLowerCase()) ||
          user.lastName.toLowerCase().includes(value.toLowerCase()) ||
          user.email.toLowerCase().includes(value.toLowerCase())
      );

      setSearchResults(mockUsers);
    } finally {
      setIsSearching(false);
    }
  };

  // Add member to room
  const handleAddMember = async (user: User) => {
    if (!unitInfo?.unitId || !selectedRole) {
      message.error("Missing required information");
      return;
    }

    // Check if user is already a member
    const isAlreadyMember = currentMembers.some(
      (member) => member.userId === user.id
    );
    if (isAlreadyMember) {
      message.warning("This user is already a member of this room");
      return;
    }

    setIsLoading(true);
    try {
      const payload: AddMemberPayload = {
        unitId: unitInfo.unitId,
        userId: user.id,
        roleId: selectedRole,
        myHomeId: "default", // ปรับตามระบบจริง
      };

      const response = await axios.post(
        "/api/v1.0/room-management/member/add",
        payload
      );

      if (response.status === 200 || response.status === 201) {
        message.success(
          `${user.firstName} ${user.lastName} has been added successfully`
        );

        // Refresh member list
        await loadCurrentMembers();

        // Switch to members tab
        setActiveTab("members");
        setSearchTerm("");
        setSearchResults([]);
      } else {
        throw new Error("Failed to add member");
      }
    } catch (error: any) {
      console.error("Add member error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add member. Please try again.";
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (member: Member) => {
    if (!unitInfo?.unitId) return;

    try {
      const response = await axios.delete(
        `/api/v1.0/room-management/member/remove`,
        {
          data: {
            unitId: unitInfo.unitId,
            userId: member.userId,
          },
        }
      );

      if (response.status === 200) {
        message.success(
          `${member.firstName} ${member.lastName} has been removed`
        );
        await loadCurrentMembers();
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error: any) {
      console.error("Remove member error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to remove member";
      message.error(errorMessage);
    }
  };

  // Update member role
  const handleUpdateRole = async (member: Member, newRoleId: number) => {
    if (!unitInfo?.unitId) return;

    try {
      const response = await axios.put(
        `/api/v1.0/room-management/member/update`,
        {
          unitId: unitInfo.unitId,
          userId: member.userId,
          roleId: newRoleId,
        }
      );

      if (response.status === 200) {
        message.success("Member role updated successfully");
        await loadCurrentMembers();
      } else {
        throw new Error("Failed to update role");
      }
    } catch (error: any) {
      console.error("Update role error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update role";
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedRole(1);
    setActiveTab("members");
    onClose();
  };

  const renderUserCard = (user: User) => (
    <div
      key={user.id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
        borderRadius: "8px",
        margin: "4px 0",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Avatar
          size={40}
          src={user.imageProfile}
          icon={!user.imageProfile && <UserOutlined />}
          style={{ backgroundColor: user.imageProfile ? undefined : "#1890ff" }}
        />
        <div>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#262626" }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: "14px", color: "#8c8c8c" }}>{user.email}</div>
        </div>
      </div>
      <Button
        type="primary"
        size="small"
        onClick={() => handleAddMember(user)}
        loading={isLoading}
        disabled={!selectedRole}
        style={{
          backgroundColor: "#1890ff",
          borderColor: "#1890ff",
          borderRadius: "6px",
        }}>
        Add
      </Button>
    </div>
  );

  const renderMemberCard = (member: Member) => (
    <List.Item
      key={member.id}
      actions={[
        <Select
          size="small"
          value={member.roleId}
          onChange={(newRoleId) => handleUpdateRole(member, newRoleId)}
          style={{ width: 100 }}>
          {roles.map((role) => (
            <Select.Option key={role.id} value={role.id}>
              {role.name}
            </Select.Option>
          ))}
        </Select>,
        <Popconfirm
          title="Remove member?"
          description="Are you sure you want to remove this member?"
          onConfirm={() => handleRemoveMember(member)}
          okText="Yes"
          cancelText="No">
          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>,
      ]}>
      <List.Item.Meta
        avatar={
          <Avatar
            src={member.imageProfile}
            icon={!member.imageProfile && <UserOutlined />}
          />
        }
        title={`${member.firstName} ${member.lastName}`}
        description={
          <div>
            <div>{member.email}</div>
            <div style={{ color: "#1890ff", fontSize: "12px" }}>
              {member.roleName}
            </div>
          </div>
        }
      />
    </List.Item>
  );

  const membersContent = (
    <div style={{ padding: "16px 24px" }}>
      {/* Debug info - ลบออกเมื่อใช้งานจริง */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            background: "#f0f0f0",
            padding: "8px",
            marginBottom: "16px",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#666",
          }}>
          Debug: Unit ID: {unitInfo?.unitId}, Members found:{" "}
          {currentMembers.length}
          {currentMembers.length > 0 && (
            <div>
              Members:{" "}
              {currentMembers
                .map((m) => `${m.firstName} ${m.lastName}`)
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {isLoadingMembers ? (
        <div style={{ textAlign: "center", padding: "32px", color: "#8c8c8c" }}>
          <div>Loading members...</div>
        </div>
      ) : currentMembers.length > 0 ? (
        <List dataSource={currentMembers} renderItem={renderMemberCard} />
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "32px",
            color: "#8c8c8c",
          }}>
          <div style={{ marginBottom: "16px", fontSize: "16px" }}>
            📭 This room has no members yet
          </div>
          <div style={{ marginBottom: "16px", color: "#bfbfbf" }}>
            Add the first member by using the "Add Member" tab
          </div>
          <Button
            type="primary"
            onClick={() => setActiveTab("add")}
            style={{ backgroundColor: "#1890ff" }}>
            Add First Member
          </Button>
        </div>
      )}
    </div>
  );

  const addMemberContent = (
    <div>
      {/* Role Selection */}
      <div style={{ padding: "16px 24px 0" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#262626",
          }}>
          Select Role
        </label>
        <Select
          style={{ width: "100%" }}
          size="large"
          value={selectedRole}
          onChange={setSelectedRole}
          placeholder="Select role for the member">
          {roles.map((role) => (
            <Select.Option key={role.id} value={role.id}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Divider style={{ margin: "16px 0" }} />

      {/* Search Section */}
      <div style={{ padding: "0 24px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#262626",
          }}>
          Search User
        </label>
        <Input
          placeholder="Search by name or email"
          prefix={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ borderRadius: "8px" }}
        />
      </div>

      {/* Search Results */}
      <div
        style={{
          padding: "16px 24px 24px",
          maxHeight: "300px",
          overflowY: "auto",
        }}>
        {isSearching ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "#8c8c8c",
            }}>
            <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
              Searching...
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            <div
              style={{
                fontSize: "14px",
                color: "#8c8c8c",
                marginBottom: "12px",
              }}>
              Found {searchResults.length} user(s)
            </div>
            {searchResults.map(renderUserCard)}
          </div>
        ) : searchTerm ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "#bfbfbf",
            }}>
            No users found for "{searchTerm}"
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "#bfbfbf",
            }}>
            Enter name or email to search for users
          </div>
        )}
      </div>
    </div>
  );

  const items: TabsProps["items"] = [
    {
      key: "members",
      label: `Current Members (${currentMembers.length})`,
      children: membersContent,
    },
    {
      key: "add",
      label: "Add Member",
      children: addMemberContent,
    },
  ];

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      closeIcon={<CloseOutlined style={{ color: "#8c8c8c" }} />}>
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "24px",
          padding: "24px 24px 0",
        }}>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 600,
            marginBottom: "12px",
            color: "#262626",
          }}>
          Add Member
        </h3>
        {unitInfo && (
          <div style={{ fontSize: "14px", color: "#8c8c8c" }}>
            <div>
              Address:{" "}
              <span style={{ fontWeight: 500 }}>{unitInfo.address}</span>
            </div>
            <div>
              Room No:{" "}
              <span style={{ fontWeight: 500 }}>{unitInfo.roomNo}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        centered
      />

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Modal>
  );
};

export default AddUserModal;
