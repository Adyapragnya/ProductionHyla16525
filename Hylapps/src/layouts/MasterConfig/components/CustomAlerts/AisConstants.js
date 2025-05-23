

export const aisFieldConfig = {
    // MMSI: { label: "MMSI", type: "number" },
    // TIMESTAMP: { label: "Timestamp", type: "datetime" },
    // LATITUDE: { label: "Latitude", type: "number" },
    // LONGITUDE: { label: "Longitude", type: "number" },
    COURSE: { label: "Course", type: "number" },
    SPEED: { label: "Speed", type: "number" },
    HEADING: { label: "Heading", type: "number" },
    NAVSTAT: {
        label: "Navigation Status",
        type: "select",
        options: [
          { value: 0, label: "Under way using engine" },
          { value: 1, label: "At anchor" },
          { value: 2, label: "Not under command" },
          { value: 3, label: "Restricted manoeuverability" },
          { value: 4, label: "Constrained by her draught" },
          { value: 5, label: "Moored" },
          { value: 6, label: "Aground" },
          { value: 7, label: "Engaged in Fishing" },
          { value: 8, label: "Under way sailing" },
          { value: 9, label: "Reserved for HSC" },
          { value: 10, label: "Reserved for WIG" },
          { value: 11, label: "Reserved for future use" },
          { value: 12, label: "Reserved for future use" },
          { value: 13, label: "Reserved for future use" },
          { value: 14, label: "AIS-SART is active" },
          { value: 15, label: "Not defined (default)" },
        ],
      },
    // IMO: { label: "IMO", type: "number" },
    // NAME: { label: "Vessel Name", type: "text" },
    CALLSIGN: { label: "Callsign", type: "text" },
    TYPE: {
        label: "Ship Type",
        type: "select",
        options: [
          { value: 0, label: "Not available" },
          { value: 20, label: "WIG, all ships" },
          { value: 21, label: "WIG, Hazardous A" },
          { value: 22, label: "WIG, Hazardous B" },
          { value: 23, label: "WIG, Hazardous C" },
          { value: 24, label: "WIG, Hazardous D" },
          { value: 25, label: "WIG, Reserved" },
          { value: 26, label: "WIG, Reserved" },
          { value: 27, label: "WIG, Reserved" },
          { value: 28, label: "WIG, Reserved" },
          { value: 29, label: "WIG, Reserved" },
          { value: 30, label: "Fishing" },
          { value: 31, label: "Towing" },
          { value: 32, label: "Towing > 200m/25m" },
          { value: 33, label: "Dredging or underwater ops" },
          { value: 34, label: "Diving ops" },
          { value: 35, label: "Military ops" },
          { value: 36, label: "Sailing" },
          { value: 37, label: "Pleasure Craft" },
          { value: 38, label: "Reserved" },
          { value: 39, label: "Reserved" },
          { value: 40, label: "HSC, all ships" },
          { value: 41, label: "HSC, Hazardous A" },
          { value: 42, label: "HSC, Hazardous B" },
          { value: 43, label: "HSC, Hazardous C" },
          { value: 44, label: "HSC, Hazardous D" },
          { value: 45, label: "HSC, Reserved" },
          { value: 46, label: "HSC, Reserved" },
          { value: 47, label: "HSC, Reserved" },
          { value: 48, label: "HSC, Reserved" },
          { value: 49, label: "HSC, No info" },
          { value: 50, label: "Pilot Vessel" },
          { value: 51, label: "Search and Rescue" },
          { value: 52, label: "Tug" },
          { value: 53, label: "Port Tender" },
          { value: 54, label: "Anti-pollution" },
          { value: 55, label: "Law Enforcement" },
          { value: 56, label: "Spare - Local Vessel" },
          { value: 57, label: "Spare - Local Vessel" },
          { value: 58, label: "Medical Transport" },
          { value: 59, label: "Noncombatant" },
          { value: 60, label: "Passenger" },
          { value: 61, label: "Passenger, Hazardous A" },
          { value: 62, label: "Passenger, Hazardous B" },
          { value: 63, label: "Passenger, Hazardous C" },
          { value: 64, label: "Passenger, Hazardous D" },
          { value: 65, label: "Passenger, Reserved" },
          { value: 66, label: "Passenger, Reserved" },
          { value: 67, label: "Passenger, Reserved" },
          { value: 68, label: "Passenger, Reserved" },
          { value: 69, label: "Passenger, No info" },
          { value: 70, label: "Cargo" },
          { value: 71, label: "Cargo, Hazardous A" },
          { value: 72, label: "Cargo, Hazardous B" },
          { value: 73, label: "Cargo, Hazardous C" },
          { value: 74, label: "Cargo, Hazardous D" },
          { value: 75, label: "Cargo, Reserved" },
          { value: 76, label: "Cargo, Reserved" },
          { value: 77, label: "Cargo, Reserved" },
          { value: 78, label: "Cargo, Reserved" },
          { value: 79, label: "Cargo, No info" },
          { value: 80, label: "Tanker" },
          { value: 81, label: "Tanker, Hazardous A" },
          { value: 82, label: "Tanker, Hazardous B" },
          { value: 83, label: "Tanker, Hazardous C" },
          { value: 84, label: "Tanker, Hazardous D" },
          { value: 85, label: "Tanker, Reserved" },
          { value: 86, label: "Tanker, Reserved" },
          { value: 87, label: "Tanker, Reserved" },
          { value: 88, label: "Tanker, Reserved" },
          { value: 89, label: "Tanker, No info" },
          { value: 90, label: "Other" },
          { value: 91, label: "Other, Hazardous A" },
          { value: 92, label: "Other, Hazardous B" },
          { value: 93, label: "Other, Hazardous C" },
          { value: 94, label: "Other, Hazardous D" },
          { value: 95, label: "Other, Reserved" },
          { value: 96, label: "Other, Reserved" },
          { value: 97, label: "Other, Reserved" },
          { value: 98, label: "Other, Reserved" },
          { value: 99, label: "Other, No info" },
        ],
      },
    A: { label: "A (GPS to Bow)", type: "number" },
    B: { label: "B (GPS to Stern)", type: "number" },
    C: { label: "C (GPS to Port)", type: "number" },
    D: { label: "D (GPS to Starboard)", type: "number" },
    DRAUGHT: { label: "Draught", type: "number" },
    DESTINATION: { label: "Destination", type: "text" },
    LOCODE: { label: "LOCODE", type: "text" },
    ETA_AIS: { label: "ETA_AIS", type: "datetime" },
    ETA: { label: "ETA", type: "datetime" },
    ETA_PREDICTED: { label: "ETA Predicted", type: "datetime" },
    DISTANCE_REMAINING: { label: "Distance Remaining", type: "number" },
    SRC: {
      label: "Source",
      type: "select",
      options: [
        { value: "TER", label: "Terrestrial" },
        { value: "SAT", label: "Satellite" },
      ],
    },
    ZONE: { label: "Zone", type: "text" },
    ECA: {
      label: "ECA",
      type: "boolean",
    },
  };
  
  export const conditionOperators = [
    { label: "Equals", value: "==" },
    { label: "Not Equals", value: "!=" },
    { label: "Greater Than", value: ">" },
    { label: "Less Than", value: "<" },
   
  ];
  