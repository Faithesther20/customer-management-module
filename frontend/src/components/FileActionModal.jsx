// src/components/FileActionModal.jsx
import { useState } from "react";
import Button from "./Button";
import Loader from "./Loader";
import api from "../api/axios";

export default function FileActionModal({ isOpen, onClose, type, onCompleted }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async () => {
    if (type === "import") {
      if (!file) {
        setMessage("Please select a file to import.");
        return;
      }
      const allowed = [".csv", ".xlsx"];
      const ext = file.name.substring(file.name.lastIndexOf("."));
      if (!allowed.includes(ext)) {
        setMessage("Only CSV or Excel files are allowed.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true);
        const res = await api.post("/customers/process/import", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage(res.data.message || "File imported successfully!");
        onCompleted(); // Refresh table
      } catch (err) {
        setMessage("Import failed. " + (err.response?.data?.message || ""));
      } finally {
        setLoading(false);
      }
    } else if (type === "export") {
      try {
        setLoading(true);
        const format = file; // here file stores selected format: "csv" or "excel"
       const res = await api.get(`/customers/process/export`, {
            params: { format },
            responseType: "blob",
            });
        const fileName = format === "csv" ? "customers.csv" : "customers.xlsx";
        const { saveAs } = await import("file-saver");
        saveAs(res.data, fileName);
        setMessage(`Exported ${format.toUpperCase()} successfully!`);
      } catch (err) {
        setMessage("Export failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {type === "import" ? "Import Customers" : "Export Customers"}
        </h2>

        {type === "import" ? (
          <div className="space-y-4">
            <input type="file" onChange={handleFileChange} className="font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-300 hover:bg-gray-400 text-gray-800"/>
            <p className="text-sm text-gray-500">
              Allowed formats: CSV, Excel
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select export format:</p>
            <div className="flex space-x-3">
                {/* CSV option */}
                <button
                type="button"
                onClick={() => setFile("csv")}
                className={`px-4 py-2 rounded-lg border transition ${
                    file === "csv"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                >
                CSV
                </button>

                {/* Excel option */}
                <button
                type="button"
                onClick={() => setFile("excel")}
                className={`px-4 py-2 rounded-lg border transition ${
                    file === "excel"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                >
                Excel
                </button>
           </div>
</div>

        )}

        {message && <p className="text-sm text-red-500 mt-2">{message}</p>}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (!file && type === "export")}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? <Loader small /> : type === "import" ? "Import" : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
