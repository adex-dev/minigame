import React, { useState } from 'react';
import AdminPage from './components/AdminPage';
import wordsData from './data/words.json';

const AdminApp: React.FC = () => {
  const [data, setData] = useState(wordsData);

  const handleDataUpdate = (newData: any[]) => {
    setData(newData);
    // Simpan ke localStorage agar bisa diakses oleh user app
    localStorage.setItem('wordsData', JSON.stringify(newData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <AdminPage 
        data={data}
        onDataUpdate={handleDataUpdate}
      />
    </div>
  );
};

export default AdminApp;