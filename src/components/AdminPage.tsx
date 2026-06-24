import React, { useState, useEffect } from "react";

interface Word {
  id: number;
  word: string;
  meaning: string;
  hint: string;
  level: string;
}

interface AdminPageProps {
  data: Word[];
  onDataUpdate: (data: Word[]) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ data, onDataUpdate }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Word>({
    id: 0,
    word: "",
    meaning: "",
    hint: "",
    level: "mudah",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("semua");
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    setWords(data);
  }, [data]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getNextId = () => {
    if (words.length === 0) return 1;
    return Math.max(...words.map((w) => w.id)) + 1;
  };

  const handleAdd = () => {
    if (!formData.word.trim() || !formData.meaning.trim()) {
      showNotification("Word dan Meaning harus diisi!", "error");
      return;
    }

    const newWord: Word = {
      ...formData,
      id: getNextId(),
    };

    const updatedWords = [...words, newWord];
    setWords(updatedWords);
    onDataUpdate(updatedWords);
    resetForm();
    showNotification("Data berhasil ditambahkan!", "success");
  };

  const handleEdit = (word: Word) => {
    setEditingId(word.id);
    setFormData({ ...word });
  };

  const handleUpdate = () => {
    if (!formData.word.trim() || !formData.meaning.trim()) {
      showNotification("Word dan Meaning harus diisi!", "error");
      return;
    }

    const updatedWords = words.map((w) =>
      w.id === formData.id ? { ...formData } : w,
    );
    setWords(updatedWords);
    onDataUpdate(updatedWords);
    resetForm();
    showNotification("Data berhasil diupdate!", "success");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      const filteredWords = words.filter((w) => w.id !== id);
      setWords(filteredWords);
      onDataUpdate(filteredWords);
      showNotification("Data berhasil dihapus!", "success");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      id: 0,
      word: "",
      meaning: "",
      hint: "",
      level: "mudah",
    });
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(words, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `words_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("File JSON berhasil diekspor!", "success");
  };

  const handleImportJSON = () => {
    try {
      const importedData = JSON.parse(jsonInput);
      if (!Array.isArray(importedData)) {
        showNotification("Data harus berupa array!", "error");
        return;
      }

      const isValid = importedData.every(
        (item: any) => item.word && item.meaning && item.hint && item.level,
      );

      if (!isValid) {
        showNotification(
          "Format data tidak valid! Pastikan semua field terisi.",
          "error",
        );
        return;
      }

      const maxId = words.length > 0 ? Math.max(...words.map((w) => w.id)) : 0;
      const newWords = importedData.map((item: any, index: number) => ({
        ...item,
        id: maxId + index + 1,
      }));

      const mergedWords = [...words, ...newWords];
      setWords(mergedWords);
      onDataUpdate(mergedWords);
      setShowImportModal(false);
      setJsonInput("");
      showNotification(`${newWords.length} data berhasil diimpor!`, "success");
    } catch (error) {
      showNotification(
        "Error parsing JSON! Pastikan formatnya valid.",
        "error",
      );
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        id: 1,
        word: "EXAMPLE",
        meaning: "Contoh kata",
        hint: "Petunjuk untuk kata ini",
        level: "mudah",
      },
    ];
    const dataStr = JSON.stringify(template, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_words.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredWords = words.filter((word) => {
    const matchSearch =
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = filterLevel === "semua" || word.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "mudah":
        return "bg-green-100 text-green-700";
      case "sedang":
        return "bg-yellow-100 text-yellow-700";
      case "sulit":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Hitung statistik
  const totalMudah = words.filter((w) => w.level === "mudah").length;
  const totalSedang = words.filter((w) => w.level === "sedang").length;
  const totalSulit = words.filter((w) => w.level === "sulit").length;
  const totalSoal = words.length * 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
          } text-white max-w-md animate-slide-in`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                📝 Admin Data Kata
              </h1>
              <p className="text-gray-600 mt-1">Kelola data kata untuk quiz</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                📤 Export JSON
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                📥 Import JSON
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                ← Ke Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center">
            <div className="text-sm text-gray-500">Total Data</div>
            <div className="text-2xl font-bold text-blue-600">
              {words.length}
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center">
            <div className="text-sm text-gray-500">🟢 Mudah</div>
            <div className="text-2xl font-bold text-green-600">
              {totalMudah}
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center">
            <div className="text-sm text-gray-500">🟡 Sedang</div>
            <div className="text-2xl font-bold text-yellow-600">
              {totalSedang}
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center">
            <div className="text-sm text-gray-500">🔴 Sulit</div>
            <div className="text-2xl font-bold text-red-600">{totalSulit}</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center">
            <div className="text-sm text-gray-500">📝 Total Soal</div>
            <div className="text-2xl font-bold text-purple-600">
              {totalSoal}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? "✏️ Edit Data" : "➕ Tambah Data Baru"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Kata (Contoh: REACT)"
              value={formData.word}
              onChange={(e) =>
                setFormData({ ...formData, word: e.target.value.toUpperCase() })
              }
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="text"
              placeholder="Arti (Contoh: Library JavaScript untuk UI)"
              value={formData.meaning}
              onChange={(e) =>
                setFormData({ ...formData, meaning: e.target.value })
              }
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="text"
              placeholder="Petunjuk (Contoh: Dibuat oleh Facebook)"
              value={formData.hint}
              onChange={(e) =>
                setFormData({ ...formData, hint: e.target.value })
              }
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex gap-2">
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="mudah">🟢 Mudah</option>
                <option value="sedang">🟡 Sedang</option>
                <option value="sulit">🔴 Sulit</option>
              </select>
              {editingId ? (
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                  Update
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                  Tambah
                </button>
              )}
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                  Batal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="🔍 Cari kata atau arti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="mudah">🟢 Mudah</option>
              <option value="sedang">🟡 Sedang</option>
              <option value="sulit">🔴 Sulit</option>
            </select>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
              📄 Template JSON
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Petunjuk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredWords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500">
                      {words.length === 0
                        ? "Belum ada data. Tambahkan data baru!"
                        : "Tidak ada data yang sesuai dengan filter."}
                    </td>
                  </tr>
                ) : (
                  filteredWords.map((word) => (
                    <tr
                      key={word.id}
                      className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {word.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {word.word}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {word.meaning}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {word.hint}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(word.level)}`}>
                          {word.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(word)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(word.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Total: {filteredWords.length} data{" "}
            {filterLevel !== "semua" ? `(level: ${filterLevel})` : ""}
            {searchTerm && ` • Pencarian: "${searchTerm}"`}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  📥 Import JSON
                </h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Tempelkan data JSON di bawah ini. Format yang valid:
                </p>
                <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
                  {`[
  {
    "word": "EXAMPLE",
    "meaning": "Contoh kata",
    "hint": "Petunjuk untuk kata ini",
    "level": "mudah"
  }
]`}
                </pre>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Tempel JSON di sini..."
                  className="w-full h-48 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 font-mono text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleImportJSON}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                    Import Data
                  </button>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
