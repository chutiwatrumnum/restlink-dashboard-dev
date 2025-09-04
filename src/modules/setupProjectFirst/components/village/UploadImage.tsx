import { useState, useRef } from "react";
import { Button,  message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import IconUpload from "../../../../assets/images/setupProject/Icon-Upload.png";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "../../../../stores";
import * as XLSX from 'xlsx';
import FailedModal from "../../../../components/common/FailedModal";
const UploadImage = ({ onNext, status = 'image' }: { onNext: string, status?: string }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch<Dispatch>();

    // Redux state
    const {
        projectData,
        uploadedFileName: reduxExcelFileName,
        isExcelUploaded,
        uploadedImage: reduxUploadedImage,
        uploadedImageFileName: reduxImageFileName,
        isImageUploaded,
    } = useSelector((state: RootState) => state.setupProject);

    // Local state for UI only
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use Redux state for both Excel and Image
    const uploadedImage = status === 'excel' ? null : reduxUploadedImage;
    const uploadedFileName = status === 'excel' ? reduxExcelFileName : reduxImageFileName;

    const handleRemoveImage = () => {
        if (status === 'excel') {
            dispatch.setupProject.clearExcelData();
        } else {
            dispatch.setupProject.clearImageData();
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };
    const handleFileSelect = (file: File) => {
        if (!validateFile(file)) return;

        if (status === 'excel') {
            const isCsvFile = file.type === 'text/csv' || file.name.endsWith('.csv');

            if (isCsvFile) {
                // Handle CSV file
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const csvText = e.target?.result as string;

                        // Parse CSV using xlsx library
                        const workbook = XLSX.read(csvText, { type: 'string' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                        // กรองข้อมูลที่มีค่าเท่านั้น
                        const filteredData = jsonData.filter((row: any) => {
                            // ตรวจสอบว่า row มีข้อมูลจริงหรือไม่
                            if (!Array.isArray(row)) return false;
                            // ตรวจสอบว่ามีค่าที่ไม่ใช่ null, undefined, หรือ empty string
                            return row.some(cell => cell !== null && cell !== undefined && cell !== '');
                        });

                        const sheetsData = [{
                            sheetName: file.name.replace('.csv', ''),
                            sheetIndex: 0,
                            data: filteredData,
                            rowCount: filteredData.length,
                            columnCount: filteredData.length > 0 ? Math.max(...filteredData.map((row: any) => Array.isArray(row) ? row.length : 0)) : 0
                        }];

                        dispatch.setupProject.uploadExcelFile({
                            data: sheetsData as any,
                            fileName: file.name
                        });

                        message.success(`CSV file loaded successfully! Found ${sheetsData[0].rowCount} rows`);
                    } catch (error) {
                        console.error('Error reading CSV file:', error);
                        message.error('Error reading CSV file');
                    }
                };
                reader.readAsText(file);
            } else {
                // Handle Excel file
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        let projectType = projectData?.projectType?.nameCode || '';
                        const strType = projectType.split('_');
                        projectType = strType[strType.length - 1];
                        const data = new Uint8Array(e.target?.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetsData: any[] = [];
                        if (projectType === 'condo') {
                            if (workbook.SheetNames.length !== 2) {
                                if (workbook.SheetNames[0] === 'Condo' && workbook.SheetNames[1] === 'Basement') {
                                    message.error('Excel file is not valid');
                                    return;
                                }
                            }
                        }

                        // อ่านข้อมูลจากแต่ละ sheet
                        workbook.SheetNames.forEach((sheetName, index) => {
                            const worksheet = workbook.Sheets[sheetName];
                            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                            // กรองข้อมูลที่มีค่าเท่านั้น
                            const filteredData = jsonData.filter((row: any) => {
                                // ตรวจสอบว่า row มีข้อมูลจริงหรือไม่
                                if (!Array.isArray(row)) return false;
                                // ตรวจสอบว่ามีค่าที่ไม่ใช่ null, undefined, หรือ empty string
                                return row.some(cell => cell !== null && cell !== undefined && cell !== '');
                            });
                            const sheetObject = {
                                sheetName: sheetName,
                                sheetIndex: index,
                                data: filteredData,
                                rowCount: filteredData.length,
                                columnCount: filteredData.length > 0 ? Math.max(...filteredData.map((row: any) => Array.isArray(row) ? row.length : 0)) : 0
                            };
                            sheetsData.push(sheetObject);
                        });

                        
                        
                        if(projectType === 'village'){
                            console.log(workbook.SheetNames,'workbook.SheetNames')
                            if(workbook.SheetNames[0]!='village'){
                                FailedModal("Excel file is not valid (Village)", 1200)
                                return;
                            }
                            let condoCheck = sheetsData[0].data[0] || []
                            let dataCheck = ["Address","House type","Number of floor","Size (sq.m.)"]
                            let checkCondo = !condoCheck.every((item: any) => dataCheck.includes(item))
                            if(checkCondo){
                                FailedModal("Excel file is not valid (Village)", 1200)
                                return;
                            }
                        }
                        // แปลงข้อมูล sheetsData ของแต่ละ sheet เป็น key-object โดย index ที่ 0 เป็น key แล้วที่เหลือเป็น value
                        // แปลงข้อมูล sheetsData ของแต่ละ sheet เป็น object ที่ key คือชื่อ sheet
                        let condoCheck = sheetsData[0].data[0] || []
                        let dataCheck = 
                        ['Building name', 'Floor', 'Floor name', 'Unit no.','Address', 'Room type', 'Size (sq.m.)']
                        let checkCondo = !condoCheck.every((item: any) => dataCheck.includes(item))
                        
                        if (projectType === 'condo') {
                            if (checkCondo) {
                                FailedModal("Excel file is not valid (Condo)", 1200)
                                return;
                            }
                            let basementCheck = sheetsData[1].data[0] || []
                            let dataCheckBasement = ['Building name', 'Basement Floor', 'Basement name']
                            let checkBasement = !basementCheck.every((item: any) => dataCheckBasement.includes(item))
                            if (checkBasement) {
                                FailedModal("Excel file is not valid (Basement)", 1200)
                                return;
                            }
                        }

                        const sheetsDataAsObjects = sheetsData.reduce((acc: any, sheet: any) => {
                            const [header, ...rows] = sheet.data;
                            if (!header || !Array.isArray(header)) return acc;

                            // กรองเฉพาะ rows ที่มีข้อมูลจริง
                            const filteredRows = rows.filter((row: any[]) => {
                                return row && Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '');
                            });

                            // สร้าง array ของ object โดยใช้ header เป็น key
                            const rowObjects = filteredRows.map((row: any[]) => {
                                const obj: any = {};
                                header.forEach((key: string, idx: number) => {
                                    const value = row[idx];
                                    if (value !== null && value !== undefined && value !== '') {
                                        obj[key] = value;
                                    }
                                });
                                return obj;
                            });

                            acc[sheet.sheetName] = rowObjects;
                            return acc;
                        }, {});
                        dispatch.setupProject.uploadExcelFile({
                            data: sheetsDataAsObjects,
                            fileName: file.name
                        });
                        message.success(`Excel file loaded successfully! Found ${sheetsData.length} sheet(s)`);
                    } catch (error) {
                        console.error('Error reading Excel file:', error);
                        message.error('Error reading Excel file');
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        } else {
            // Handle image file (original logic)
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                dispatch.setupProject.uploadImageFile({
                    imageData: result,
                    fileName: file.name
                });
                message.success('Upload successful');
            };
            reader.readAsDataURL(file);
            dispatch.setupProject.setImageFileObject(file);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const validateFile = (file: File) => {
        if (status === 'excel') {
            // Validate Excel and CSV files
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.xls');
            const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');

            if (!isExcel && !isCsv) {
                message.error('You can only upload Excel files (.xlsx, .xls) or CSV files (.csv)!');
                return false;
            }
        } else {
            // Validate image file
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return false;
            }
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('File must smaller than 5MB!');
            return false;
        }
        return true;
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const isDisabled = status === 'excel' ? !isExcelUploaded : !isImageUploaded;

    const handleContinue = () => {
        if (isDisabled || isSubmitting) return;
        setIsSubmitting(true);
        navigate(onNext);
    };


    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden"
                style={{ height: 'calc(100vh - 220px)' }}>
                <div className="h-full p-6">
                    {((status === 'image' && isImageUploaded) || (status === 'excel' && isExcelUploaded)) ? (
                        <div className="h-full flex flex-col">
                            {/* Uploaded File Display */}
                            <div className="flex-1 border-2 border-solid border-gray-200 rounded-xl overflow-hidden mb-4 px-4 py-2">
                                {status === 'excel' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                        <div className="text-center">
                                            {/* Excel Logo */}
                                            <div className="mb-6">
                                                <svg className="w-16 h-16 mx-auto text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                                    <path d="M12.5,15L10.5,12L12.5,9H11L9.5,11.5L8,9H6.5L8.5,12L6.5,15H8L9.5,12.5L11,15H12.5Z" fill="white" />
                                                </svg>
                                            </div>

                                            {/* Success Message */}
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                Excel File Uploaded Successfully!
                                            </h3>

                                            {/* File Name */}
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-w-md">
                                                <div className="flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700 truncate">
                                                        {uploadedFileName}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={uploadedImage || ''}
                                        alt="Uploaded property plan"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>

                            {/* File Info and Delete Button */}
                            <div className="flex items-center justify-between  p-3 rounded-lg">
                                <div className="flex items-center flex-1">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700 truncate">
                                        {uploadedFileName}
                                    </span>
                                </div>
                                <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={handleRemoveImage}
                                    className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center"
                                    danger
                                />
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`h-full border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${isDragOver
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-400'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={openFileDialog}
                        >
                            <div className="flex flex-col items-center justify-center h-full p-8 px-5">
                                <img src={IconUpload} alt="IconUpload" className="w-16 h-16 mb-4 flex-shrink-0 " />
                                <p className="text-lg font-medium text-gray-700 mb-2 text-center">
                                    Click or drag {status === 'excel' ? 'Excel' : 'image'} file to this area to upload
                                </p>
                                <p className="text-sm text-gray-500 text-center px-4">
                                    {status === 'excel'
                                        ? 'Support Excel files (.xlsx, .xls)  Maximum file size 5MB.'
                                        : 'Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={status === 'excel' ? '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv' : 'image/*'}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="relative"></div>
                </div>
            </div>
            <div className="flex justify-end mt-5">
                <Button
                    onClick={handleContinue}
                    type="primary"
                    loading={isSubmitting}
                    className={`px-8 py-2 rounded-lg bg-blue-500  w-[100px] ${isDisabled || isSubmitting ? '!opacity-50 !cursor-not-allowed' : ''}`}
                    disabled={isDisabled || isSubmitting}
                >
                    Continue
                </Button>
            </div>
        </>
    )
}

export default UploadImage;