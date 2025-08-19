import { useState } from "react";
// Components
import Header from "../../../components/templates/Header";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SmallButton from "../../../components/common/SmallButton";
import { Tabs, Form, Row, Col, Card, Button, Checkbox } from "antd";
// CSS
import "../styles/userManagement.css";
// Types
import type { TabsProps, CheckboxProps, CheckboxChangeEvent } from "antd";
//

const JuristicTeamPermission = () => {
  const [form] = Form.useForm();

  const permissionSuperAdminModules: string[] = [
    "contactList",
    "fixingReport",
    "liveChat",
    "documentForm",
    "homeAutomation",
    "maintenanceGuide",
    "event",
    "leftHomeWithGuard",
    "newsAndAnnouncement",
  ];
  const checkBoxOptions: string[] = ["View", "Edit", "Add", "Delete"];
  const CheckboxGroup = Checkbox.Group;
  const [permissionsSuperAdmin, setPermissionsSuperAdmin] = useState<
    Record<string, string[]>
  >(() => {
    const initialState: Record<string, string[]> = {};
    permissionSuperAdminModules.forEach((module) => {
      initialState[module] = [];
    });
    return initialState;
  });

  const handleCheckboxChange = (module: string, list: string[]) => {
    setPermissionsSuperAdmin((prev) => ({
      ...prev,
      [module]: list,
    }));
    console.log(module, "checked:", list);
  };

  const onCheckAllChange =
    (module: string): CheckboxProps["onChange"] =>
    (e: CheckboxChangeEvent) => {
      setPermissionsSuperAdmin((prev) => ({
        ...prev,
        [module]: e.target.checked ? checkBoxOptions : [],
      }));
    };

  const isAllChecked = (module: string) => {
    return checkBoxOptions.length === permissionsSuperAdmin[module]?.length;
  };

  const onReset = () => {
    form.resetFields();
  };

  const onFinish = async (value: any) => {
    ConfirmModal({
      title: "You want to add permissions?",
      message: "Do you want to add permissions based on this information?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        console.log("Form values:", value);
      },
    });
  };

  // Tabs
  const items: TabsProps["items"] = [
    {
      key: "admin",
      label: "Project admin",
      children: (
        <>
          <Form
            form={form}
            name="projectAdminFormPermission"
            initialValues={{ remember: true }}
            autoComplete="off"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={() => {
              console.log("FINISHED FAILED");
            }}
          >
            <Row gutter={10}>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Contact list"
                    name="contactList"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("contactList")}
                      checked={isAllChecked("contactList")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.contactList || []}
                      onChange={(list) =>
                        handleCheckboxChange("contactList", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Fixing report"
                    name="fixingReport"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("fixingReport")}
                      checked={isAllChecked("fixingReport")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.fixingReport || []}
                      onChange={(list) =>
                        handleCheckboxChange("fixingReport", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Live chat"
                    name="liveChat"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("liveChat")}
                      checked={isAllChecked("liveChat")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.liveChat || []}
                      onChange={(list) =>
                        handleCheckboxChange("liveChat", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
            <Row gutter={10} style={{ marginTop: 10 }}>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Document form"
                    name="documentForm"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("documentForm")}
                      checked={isAllChecked("documentForm")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.documentForm || []}
                      onChange={(list) =>
                        handleCheckboxChange("documentForm", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Home automation"
                    name="homeAutomation"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("homeAutomation")}
                      checked={isAllChecked("homeAutomation")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.homeAutomation || []}
                      onChange={(list) =>
                        handleCheckboxChange("homeAutomation", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Maintenance guide"
                    name="maintenanceGuide"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("maintenanceGuide")}
                      checked={isAllChecked("maintenanceGuide")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.maintenanceGuide || []}
                      onChange={(list) =>
                        handleCheckboxChange("maintenanceGuide", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
            <Row gutter={10} style={{ marginTop: 10 }}>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Events"
                    name="event"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("event")}
                      checked={isAllChecked("event")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.event || []}
                      onChange={(list) => handleCheckboxChange("event", list)}
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="Left home with guard"
                    name="leftHomeWithGuard"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("leftHomeWithGuard")}
                      checked={isAllChecked("leftHomeWithGuard")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.leftHomeWithGuard || []}
                      onChange={(list) =>
                        handleCheckboxChange("leftHomeWithGuard", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={8}>
                <Card variant="borderless" hoverable={true} size="small">
                  <Form.Item
                    label="News and announcement"
                    name="newsAndAnnouncement"
                    className="custom-form-label"
                  >
                    <Checkbox
                      onChange={onCheckAllChange("newsAndAnnouncement")}
                      checked={isAllChecked("newsAndAnnouncement")}
                    >
                      Select All
                    </Checkbox>
                    <CheckboxGroup
                      options={checkBoxOptions}
                      value={permissionsSuperAdmin.newsAndAnnouncement || []}
                      onChange={(list) =>
                        handleCheckboxChange("newsAndAnnouncement", list)
                      }
                      className="checkboxGroup"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
            <Row style={{ marginTop: 24 }}>
              <Col
                span={24}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Form.Item>
                  <Button
                    type="text"
                    size="large"
                    onClick={onReset}
                    className="reset-button"
                  >
                    Reset
                  </Button>
                  <SmallButton
                    message="Save"
                    form={form}
                    className="save-button"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      ),
    },
  ];
  return (
    <>
      <Header title="Juristic team permission" />
      <Card
        title="Permissions"
        className="custom-card-title"
        variant="outlined"
      >
        <Tabs
          tabBarGutter={2}
          animated={true}
          tabPosition="left"
          items={items.map((item) => {
            return {
              label: item.label,
              key: item.key,
              children: item.children,
            };
          })}
          className="custom-tabs"
        />
      </Card>
    </>
  );
};

export default JuristicTeamPermission;
