import { useState, useEffect, useRef } from "react";
import { Button, Row, Col, message, Input, Select, Form } from "antd";
import { useNavigate } from "react-router-dom";
import homeAdd from "../../../../assets/images/setupProject/HomeAdd.png";
import iconUpdate from "../../../../assets/images/setupProject/IconEdit.png";
import iconRemove from "../../../../assets/images/setupProject/IconDelete.png";


interface HouseType {
    id: number;
    houseName: string;
    numberOfFloor: number;
    approximateSize: number;
}

interface ProjectData {
    projectName: string;
    developer: string;
    projectManager: string;
    contactNo: string;
    location: string;
}

const CardAddType = ({ onBack }: { onBack: string }) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [statusDisplay, setStatusDisplay] = useState(true);
    const [total, setTotal] = useState(0);
    const [houseTypes, setHouseTypes] = useState<HouseType[]>([]);
    const [formType, setFormType] = useState({
        houseName: "",
        numberOfFloor: 0,
        approximateSize: ""
    });

    const handleAddType = async () => {
        try {
            const values = await form.validateFields();
            const newType: HouseType = {
                id: Date.now(),
                houseName: formType.houseName,
                numberOfFloor: formType.numberOfFloor,
                approximateSize: parseFloat(formType.approximateSize)
            };

            setHouseTypes([...houseTypes, newType]);
            setTotal(houseTypes.length + 1);

            // Reset form
            form.resetFields();
            setFormType({
                houseName: "",
                numberOfFloor: 0,
                approximateSize: ""
            });
            setStatusDisplay(false);
            // message.success('House type added successfully');
        } catch (errorInfo) {
            console.log('Validation failed:', errorInfo);
        }
    };

    const handleRemoveType = (id: number) => {
        const updatedTypes = houseTypes.filter(type => type.id !== id);
        setHouseTypes(updatedTypes);
        setTotal(updatedTypes.length);
        message.success('House type removed');
    };

    const floorOptions = Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}`
    }));

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
                <div className="h-full overflow-y-auto p-6">
                    <div className=" bg-gray-50 border-1 border-gray-300 rounded-lg p-4">
                        <div className="text-xl text-[#002C55] mb-2   ">Total : {total}</div>

                        {/* House Types List */}
                        {houseTypes.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {houseTypes.map((type, index) => (
                                    <div key={type.id} className="bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="bg-[#ECF4FF] flex items-center justify-start rounded-tl-lg rounded-tr-lg px-4 py-2">
                                                <div className="font-semibold text-gray-800 mr-auto">Type {index + 1} </div>
                                                <img onClick={() => handleRemoveType(type.id)} src={iconUpdate} alt="iconUpdate" className="w-4 h-4 mr-2 cursor-pointer" />
                                                <img onClick={() => handleRemoveType(type.id)} src={iconRemove} alt="iconRemove" className="w-4 h-4 cursor-pointer" />
                                            </div>
                                            <div
                                                className="bg-white rounded-bl-lg rounded-br-lg px-4 py-2 border-1 border-gray-300"
                                                style={{ borderTop: "none" }}
                                            > 
                                            <Row>
                                                <Col span={12}>
                                                    <p className="flex justify-start !text-[#002C55] text-lg  ">
                                                        House type name
                                                    </p>
                                                </Col>

                                                <Col span={12}>
                                                    <p className="flex justify-end  !text-[#002C55] text-lg font-semibold">
                                                        {type.houseName}
                                                    </p>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col span={12}>
                                                    <p className="flex justify-start text-lg  !text-[#002C55]">
                                                        Number of floor
                                                    </p>
                                                </Col>

                                                <Col span={12}>
                                                    <p className="flex justify-end  !text-[#002C55] text-lg font-semibold">
                                                        {type.numberOfFloor} floor{type.numberOfFloor > 1 ? 's' : ''}
                                                    </p>
                                                </Col>
                                            </Row>


                                            <Row>
                                                <Col span={12}>
                                                    <p className="flex justify-start text-lg  !text-[#002C55]">
                                                        Approximate size (sq.m.)
                                                    </p>
                                                </Col>

                                                <Col span={12}>
                                                    <p className="flex justify-end  !text-[#002C55] text-lg font-semibold">
                                                        {type.approximateSize} sq.m.
                                                    </p>
                                                </Col>
                                            </Row>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}

                        {
                            !statusDisplay && (
                                <div className="border-1 border-dashed border-[#4995FF] rounded-lg flex flex-col justify-center items-center p-10 cursor-pointer"
                                    onClick={() => setStatusDisplay(true)}>
                                    <img src={homeAdd} alt="homeAdd" />
                                    <div className="text-lg  text-[#4995FF]">Add house type</div>
                                </div>
                            )
                        }


                        {/* Add Type Form */}
                        {statusDisplay && (
                            <div className="bg-blue-50 rounded-2xl pt-4  mb-6">
                                <h3 className="text-lg font-semibold text-[#002C55] mb-4 bg-['#eff6ff'] px-4">Type {houseTypes.length + 1}</h3>

                                <Form
                                    form={form}
                                    layout="vertical"
                                    initialValues={{ numberOfFloor: 1 }}
                                    className="space-y-4 bg-white"
                                >
                                    <div className="px-4 border-l border-r border-b border-gray-200 rounded-bl-lg rounded-br-lg  ">
                                        {/* House type name */}
                                        <div className="mt-4"></div>
                                        <Form.Item
                                            name="houseName"
                                            label=" House type name"
                                            rules={[{ required: true, message: 'Please enter house type name' }]}
                                            className="py-4"

                                        >
                                            <Input
                                                onChange={(e) => setFormType({ ...formType, houseName: e.target.value })}
                                                placeholder="Single house"
                                                className="rounded-lg"
                                            />
                                        </Form.Item>

                                        {/* Number of floor */}
                                        <Form.Item
                                            name="numberOfFloor"
                                            label="Number of floor"
                                            rules={[{ required: true, message: 'Please select number of floor' }]}
                                            className="mb-4"
                                        >
                                            <Select
                                                className="w-full"
                                                options={floorOptions}
                                                onChange={(value) => setFormType({ ...formType, numberOfFloor: value })}
                                            />
                                        </Form.Item>

                                        {/* Approximate size */}
                                        <Form.Item
                                            name="approximateSize"
                                            label="Approximate size (sq.m.)"
                                            className="mb-4"
                                        >
                                            <Input
                                                placeholder="120"
                                                type="number"
                                                className="rounded-lg"
                                                onChange={(e) => setFormType({ ...formType, approximateSize: e.target.value })}
                                            />
                                        </Form.Item>

                                        {/* Add Button */}
                                        <div className="flex justify-end mb-4">
                                            <Button
                                                onClick={handleAddType}
                                                className="bg-blue-500 hover:bg-blue-600 border-blue-500 rounded-lg px-6 w-[100px] "
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </div>
                        )}


                    </div>


                </div>
            </div>

            <div className="flex justify-end mt-5">
                <Button
                    type="primary"
                    size="large"
                    className="px-8 py-2 rounded-full w-[150px]"
                    onClick={() => navigate(onBack)}
                >
                    Continue
                </Button>
            </div>
        </>
    )
}

export default CardAddType;