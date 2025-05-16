// /src/components/AlertForm.jsx

// /src/components/AlertCreator.jsx

import React, { useState } from "react";
import { aisFieldConfig, conditionOperators } from "./AisConstants";

const CustomAlerts = () => {
  const [selectedField, setSelectedField] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [value, setValue] = useState("");
  const [alerts, setAlerts] = useState([]);

  const handleAddAlert = () => {
    if (!selectedField || !selectedOperator || value === "") {
      alert("Please complete all fields to create an alert.");
      return;
    }
    if (selectedOperator === "between" && (!value?.start || !value?.end)) {
        alert("Please provide both start and end dates for the range.");
        return;
      }
      


    setAlerts((prev) => [
      ...prev,
      {
        field: selectedField,
        operator: selectedOperator,
        value,
        fieldLabel: aisFieldConfig[selectedField].label,
      },
    ]);

    setSelectedField("");
    setSelectedOperator("");
    setValue("");
  };

  
  const getApplicableOperators = (field) => {
    if (!field || !aisFieldConfig[field]) return [];
  
    const config = aisFieldConfig[field];
    if (config.type === "boolean") {
      return [
        { label: "Equals", value: "==" },
      ];
    }
    if (config.type === "datetime") {
        return [
          { label: "Equals", value: "==" },
          { label: "Before", value: "<" },
          { label: "After", value: ">" },
          { label: "Between", value: "between" },
        ];
      }

  
    return conditionOperators;
  };
  

  const renderValueInput = () => {
    if (!selectedField) return null;

    const config = aisFieldConfig[selectedField];
    if (!config) return null;

    if (config.type === "select") {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">Select</option>
          {config.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
                {opt.value} - {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (config.type === "boolean") {
      return (
        <select value={value} onChange={(e) => setValue(e.target.value)}>
          <option value="">Select</option>
          <option value="true">True (ECA)</option>
          <option value="false">False (SECA)</option>
        </select>
      );
    }

    if (config.type === "datetime") {
        if (selectedOperator === "between") {
          return (
            <>
              <input
                type="datetime-local"
                value={value.start || ""}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, start: e.target.value }))
                }
              />
              <span style={{ margin: "0 5px" }}>to</span>
              <input
                type="datetime-local"
                value={value.end || ""}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </>
          );
        }
      
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      }
      

    const inputType = config.type === "number" ? "number" : "text";
    return (
      <input
        type={inputType}
        placeholder="Enter value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Create Alert Rule</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
          <option value="">Select AIS Field</option>
          {Object.keys(aisFieldConfig).map((key) => (
            <option key={key} value={key}>
              {aisFieldConfig[key].label}
            </option>
          ))}
        </select>

    
        <select
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
          disabled={!selectedField}
        >
          <option value="">Condition</option>
          {getApplicableOperators(selectedField).map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>

        {renderValueInput()}

        <button onClick={handleAddAlert}>Add Alert</button>
      </div>

      {alerts.length > 0 && (
        <div>
          <h3>Current Alerts</h3>
          <ul>
            {alerts.map((a, i) => (
             <li key={i}>
             <strong>{a.fieldLabel}</strong> {a.operator}{" "}
             {a.operator === "between"
               ? `${a.value.start} to ${a.value.end}`
               : a.value.toString()}
           </li>
           
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};







export default CustomAlerts;
