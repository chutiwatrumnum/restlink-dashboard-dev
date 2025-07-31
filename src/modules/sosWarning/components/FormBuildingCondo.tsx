import { Form, Input, Select, Button } from "antd";

interface FormBuildingCondoProps {
    onCancel?: (e: React.MouseEvent<HTMLDivElement>) => void;
    createdItem?: {
        type: 'marker' | 'zone';
        data: any;
    } | null;
}

const FormVillageLocation = ({ onCancel, createdItem }: FormBuildingCondoProps) => {
    const handleFormClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // ป้องกันการปิด form เมื่อกดที่ form
    };

    return (
        <div 
            className="w-full bg-[#F6F6F6] min-h-screen p-6 mt-4 lg:mt-0"
            onClick={handleFormClick}
        >
            <div className="font-semibold text-xl text-center mb-6">
                Pin the condo location on the map
            </div>
            {createdItem && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md">
                    <div className="text-sm text-green-800">
                        ✅ {createdItem.data.id ? 
                            `Editing ${createdItem.type === 'marker' ? 'Marker' : 'Zone'} "${createdItem.data.name}"` :
                            `Created ${createdItem.type === 'marker' ? 'Marker' : 'Zone'} "${createdItem.data.name}" successfully`
                        }
                    </div>
                </div>
            )}
            <Form layout="vertical"
            >
                <Form.Item label={<span className="text-[#002C55]">Address</span>} name="address">
                    <Select
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)
                                ?.toLowerCase()
                                ?.includes(input.toLowerCase()) ?? false
                        }
                        placeholder="Search or select address"
                    >

                    </Select>
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Name</span>} name="name">
                    <Input  />
                </Form.Item>
                <Form.Item label={<span className="text-[#002C55]">Tel 1</span>} name="tel1">
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