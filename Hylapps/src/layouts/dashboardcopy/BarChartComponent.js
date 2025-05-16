/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useContext } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import './BarChart.css';
import { AuthContext } from "../../AuthContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function BarChartComponent() {
  const chartRef = useRef(null);
  const [data, setData] = useState([]); // aggregated chart data
  const [vesselList, setVesselList] = useState([]); // complete vessel data
  const { role, id } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  // PNG Download: Download chart as PNG image
  const downloadPNG = () => {
    const link = document.createElement("a");
    link.href = chartRef.current.chart.toBase64Image();
    link.download = "tracked_vessels_report.png";
    link.click();
  };



  // CSV Download: Create a CSV file from vesselList
  const downloadCSV = () => {
    if (!vesselList || vesselList.length === 0) return;
    const columns = Object.keys(vesselList[0]);
    const header = columns.join(",");
    const rows = vesselList.map(item =>
      columns.map(col => `"${item[col]}"`).join(",")
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tracked_vessels_report.csv";
    link.click();
  };

  // XLSX Download: Create an Excel file from vesselList
  const downloadXLSX = () => {
    if (!vesselList || vesselList.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(vesselList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vessels");
    XLSX.writeFile(workbook, "tracked_vessels_report.xlsx");
  };

  // Helper functions (as in your original code)
  const extractOrgPart = (value) => {
    let orgId = value.includes('_') ? value.split('_')[1] : value.split('_')[0];
    return orgId;
  };

  const fetchTrackedVesselsByUser = async (userId) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
      return response.data.filter(vessel => vessel.loginUserId === userId);
    } catch (error) {
      console.error("Error fetching tracked vessels by user:", error);
      return [];
    }
  };

  const fetchTrackedVesselsByOrg = async (orgId) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user`);
      return response.data.filter(vessel => vessel.OrgId === orgId);
    } catch (error) {
      console.error("Error fetching tracked vessels by user:", error);
      return [];
    }
  };

  const fetchVesselIMOValues = async (userId) => {
    try {
      let OrgId = userId.includes('_') ? userId.split('_')[1] : userId.split('_')[0];
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user-based-on-OrgId`, {
        params: { OrgId }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching IMO values:", error);
      return [];
    }
  };

  const fetchVesselById = async (userId) => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-vessel-tracked-by-user-based-on-loginUserId`, {
        params: { loginUserId: userId }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching vessels values:", error);
      return [];
    }
  };

  const fetchVessels = async (role, userId) => {
    try {
      const trackedByUser = await fetchTrackedVesselsByUser(userId);
      const trackedIMO = trackedByUser.filter(vessel => vessel.IMO).map(vessel => vessel.IMO);
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${baseURL}/api/get-tracked-vessels`);
      const allVessels = response.data;
      const filteredVessels = [];

      if (role === 'hyla admin') {
        filteredVessels.push(...allVessels);
      } else if (role === 'organization admin' || role === 'organizational user') {
        const vesselsFiltered = await fetchVesselIMOValues(userId);
        filteredVessels.push(...vesselsFiltered);
      } else if (role === 'guest') {
        const vesselsFiltered = await fetchVesselById(userId);
        filteredVessels.push(...vesselsFiltered);
      } else {
        console.log('Role not found');
      }
      return filteredVessels;
    } catch (error) {
      console.error("Error fetching vessels:", error);
      return [];
    }
  };

  // Fetch vessels on component mount and process data
  useEffect(() => {
    fetchVessels(role, id)
      .then(filteredVessels => {
        setVesselList(filteredVessels); // Save complete vessel data for downloads

        // Aggregate vessels by month for the chart
        const vesselCountByMonth = filteredVessels.reduce((acc, vessel) => {
          const month = new Date(vessel.createdAt).getMonth();
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});
        const transformedData = Object.keys(vesselCountByMonth).map(month => ({
          month: new Date(2020, month).toLocaleString('default', { month: 'long' }),
          count: vesselCountByMonth[month],
        }));
        setData(transformedData);
      })
      .catch(err => {
        console.error("Error fetching vessel data:", err);
      });
  }, [role, id]);

  // Initialize or update the chart
  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (chartRef.current?.chart) {
      chartRef.current.chart.destroy();
    }
    if (ctx && data.length > 0) {
      chartRef.current.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.map(d => d.month),
          datasets: [
            {
              label: "Total Vessels",
              data: data.map(d => d.count),
              backgroundColor: "#0F67B1",
              borderColor: "#0F67B1",
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 5 }
            },
            x: {
              title: { display: true, text: 'Months' },
              ticks: { autoSkip: false }
            }
          },
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
    return () => {
      if (chartRef.current?.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [data]);

  return (
    <div className="chart-container-wrapper">
      <div className="chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ color: "#344767" }}>
          Total Ships Tracked <sup style={{ color: "orange", fontSize: "12px" }}>(Based on Months)</sup>
        </h4>
        <br></br>
        {/* <div 
          className="dropdown-container" 
          style={{ position: "relative", display: "inline-block" }}
        >
          <button 
            className="dropdown-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              padding: "5px"
            }}
          >
            <i className="fa fa-ellipsis-v" style={{ color:" #0F67B1"}}></i>
          </button>
          {showDropdown && (
            <div 
              className="dropdown-menu" 
              style={{
                position: "absolute",
                top: "30px",
                right: "0",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
                zIndex: 1000,
                padding: "8px"
              }}
            >
              <button onClick={() => { downloadPNG(); setShowDropdown(false); }} style={{ display: "block", width: "100%", border: "none", background: "none", padding: "5px", textAlign: "left", cursor: "pointer" , color:" #0F67B1", fontWeight:"bolder" }}>PNG</button>
              <button onClick={() => { downloadCSV(); setShowDropdown(false); }} style={{ display: "block", width: "100%", border: "none", background: "none", padding: "5px", textAlign: "left", cursor: "pointer" , color:" #0F67B1", fontWeight:"bolder" }}>CSV</button>
              <button onClick={() => { downloadXLSX(); setShowDropdown(false); }} style={{ display: "block", width: "100%", border: "none", background: "none", padding: "5px", textAlign: "left", cursor: "pointer", color:" #0F67B1", fontWeight:"bolder" }}>XLSX</button>
            </div>
          )}
        </div> */}
      </div>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

export default BarChartComponent;
