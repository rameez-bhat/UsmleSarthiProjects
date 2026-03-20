// src/components/HtmlEditor.jsx
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function HtmlEditor({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  return (
    <div>
      <ReactQuill
        value={value}
        onChange={onChange}
        theme="snow"
        modules={modules}
        style={{ background: "#fff", minHeight: 150 }}
      />

      {/* Preview */}
      <div
        className="ql-editor"
        style={{
          border: "1px solid #ccc",
          marginTop: 15,
          padding: 10,
          borderRadius: 6,
          background: "#fafafa",
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
