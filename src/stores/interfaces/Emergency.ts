export interface EmergencyTableDataType {
  tableData: DataEmergencyTableDataType[];
  EmergencyMaxLength: number;
}
export interface DataEmergencyTableDataType {
  id:    number;
  image: string;
  name:  string;
  tel:   string;
}
export interface EmergencyPayloadType {
  search: string | null;
  curPage: number;
  perPage: number;
}

export interface NearBySelectListType {
  label: string;
  value: string|null;
}

export interface DataEmergencyCreateByType {
  id?:          number;
  image?:       string|null;
  name:  string;
  tel:   string;
}