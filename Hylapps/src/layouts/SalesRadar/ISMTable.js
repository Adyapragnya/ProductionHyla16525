import { useEffect, useMemo, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, MenuItem, ListItemIcon } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { AuthContext } from '../../AuthContext';
import debounce from 'lodash.debounce';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const LOCAL_STORAGE_KEY = 'ismTableState';

const ISMTable = ({ rows = [], onRowClick }) => {
  const { role, id } = useContext(AuthContext);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aHasQuotation = a.SalesQuotationNumber && a.SalesQuotationNumber !== '-';
      const bHasQuotation = b.SalesQuotationNumber && b.SalesQuotationNumber !== '-';
      if (aHasQuotation && !bHasQuotation) return -1;
      if (!aHasQuotation && bHasQuotation) return 1;
      return 0;
    });
  }, [rows]);

  const columns = useMemo(() => [
    {
      header: 'Sales Quotation No',
      accessorKey: 'SalesQuotationNumber',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Customer Owner',
      accessorKey: 'CompanyTitle',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Vessel Name',
      accessorKey: 'vesselname',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Vessel Type',
      accessorKey: 'vesseltype',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'IMO',
      accessorKey: 'IMO',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Destination',
      accessorFn: row => row?.AIS?.DESTINATION || '',
      id: 'AIS.DESTINATION',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    
    {
      header: 'ETA',
      accessorKey: 'AIS.ETA',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Speed',
      accessorKey: 'AIS.SPEED',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Heading',
      accessorKey: 'AIS.HEADING',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'DTG',
      accessorKey: 'AIS.DISTANCE_REMAINING',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Region Name',
      accessorKey: 'AisPullGfType',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Gross Weight',
      accessorKey: 'GrossTonnage',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Current Flag',
      accessorKey: 'CurrentFlag',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Current Class',
      accessorKey: 'CurrentClass',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
    {
      header: 'Management Office',
      accessorKey: 'ManagementOffice',
      cell: (info) => <Box sx={{ textAlign: 'center' }}>{info.getValue()}</Box>,
    },
  ], []);

  // Load saved table state from localStorage
  const [tableState, setTableState] = useState(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${id}`);
    return saved ? JSON.parse(saved) : {
      columnVisibility: {},
      columnOrder: [],
      density: 'compact',
      pagination: { pageIndex: 0, pageSize: 10 },
      grouping: [],
    };
  });

  // Debounced save function
  const debouncedSave = useMemo(() =>
    debounce((state) => {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${id}`, JSON.stringify(state));
    }, 1000), [id]);
  

  const handleStateChange = (updater) => {
    setTableState((prev) => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      debouncedSave(newState);
      return newState;
    });
  };

  const renderRowActionMenuItems = ({ closeMenu, row }) => [
    <MenuItem
      key="view"
      onClick={() => {
        closeMenu();
        onRowClick(row.original);
      }}
      sx={{ m: 0 }}
    >
      <ListItemIcon><i className="fa-solid fa-ship"></i></ListItemIcon>
      View Vessel
    </MenuItem>,
  ];

  return (
    <div className="geofence-histories">
     <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <button
          onClick={() => {
            if (!sortedRows || sortedRows.length === 0) {
              toast.warning('No Data to Export');
              return;
            }
      
            const exportableRows = sortedRows.map((row) => {
              const { pointerColor, Action, ...cleanedRow } = row;
              return cleanedRow;
            });
      
            const worksheet = XLSX.utils.json_to_sheet(exportableRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Fleet Managers Data');
            XLSX.writeFile(workbook, 'Up_Sell_with_Fleet_Managers.xlsx');
          }}
          style={{
            backgroundColor: '#0F67B1',
            color: '#fff',
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '3px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <i className="fa-solid fa-file-excel" style={{ fontSize: '14px' }}></i>
          <span style={{ marginLeft: '4px' }}>Export Excel</span>
        </button>
     </Box>


      {sortedRows.length === 0 ? (
        <p>No data to display</p>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={sortedRows}
          enableColumnResizing
          enableGrouping
          enablePagination
          enableColumnPinning
          enableColumnOrdering
          enableColumnDragging
          enableExport
          enableDensityToggle
          enableRowActions={true}
          renderRowActionMenuItems={renderRowActionMenuItems}
          state={tableState}
          onStateChange={handleStateChange}
          muiTableProps={{
            sx: {
              minWidth: '100%',
              tableLayout: 'auto',
              borderCollapse: 'collapse',
            },
          }}
          muiTablePaperProps={{
            sx: {
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            },
          }}
          muiTableContainerProps={{
            sx: {
              overflowX: 'auto',
              maxWidth: '100%',
            },
          }}
          muiTableColumnProps={{
            sx: {
              maxWidth: '200px',
              minWidth: '80px',
              flexGrow: 1,
            },
          }}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: 'bold',
              padding: '10px',
              textAlign: 'left',
              color: '#0F67B1',
              whiteSpace: 'nowrap',
            },
          }}
          muiTableBodyRowProps={{
            sx: {
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
          muiTableBodyCellProps={({ cell }) => {
            const pointerColor = cell.row.original.pointerColor;
            let textColor = pointerColor === '#80AF81' ? '' : pointerColor === '#ffff' ? '#ffff' : '#80AF81';
            return {
              style: {
                backgroundColor: textColor,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100px',
              },
            };
          }}
        />
      )}
    </div>
  );
};

ISMTable.propTypes = {
  rows: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
};

export default ISMTable;
