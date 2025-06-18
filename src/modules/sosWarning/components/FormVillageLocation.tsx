import { Form, Input, Select, Button } from "antd";

interface FormVillageLocationProps {
    onCancel?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const FormVillageLocation = ({ onCancel }: FormVillageLocationProps) => {
    return (
        <div className=" mx-auto bg-[#F6F6F6] rounded-2xl p-6">
            <div className="font-semibold text-xl text-center mb-6">
                Pin the Condo location on the map
            </div>
            <Form layout="vertical"
                 initialValues={{
                    address: "999/765",
                    name: "Nattapon Seejan",
                    tel1: "0985574483",
                    tel2: "0985574484",
                    tel3: "0985574485",
                    latitude: "50.5040806515",
                    longitude: "-50.5040806515"
                  }}
            >
                <Form.Item label={<span className="text-[#002C55]">Address</span>} name="address" required>
                    <Select >
                        <Select.Option value="999/765">999/765</Select.Option>
                        <Select.Option value="888/123">888/123</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Name</span>} name="name" required>
                    <Input  />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 1</span>} name="tel1" required>
                    <Input  />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 2</span>} name="tel2">
                    <Input  />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 3</span>} name="tel3">
                    <Input  />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Latitude</span>} name="latitude">
                    <Input  disabled />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Longitude</span>} name="longitude">
                    <Input  disabled />
                </Form.Item>
                <Form.Item>
                    <>
                        <Button type="primary" htmlType="submit" block style={{ marginBottom: 12 }}>
                            Confirm
                        </Button>
                        <Button type="default" block onClick={onCancel}>
                            Cancel
                        </Button>
                    </>
                </Form.Item>
            </Form>
        </div>
    );
}

export default FormVillageLocation;