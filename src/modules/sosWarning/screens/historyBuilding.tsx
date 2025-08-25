import { useEffect, useState , useMemo } from "react";
import Header from "../../../components/templates/Header";
import {
    Row,
    Col,
    DatePicker,
    DatePickerProps,
    Input,
    Button,
    Tabs,
    Table,
    Form,
    Space,
    Dropdown,
    message,
  } from "antd";
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from "antd/es/table";
import { historyBuildingData } from "../dummyData/HistoryBuilding";
import { usePagination } from "../../../utils/hooks/usePagination";
import IconStep from "../../../assets/icons/IconStep.png";
import CardDashboard from "../components/historyBuilding/cardDashboard";
import { getEvent , getEventSummary } from "../service/api/SOSwarning";
import { getSosWarningById, receiveCast } from "../service/api/SOSwarning";
import type { TabsProps } from "antd";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import { useNavigate } from "react-router-dom";
const HistoryBuilding = () => {
    const dispatch = useDispatch<Dispatch>();
    const navigate = useNavigate();
    const { curPage, perPage, pageSizeOptions, setCurPage, setPerPage } = usePagination();

    const [eventStore, setEventStore] = useState<any[]>([])
    const [curentPage, setCurentPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const [step, setStep] = useState<string>('');
    const [roomAddress, setRoomAddress] = useState<string>('');
    const [residentOwner, setResidentOwner] = useState<string>('');
    const [receiver, setReceiver] = useState<string>('');
    const [contact, setContact] = useState<string>('');

    const [searchText, setSearchText] = useState<string>('');
    const [searchedColumn, setSearchedColumn] = useState<string>('');
    const [ServiceCenterList, setServiceCenterStatusList] = useState<
    TabsProps["items"]
  >([
    {
      label: "ทั้งหมด",
      key: "",
    },
    {
        label: "รอดำเนินการ",
        key: "0",
    },
    {
        label: "ดำเนินการสำเร็จ",
        key: "4",
    }
  ]);
    
    const [summaryStore, setSummaryStore] = useState<any[]>([])
    const [paginationConfig, setPaginationConfig] = useState({
        defaultPageSize: pageSizeOptions[0],
        pageSizeOptions: pageSizeOptions,
        current: curPage,
        showSizeChanger: true,
        total: 100,
        ...pageSizeOptions,
    });
    


    const loadFilter = async(dataFilter:any)=>{
        let filterObject ={
            curPage: dataFilter.curPage  || null,
            perPage: dataFilter.perPage || null,
            step: step || null,
            roomAddress: roomAddress || null,
            residentOwner: residentOwner || null,
            receiver: receiver || null,
            contact: contact || null,
        }
        let response = await getEvent(filterObject)
        if(response.status){
            setPaginationConfig({
                ...paginationConfig,
                total: response.result.total,
                current: dataFilter.curPage || curPage
            })
            let obj = response.result.data.map((item:any,index:number)=>{
                // แปลงวันที่และเวลาแยกกัน
                const formatThaiDateTime = (dateString: string) => {
                    if (!dateString) return { date: '', time: '' };
                    const dateObj = new Date(dateString);
                    const date = dateObj.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3');
                    const time = dateObj.toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    return { date, time };
                };
                let coverDateTime = formatThaiDateTime(item?.createdAt || new Date().toISOString());
                let receiveDateTime = formatThaiDateTime(item?.received?.createdAt || new Date().toISOString());

                let myHome = (item?.unit?.myHomes || []).find((item:any)=>item.role.name === 'Resident owner')
                let nameOwner = myHome?.user?.givenName || '-'
                let nameStaff = item?.received?.user?.givenName || '-'
                let contractStaff = item?.unit.myHomes.find((item:any)=>{
                    if(item.user.contact) return true
                    else if(item.user.contact2) return true
                    else if(item.user.contact3) return true
                    else return false
                })

                if(contractStaff) contractStaff = contractStaff.user.contact || '-'
                else if(contractStaff) contractStaff = contractStaff.user.contact2 || '-'
                else if(contractStaff) contractStaff = contractStaff.user.contact3 || '-'
                else contractStaff = '-'



                let eventType = item?.eventType?.nameCode || '-'
                const strEventType = eventType?.split('_');
                if(strEventType.length > 1){eventType = strEventType[0];}
                else {eventType = null}

                return {
                    key: index + 1, // เพิ่ม key สำหรับ sort
                    sortOrder: (curPage - 1) * perPage + index + 1, // ลำดับที่แท้จริงตาม pagination
                    Address: item?.unit?.roomAddress || '-',
                    ReportTime: coverDateTime || { date: '-', time: '-' },
                    ReceiveTime: receiveDateTime || { date: '-', time: '-' },
                    EventType: item?.eventType?.nameTh || '-',
                    NameOwner: nameOwner || '-',
                    NameStaff: nameStaff || '-',
                    ContractStaff: contractStaff || '-',
                    EventStep : item?.step?.toString() || '-',
                    EventTypeStatus: eventType || '-',
                    id:item.id
                }
            })
            setEventStore(obj)
        }

        let responseSummary = await getEventSummary()
        if(responseSummary.status){
            setSummaryStore(responseSummary.result.eventCase)
        }
    }

    const onChangeTable = (
            pagination: any,
            filters: any,
            sorter: any,
            extra: any
    )=>{
        // อัปเดต state สำหรับ pagination (useEffect จะ handle การเรียก loadFilter)
        setCurPage(pagination.current);
        setPerPage(pagination.pageSize);

        // อัปเดต pagination config
        setPaginationConfig({
            ...paginationConfig,
            current: pagination.current,
            defaultPageSize: pagination.pageSize
        });
    }

    const statusEvent = (typeEvent: string) => {
        let objColorEventType = {
            emergency: '#DC2A31',
            device: '#F28F1E'
        }
        return objColorEventType[typeEvent as keyof typeof objColorEventType] || '#000000'
    }

    useEffect(()=>{
        let dataFilter ={
            curPage,
            perPage,
            step,
            roomAddress,
            residentOwner,
            receiver,
            contact,
            eventType: step
        }
        loadFilter(dataFilter)
    },[step, roomAddress, residentOwner, receiver, contact, curPage, perPage])

    const changeTab = (key: string) => {
        setStep(key)
    }

    // ฟังก์ชันสำหรับ search
    const getColumnSearchProps = (dataIndex: string, title: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: any) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 'bold' }}>ค้นหา {title}</span>
                    <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={close}
                        style={{ border: 'none', padding: 0 }}
                    />
                </div>
                <Input
                    placeholder={`ค้นหา ${title}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex' }}>
                        <Button
                            type="primary"
                            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: '100%' }}
                        >
                            ค้นหา
                        </Button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            onClick={() => handleResetOnly(setSelectedKeys)}
                            size="small"
                            style={{ flex: 1 }}
                        >
                            รีเซ็ต
                        </Button>
                        <Button
                            onClick={close}
                            size="small"
                            style={{ flex: 1 }}
                        >
                            ปิด
                        </Button>
                        <Button
                            onClick={() => handleCloseAndClearFilter(clearFilters, confirm, close, dataIndex)}
                            size="small"
                            style={{ flex: 1 }}
                            danger
                        >
                            ยกเลิก
                        </Button>
                    </div>
                </div>
            </div>
        ),
        filterIcon: (filtered: boolean) => {
            // ตรวจสอบว่ามีการ search ใน field นี้หรือไม่
            let hasActiveSearch = false;
            switch(dataIndex) {
                case 'Address':
                    hasActiveSearch = !!roomAddress;
                    break;
                case 'NameOwner':
                    hasActiveSearch = !!residentOwner;
                    break;
                case 'NameStaff':
                    hasActiveSearch = !!receiver;
                    break;
                case 'ContractStaff':
                    hasActiveSearch = !!contact;
                    break;
                default:
                    hasActiveSearch = false;
            }
            
            return (
                <SearchOutlined 
                    style={{ 
                        color: hasActiveSearch ? '#1890ff' : undefined,
                        fontWeight: hasActiveSearch ? 'bold' : 'normal',
                        fontSize: '16px'
                    }} 
                />
            );
        },
        // ลบ onFilter เพราะใช้ API filter แทน
        onFilterDropdownOpenChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => {
                    // focus ใน input เมื่อเปิด dropdown
                }, 100);
            }
        },
    });

    const handleSearch = (selectedKeys: any, confirm: any, dataIndex: string) => {
        // ไม่เรียก confirm() เพื่อไม่ให้ปิด popup
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);

        // reset เป็นหน้าแรกเมื่อ search
        setCurPage(1);

        // อัปเดต state ตาม field ที่ search (useEffect จะ handle การเรียก loadFilter)
        const searchValue = selectedKeys[0] || '';
        switch(dataIndex) {
            case 'Address':
                setRoomAddress(searchValue);
                break;
            case 'NameOwner':
                setResidentOwner(searchValue);
                break;
            case 'NameStaff':
                setReceiver(searchValue);
                break;
            case 'ContractStaff':
                setContact(searchValue);
                break;
            default:
                break;
        }
    };

    const handleReset = (clearFilters: any, confirm: any) => {
        clearFilters();
        setSearchText('');
        confirm();
    };

    const handleResetOnly = (setSelectedKeys: any) => {
        setSelectedKeys([]);
        setSearchText('');
    };

    const handleCloseAndClearFilter = (clearFilters: any, confirm: any, close: any, dataIndex: string) => {
        clearFilters();
        setSearchText('');
        
        // reset เป็นหน้าแรก
        setCurPage(1);
        
        // ล้าง state ตาม field ที่ปิด (useEffect จะ handle การเรียก loadFilter)
        switch(dataIndex) {
            case 'Address':
                setRoomAddress('');
                break;
            case 'NameOwner':
                setResidentOwner('');
                break;
            case 'NameStaff':
                setReceiver('');
                break;
            case 'ContractStaff':
                setContact('');
                break;
            default:
                break;
        }

        confirm();
        close();
    };

    const handleReceiveCast = async (eventStore: any) => {
        let { id, EventStep , EventTypeStatus } = eventStore
        let data = await getSosWarningById(id)
        data.result = {
            ...data.result,
            type: EventTypeStatus
        }


        if(EventStep >= 1){
            await dispatch.sosWarning.setDataEmergencyDetail(data.result)
            await dispatch.sosWarning.setStatusCaseReceiveCast(true)
            navigate('/dashboard/security-alarm') 
            return
        }

        
        if(data.status){
            let dataReceiveCast = await receiveCast(id)
            if(dataReceiveCast.status){
                dispatch.sosWarning.setStatusCaseReceiveCast(true)
                let step = dataReceiveCast?.result?.step
                data.result.sosEventInfo.step  = step
                data.result.sosEventInfo.isCompleted = dataReceiveCast?.result?.is_completed
                data.result.sosEventInfo.event_help_id = dataReceiveCast?.result?.event_help_id
                await dispatch.sosWarning.setStatusCaseReceiveCast(true)
                await dispatch.sosWarning.setDataEmergencyDetail(data.result)
                navigate('/dashboard/security-alarm') // ปิดการ navigate เพื่อไม่ให้เปลี่ยนหน้า
                // setStatusAcknowledge(true)
            }
            else {
                message.error(dataReceiveCast.message)
            }
        }
        else {  
            message.error(data?.message || 'ไม่สามารถดำเนินการได้')
        }
    }

    // สาเหตุที่ใช้ useMemo แล้ว error เพราะ useMemo รับ function ที่ไม่ต้องมี argument (parameter) ใด ๆ
    // แต่โค้ดนี้เขียน useMemo((step: string) => {...}, [eventStore]) ซึ่งผิดรูปแบบ
    // useMemo ควรใช้สำหรับ memoize ค่า ไม่ใช่ function ที่รับ argument
    // ถ้าต้องการ map สีของ step ให้ใช้ function ปกติแบบนี้แทน

    const getEventStepColor = (step: '0' | '1' | '2' | '3' | '4') => {
        const obj: Record<'0' | '1' | '2' | '3' | '4', string> = {
            '0': '#F28F1E',
            '1': '#DC2A31',
            '2': '#F28F1E',
            '3': '#F28F1E',
            '4': '#01A171'
        };
        return obj[step] || '#000000';
    };

    const columns: ColumnsType<any> = [
        {
            title: "step work",
            dataIndex: "stepWork",
            align: "center",
            width: 120,
            render: (_, record) => (
                <Row>
                  <Col span={24} className="!flex !justify-center !items-center !mb-0">
                    <img src={IconStep} 
                    onClick={()=>handleReceiveCast(record)}
                    alt="IconStep" className="cursor-pointer" />
                  </Col>
                </Row>
            ),
        },
        {
          title: "No",
          dataIndex: "key",
          align: "center",
          width: 120,
          sorter: (a, b) => {
            // Sort ตามลำดับที่แท้จริง
            return a.sortOrder - b.sortOrder;
          },
          sortDirections: ['ascend', 'descend'],
          render: (_, record, index) => {
            // ใช้ sortOrder จาก record แทนการคำนวณจาก index
            return (
              <Row>
                <Col span={24} className="!flex !justify-center !items-center !mb-0">
                  <span className="font-medium text-gray-700">{record.sortOrder}</span>
                </Col>
              </Row>
            );
          },
        },    
        {
          title: "Address",
          dataIndex: "Address",
          align: "center",
          width: 200,
          ...getColumnSearchProps("Address", "Address"),
        },
        {
          title: "Report Time",
          dataIndex: "ReportTime",
          align: "center",
          width: 180,
          render: (_, record) => (
            <Row>
              <Col span={24} className="!flex !flex-col !justify-center !items-center !mb-0">
                <div className="text-md  text-gray-800">
                  {record.ReportTime?.date || '-'}
                </div>
                <div className="text-md  text-gray-600">
                  {record.ReportTime?.time || '-'}
                </div>
              </Col>
            </Row>
          ),
        },
        {
          title: "Receive Time",
          dataIndex: "ReceiveTime",
          align: "center",
          width: 180,
          render: (_, record) => (
            <Row>
              <Col span={24} className="!flex !flex-col !justify-center !items-center !mb-0">
                <div className="text-md text-gray-800">
                  {record.ReceiveTime?.date || '-'}
                </div>
                <div className="text-md text-gray-600">
                  {record.ReceiveTime?.time || '-'}
                </div>
              </Col>
            </Row>
          ),
        },
        {
          title: "Event Type",
          dataIndex: "EventType",
          align: "center",
          width: 180,
            render: (_, record) => (
                <Row>
                    <Col span={24} className="!flex !justify-center !items-center !mb-0">
                        <div 
                        className="font-bold" style={{color:statusEvent(record?.EventTypeStatus || '')}}>
                            {record.EventType}
                            {/* {record?.EventTypeStatus} */}
                        </div>
                    </Col>
                </Row>
            ),
        },
        {
          title: "Name Owner",
          align: "center",
          dataIndex: "NameOwner",
          width: 200,
          ...getColumnSearchProps("NameOwner", "Name Owner"),
        },
        {
          title: "Name Staff",
          align: "center",
          dataIndex: "NameStaff",
          width: 150,
          ...getColumnSearchProps("NameStaff", "Name Staff"),
        },

        {
            title: "Contract Staff",
            align: "center",
            dataIndex: "ContractStaff",
            width: 180,
            ...getColumnSearchProps("ContractStaff", "Contract Staff"),
          },

        {
            title: "Event Step",
            align: "center",
            dataIndex: "EventStep",
            width: 150,
            render: (_, record) => (
                <Row>
                  <Col span={24} className="!flex !justify-center !items-center !mb-0">
                    <span className={`font-bold`} style={{color:getEventStepColor(record.EventStep)}}>
                        Step {record.EventStep}
                    </span>
                  </Col>
                </Row>
            ),
        },
      ];
    
    
    return (
        <div>
            <div className="flex justify-between items-center !mb-5">
                <Header title="History Building" className="!mb-0" />
            </div>
            <div className="mb-6">
                <CardDashboard setStep={setStep} summaryStore={summaryStore} />
            </div>
            <Row>
                <Col span={24}>
                    <Tabs
                    defaultActiveKey=""
                    items={ServiceCenterList}
                    onChange={changeTab}
                    />
                    <Table 
                        columns={columns}
                        pagination={paginationConfig}
                        dataSource={eventStore}
                        loading={false}
                        onChange={onChangeTable}
                        scroll={{ 
                            y: 500,  // กำหนดความสูงของตาราง
                            x: 'max-content' // ให้ scroll แนวนอนได้ถ้าเนื้อหากว้างเกินไป
                        }}
                        sticky={{
                            offsetHeader: 0  // ให้ header ติดด้านบนเมื่อ scroll
                        }}
                        components={{
                            header: {
                                cell: (props: any) => (
                                    <th {...props} style={{ 
                                        ...props.style, 
                                        whiteSpace: 'nowrap',
                                        overflow: 'visible',
                                        textOverflow: 'ellipsis',
                                        height: '50px',
                                        lineHeight: '1.2',
                                        padding: '8px 40px 8px 16px',
                                        verticalAlign: 'middle',
                                        position: 'relative'
                                    }} />
                                )
                            },
                            body: {
                                cell: (props: any) => (
                                    <td {...props} style={{ 
                                        ...props.style, 
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }} />
                                )
                            }
                        }}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default HistoryBuilding;