import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface TextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Please input text...",
  maxLength = 1200,
  disabled = false,
  className = "",
}) => {
  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
  ];

  // Handle text change with character limit
  const handleChange = (
    content: string,
    delta: any,
    source: any,
    editor: any
  ) => {
    const text = editor.getText();

    // Check character limit (excluding HTML tags)
    if (text.length <= maxLength + 1) {
      // +1 for the automatic newline Quill adds
      onChange?.(content);
    }
  };

  // Get current text length (without HTML tags)
  const getCurrentLength = () => {
    if (!value) return 0;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = value;
    return (tempDiv.textContent || tempDiv.innerText || "").length;
  };

  return (
    <div className={`text-editor-wrapper ${className}`}>
      <ReactQuill
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={modules}
        formats={formats}
        style={{
          height: "200px",
          marginBottom: "42px", // Space for character count
        }}
      />
      <div
        style={{
          textAlign: "right",
          color: getCurrentLength() > maxLength ? "#ff4d4f" : "#999",
          fontSize: "12px",
          marginTop: "-42px",
          marginBottom: "16px",
          paddingRight: "12px",
        }}>
        {getCurrentLength()} / {maxLength}
      </div>
    </div>
  );
};

export default TextEditor;
