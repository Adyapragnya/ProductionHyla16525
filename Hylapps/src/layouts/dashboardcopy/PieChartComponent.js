import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import './PieChartComponent.css';

// Custom tooltip component for the pie chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <span>{`${payload[0].name}: ${payload[0].value}`}</span>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

const PieChartComponent = ({ data }) => {
  const chartRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Colors for the pie chart cells
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#7C00FE', '#FF6600',
    '#219C90', '#FDDE55', '#06D001', '#008DDA', '#E72929', '#9195F6',
    '#FFEB00', '#FF77B7', '#10375C', '#229799', '#2C4E80', '#597E52',
    '#674188', '#FFC7ED', '#050C9C', '#640D5F', '#874CCC', '#C6E7FF',
    '#FFB38E', '#133E87', '#FF9D3D', '#FF4545', '#3D0301', '#00ADB5',
    '#F9E400', '#06D001', '#26355D', '#FF204E', '#FF0080', '#FFF455',
    '#B6FFFA', '#6528F7', '#39B5E0', '#A555EC', '#0F6292', '#A149FA',
    '#542E71', '#7868E6', '#52734D', '#FDB827', '#41AEA9', '#6F4E37',
    '#FF8000', '#8174A0', '#4335A7', '#640D5F', '#4C1F7A', '#A888B5',
    '#80C4E9', '#219B9D', '#D91656', '#FF2929', '#355F2E', '#0A97B0',
    '#0A5EB0', '#F26B0F', '#E73879', '#7A1CAC', '#135D66', '#433D8B',
    '#704264', '#77B0AA', '#D95F59', '#8C3061', '#3C0753', '#52D3D8',
    '#5D3587', '#190482', '#FBD288', '#CC2B52', '#E85C0D', '#2E073F',
    '#AD49E1', '#A04747', '#0B2F9F', '#40534C', '#134B70', '#8D493A',
    '#508D4E', '#478CCF', '#E0A75E', '#4C3BCF', '#7776B3', '#FFBF78',
    '#C5FF95', '#D20062', '#FF204E', '#430A5D', '#5356FF', '#378CE7',
    '#FF8E8F', '#FFB38E', '#7469B6', '#2D9596', '#211C6A', '#D24545',
    '#6C22A6', '#0F1035', '#F6B17A', '#EF4040', '#7B66FF', '#D0A2F7'
  ];

  // Download chart as PNG using html2canvas
  const downloadPNG = useCallback(() => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current, { useCORS: true }).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'pie_chart_report.png';
      link.click();
    });
  }, []);

  // Download data as CSV
  const downloadCSV = useCallback(() => {
    if (!data?.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => `"${('' + row[header]).replace(/"/g, '\\"')}"`)
          .join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();
  }, [data]);

  // Download data as XLSX using the XLSX library
  const downloadXLSX = useCallback(() => {
    if (!data?.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'data.xlsx');
  }, [data]);

  // Toggle the dropdown visibility
  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  // Handle download based on selection
  const handleDownload = useCallback(
    (type) => {
      setDropdownOpen(false);
      if (type === 'csv') {
        downloadCSV();
      } else if (type === 'xlsx') {
        downloadXLSX();
      } else if (type === 'png') {
        downloadPNG();
      }
    },
    [downloadCSV, downloadXLSX, downloadPNG]
  );

  return (
    <div style={{ position: 'relative' }}>
      <div className="header-container">
        <h4 style={{ color: "#344767", margin: 0 }}>Chart Data</h4>
        <br></br>
        {/* <div className="dropdown-container" style={{ position: 'relative' }}>
          <button 
            className="dropdown-toggle-button" 
            onClick={toggleDropdown}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
            }}
            aria-label="Download options"
          >
            <i className="fa fa-ellipsis-v" style={{ color: "#0F67B1" }}></i>
          </button>
          {dropdownOpen && (
            <div 
              className="dropdown-menu" 
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                background: '#fff',
                border: '1px solid #cccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
              }}
            >
              <div 
                className="dropdown-item" 
                style={{ padding: '0 12px', cursor: 'pointer', color: "#0F67B1", fontWeight: '500' }}
                onClick={() => handleDownload('csv')}
              >
                CSV
              </div>
              <div 
                className="dropdown-item" 
                style={{ padding: '0 12px', cursor: 'pointer', color: "#0F67B1", fontWeight: '500' }}
                onClick={() => handleDownload('xlsx')}
              >
                XLSX
              </div>
              <div 
                className="dropdown-item" 
                style={{ padding: '0 12px', cursor: 'pointer', color: "#0F67B1", fontWeight: '500' }}
                onClick={() => handleDownload('png')}
              >
                PNG
              </div>
            </div>
          )}
        </div> */}
      </div>

      <div ref={chartRef} className="chart-container">
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="80%"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <h3 style={{ color: "#0F67B1"}}>Total Ships in the region</h3>
      </div>
    </div>
  );
};

PieChartComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default PieChartComponent;
