// Hooks
import { useState, useEffect } from "react";

// Components
import { Modal, Select, Button } from "antd";

// API
import {
  postAddMemberMutation,
  postSearchUserMutation,
} from "../../../utils/mutationsGroup/managementMutation";

// Types
import {
  SearchUser,
  AddUserPayload,
} from "../../../stores/interfaces/Management";

type SelectUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unitId: number;
  roleId: number;
};

const SelectUserModal = (props: SelectUserModalProps) => {
  // Initials
  const { open, onClose, onSuccess, unitId, roleId } = props;

  // States
  const [options, setOptions] = useState<SearchUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // API
  const postSearch = postSearchUserMutation();
  const postAdd = postAddMemberMutation();

  // Functions
  const onModalClose = () => {
    setSelectedUserId(null);
    setOptions([]);
    onClose();
  };

  // Actions
  useEffect(() => {
    if (!open) {
      onModalClose();
    }
  }, [open]);

  return (
    <Modal
      title="Add user"
      open={open}
      onCancel={onModalClose}
      footer={null}
      width={"90%"}
      style={{ maxWidth: 640 }}
      centered
    >
      <Select
        open={dropdownOpen}
        size="large"
        showSearch
        placeholder="Search by name or email"
        value={selectedUserId ?? undefined}
        onChange={(val) => {
          setSelectedUserId(val);
          setDropdownOpen(false);
        }}
        loading={postSearch.isPending}
        style={{ width: "100%", marginBottom: 16 }}
        options={options.map((u) => ({
          label: `${u.givenName} ${u.familyName} (${u.email})`,
          value: u.userId,
        }))}
        onInputKeyDown={(e) => {
          if (e.key === "Enter") {
            setDropdownOpen(false);
            const val = (e.target as HTMLInputElement).value;
            if (val.trim()) {
              postSearch
                .mutateAsync({ search: val, curPage: 1 })
                .then((res) => {
                  const data: SearchUser[] = res.data.result;
                  setOptions(data);
                  setDropdownOpen(true);
                });
            }
          }
        }}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        onClear={() => {
          setSelectedUserId(null);
          setOptions([]);
        }}
        allowClear
      />
      <div style={{ textAlign: "right" }}>
        <Button
          type="primary"
          size="large"
          disabled={!selectedUserId}
          onClick={() => {
            if (selectedUserId) {
              const selectedUser = options.find(
                (u) => u.userId === selectedUserId
              );
              const payload: AddUserPayload = {
                unitId: unitId,
                userId: selectedUser?.userId ?? "---",
                myHomeId: selectedUser?.myHomeId ?? "---",
                roleId: roleId,
              };

              postAdd.mutateAsync(payload).then(() => {
                onSuccess();
              });
            }
          }}
        >
          Confirm Add
        </Button>
      </div>
    </Modal>
  );
};

export default SelectUserModal;
