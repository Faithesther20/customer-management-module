// src/components/FileActionModal.jsx
// import { useState } from "react";
// import Button from "./Button";
// import Loader from "./Loader";
// import api from "../api/axios";

// export default function FileActionModal({ isOpen, onClose, type, onCompleted }) {
//   const [file, setFile] = useState(null); // For import file or export format
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   if (!isOpen) return null;

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//     setMessage("");
//     console.log("Selected file:", e.target.files[0]);
//   };

//   const handleSubmit = async () => {
//     if (type === "import") {
//       if (!file) {
//         setMessage("Please select a file to import.");
//         console.log("Import failed: no file selected");
//         return;
//       }

//       const allowed = [".csv", ".xlsx"];
//       const ext = file.name.substring(file.name.lastIndexOf("."));
//       if (!allowed.includes(ext)) {
//         setMessage("Only CSV or Excel files are allowed.");
//         console.log("Import failed: invalid file type", ext);
//         return;
//       }

//       const formData = new FormData();
//       formData.append("file", file);

//       try {
//         setLoading(true);
//         console.log("Sending import request for file:", file.name);
//         const res = await api.post("/customers/process/import", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         console.log("Import response:", res.data);
//         setMessage(res.data.message || "File imported successfully!");
//         onCompleted(); // Refresh table
//       } catch (err) {
//         console.error("Import failed:", err.response?.data || err.message);
//         setMessage("Import failed. " + (err.response?.data?.message || ""));
//       } finally {
//         setLoading(false);
//       }
//     } else if (type === "export") {
//       if (!file) {
//         setMessage("Please select an export format (CSV or Excel).");
//         console.log("Export failed: no format selected");
//         return;
//       }

//       try {
//         setLoading(true);
//         console.log("Sending export request for format:", file);
//         const res = await api.get("/customers/process/export", {
//           params: { format: file },
//           responseType: "blob",
//         });

//         const fileName = file === "csv" ? "customers.csv" : "customers.xlsx";
//         const { saveAs } = await import("file-saver");
//         saveAs(res.data, fileName);
//         setMessage(`Exported ${file.toUpperCase()} successfully!`);
//         console.log("Export completed:", fileName);
//       } catch (err) {
//         console.error("Export failed:", err.response?.data || err.message);
//         setMessage("Export failed. Check console for details.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-transparent flex justify-center items-center z-50">
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
//         <h2 className="text-xl font-bold mb-4">
//           {type === "import" ? "Import Customers" : "Export Customers"}
//         </h2>

//         {type === "import" ? (
//           <div className="space-y-4">
//             <input
//               type="file"
//               onChange={handleFileChange}
//               className="font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-300 hover:bg-gray-400 text-gray-800"
//             />
//             <p className="text-sm text-gray-500">Allowed formats: CSV, Excel</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <p className="text-sm text-gray-500">Select export format:</p>
//             <div className="flex space-x-3">
//               <button
//                 type="button"
//                 onClick={() => setFile("csv")}
//                 className={`px-4 py-2 rounded-lg border transition ${
//                   file === "csv"
//                     ? "bg-blue-600 text-white border-blue-600"
//                     : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
//                 }`}
//               >
//                 CSV
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFile("excel")}
//                 className={`px-4 py-2 rounded-lg border transition ${
//                   file === "excel"
//                     ? "bg-green-600 text-white border-green-600"
//                     : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
//                 }`}
//               >
//                 Excel
//               </button>
//             </div>
//           </div>
//         )}

//         {message && <p className="text-sm text-red-500 mt-2">{message}</p>}

//         <div className="flex justify-end space-x-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading || (!file && type === "export")}
//             className={`px-4 py-2 rounded text-white ${
//               loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {loading ? <Loader small /> : type === "import" ? "Import" : "Export"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/components/FileActionModal.jsx
import { useState } from "react";
import Button from "./Button";
import Loader from "./Loader";
import api from "../api/axios";

export default function FileActionModal({ isOpen, onClose, type, onCompleted }) {
  const [file, setFile] = useState(null); // for import file or export format
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    console.log("Selected file:", e.target.files[0]);
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
        console.log("Sending import request...");
        const res = await api.post("/customers/process/import", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Import response:", res.data);
        setMessage(res.data.message || "File imported successfully!");
        onCompleted?.(); // Refresh table
      } catch (err) {
        console.error("Import error:", err.response || err);
        setMessage("Import failed. " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }

    } else if (type === "export") {
      if (!file) {
        setMessage("Please select export format.");
        return;
      }
      try {
        setLoading(true);
        console.log("Exporting format:", file);
        const res = await api.get(`/customers/process/export`, {
          params: { format: file === "excel" ? "xlsx" : "csv" },
          responseType: "blob",
        });
        console.log("Export response received.");

        const fileName = file === "excel" ? "customers.xlsx" : "customers.csv";
        const { saveAs } = await import("file-saver");
        saveAs(res.data, fileName);
        setMessage(`Exported ${file.toUpperCase()} successfully!`);
      } catch (err) {
        console.error("Export error:", err.response || err);
        setMessage("Export failed. " + (err.response?.data?.message || err.message));
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
            <input
              type="file"
              onChange={handleFileChange}
              className="font-semibold py-2 px-4 rounded-lg transition-colors bg-gray-300 hover:bg-gray-400 text-gray-800"
            />
            <p className="text-sm text-gray-500">Allowed formats: CSV, Excel</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select export format:</p>
            <div className="flex space-x-3">
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
              loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? <Loader small /> : type === "import" ? "Import" : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}

