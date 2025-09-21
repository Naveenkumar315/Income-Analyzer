import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
} from "@mui/material";

import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const CustomTable = ({
  columns,
  data,
  renderCustomCells,
  loading = false,
  sortConfig,
  onSort,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper>
      <TableContainer sx={{ maxHeight: 330 }}>
        <Table stickyHeader>
          {/* HEADER */}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  onClick={() => onSort && onSort(col.id)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: "#097aaf", // 🔹 new blue color
                    color: "white",
                    fontWeight: "bold",
                    transition: "background-color 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#066185", // 🔹 darker hover
                    },
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {col.label}
                    {sortConfig?.key === col.id &&
                      (sortConfig.direction === "asc" ? (
                        <FaArrowUp size={12} />
                      ) : sortConfig.direction === "desc" ? (
                        <FaArrowDown size={12} />
                      ) : null)}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <CircularProgress size={32} thickness={4} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4, color: "gray" }}
                >
                  Sorry, no data found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex}>
                      {col.isCustom && renderCustomCells
                        ? renderCustomCells(col.id, row, rowIndex)
                        : row[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      {!loading && (
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Paper>
  );
};

export default CustomTable;
