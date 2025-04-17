import { Input } from "antd";

import "../styles/common.css";

interface SearchBoxType {
  placeholderText?: string;
  onSearch: (value: string) => void;
  className?: string;
}

const { Search } = Input;

const SearchBox = ({ onSearch, className, placeholderText }: SearchBoxType) => {
  return (
    <Search
      className={className}
      placeholder={placeholderText ? placeholderText : "Search"}
      onSearch={onSearch}
      size="large"
      allowClear
    />
  );
};

export default SearchBox;
