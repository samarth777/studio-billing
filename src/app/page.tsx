'use client'

import React, { ChangeEvent, useState } from 'react';
import ExcelJS from 'exceljs';

type Entry = {
  title: string;
  duration: string;
  price: string;
};

const EntriesPage = () => {
  const [entries, setEntries] = useState<Entry[]>([{ title: '', duration: '', price: '' }]);
  const [projectTitle, setProjectTitle] = useState('');
  const handleInputChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const values = [...entries];
    if (event.target.name in values[index]) {
      values[index][event.target.name as keyof Entry] = event.target.value;
    }
    setEntries(values);
  };

  const handleAddEntry = () => {
    setEntries([...entries, { title: '', duration: '', price: '' }]);
  };

  const handleRemoveEntry = (index: number) => {
    const values = [...entries];
    values.splice(index,  1);
    setEntries(values);
  };
  const handleDownload = async (projectTitle: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Billing');
  
    // Add project title at the top of the worksheet
    const titleRow = worksheet.addRow([projectTitle]);
    titleRow.eachCell((cell) => {
      cell.font = { bold: true, size: 16 };
    });
  
    // Add a blank row after the title
    worksheet.addRow([]);
  
    const header = ['S.No', 'Title', 'Duration', 'Price', 'Total Cost'];
    const headerRow = worksheet.addRow(header);
  
    headerRow.eachCell((cell, number) => {
      cell.font = { bold: true };
    });
  
    entries.forEach(({ title, duration, price }, index) => {
      const totalCost = (Number(duration) * Number(price)).toFixed(2);
      const row = worksheet.addRow([index + 1, title, duration, price, totalCost]);
      row.getCell(1).value = index + 1; // Serial number
      row.getCell(2).value = title;
      row.getCell(3).value = Number(duration);
      row.getCell(4).value = Number(price);
      row.getCell(5).value = Number(totalCost);
    });
  
    const total = entries.reduce((sum, { duration, price }) => sum + Number(duration) * Number(price),  0).toFixed(2);
    const totalRow = worksheet.addRow(['', '', '', 'TOTAL', total]);
    totalRow.getCell(1).value = ''; // Empty cell
    totalRow.getCell(2).value = ''; // Empty cell
    totalRow.getCell(3).value = ''; // Empty cell
    totalRow.getCell(4).value = 'TOTAL';
    totalRow.getCell(5).value = Number(total); // Total cost
  
    totalRow.eachCell((cell, number) => {
      cell.font = { bold: true };
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'billing.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Billing Entries</h1>
      <input 
      type="text" 
      value={projectTitle} 
      onChange={(e) => setProjectTitle(e.target.value)} 
      placeholder="Enter project title" 
      className="border p-2 rounded mb-4"
    />
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="flex space-x-4">
            <input
              type="text"
              name="title"
              value={entry.title}
              onChange={(event) => handleInputChange(index, event)}
              className="border p-2 rounded w-full"
              placeholder="Title"
            />
            <input
              type="number"
              name="duration"
              value={entry.duration}
              onChange={(event) => handleInputChange(index, event)}
              className="border p-2 rounded w-full"
              placeholder="Duration (minutes)"
            />
            <input
              type="number"
              name="price"
              value={entry.price}
              onChange={(event) => handleInputChange(index, event)}
              className="border p-2 rounded w-full"
              placeholder="Price"
            />
            <button onClick={() => handleRemoveEntry(index)} className="bg-red-500 text-white p-2 rounded">
              Remove
            </button>
          </div>
        ))}
        <button onClick={handleAddEntry} className="bg-blue-500 text-white p-2 rounded">
          Add Entry
        </button>
        <button onClick={() => handleDownload(projectTitle)}  className="bg-green-500 text-white p-2 rounded mt-4">
          Download XLSX
        </button>
      </form>
    </div>
  );
};

export default EntriesPage;
