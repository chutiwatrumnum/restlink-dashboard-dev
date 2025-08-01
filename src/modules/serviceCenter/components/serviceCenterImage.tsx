import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, message, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { whiteLabel } from "../../../configs/theme";
import { uploadImageServiceCenterQuery, deleteImageServiceCenterQuery } from "../hooks/serviceCenterMutation";
import { DeleteImage, UploadImage } from "../../../stores/interfaces/ServiceCenter";
export interface ServiceImageProps {
    title: string;
    maximum: number;
    image?: any;
    disabledUpload: boolean;
    oldFileList: UploadFile[];
    imageStatusId: number;
    serviceId: number;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const serviceImageGallery = ({ title, maximum, disabledUpload, oldFileList, imageStatusId, serviceId }: ServiceImageProps) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [fileList, setFileList] = useState<UploadFile[]>(oldFileList);
    const mutationUploadImageService = uploadImageServiceCenterQuery();
    const mutationDeleteImageService = deleteImageServiceCenterQuery();
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleOnRemove: UploadProps["onRemove"] = async (info) => {
        const payload: DeleteImage = {
            serviceId: serviceId,
            imageBucketId: Number(info.uid),
        };
        await mutationDeleteImageService.mutateAsync(payload);
        const newFileList = fileList.filter((item) => item.uid !== info.uid);
        setFileList(newFileList);
    };

    const customUploadRequest: UploadProps["customRequest"] = async (options) => {
        const { file } = options;
        const files = file as UploadFile;
        const isLt1M = files.size!! / 1024 / 1024 < 1;
        if (!isLt1M) {
            message.error("Image must smaller than 1MB!");
            return isLt1M;
        }
        const dataImagePayload: UploadImage = {
            serviceId: serviceId,
            imageStatus: imageStatusId,
            image: await getBase64(files as FileType),
        };
        const resp = await mutationUploadImageService.mutateAsync(dataImagePayload);
        if (resp.length > 0) {
            const newImageList: UploadFile[] = [];
            resp.map((item: any) => {
                const newFile: UploadFile = {
                    uid: item.id.toString(),
                    name: "",
                    url: item.imageUrl,
                };
                newImageList.push(newFile);
            });
            setFileList(newImageList);
        }
    };

    const uploadButton = (
        <button disabled={disabledUpload} style={{ border: 0, background: "none" }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );
    return (
        <>
            <span style={{ fontWeight: whiteLabel.boldWeight }}>
                {title} : {fileList.length} of {maximum}
            </span>
            <Upload customRequest={customUploadRequest} listType="picture-card" disabled={disabledUpload} fileList={fileList} onPreview={handlePreview} onRemove={handleOnRemove}>
                {fileList.length >= maximum ? null : uploadButton}
            </Upload>
            {previewImage && (
                <Image
                    wrapperStyle={{ display: "none" }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(""),
                    }}
                    src={previewImage}
                />
            )}
        </>
    );
};

export default serviceImageGallery;
