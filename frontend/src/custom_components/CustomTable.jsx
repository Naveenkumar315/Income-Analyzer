import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination
} from "@mui/material";

const CustomTable = ({ columns, data, renderCustomCells }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // default rows per page

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // reset to first page
    };

    // Slice data for current page
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper>
            <TableContainer sx={{ maxHeight: 330 }}>
                <Table stickyHeader>
                    {/* HEADER */}
                    <TableHead>
                        <TableRow className="bg-[#12699D]">
                            {columns.map((col, idx) => (
                                <TableCell
                                    key={idx}
                                    sx={{ backgroundColor: "#12699D", color: "white", fontWeight: 600, zIndex: 999 }}
                                    className="text-white font-semibold"
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* BODY */}
                    <TableBody>
                        {paginatedData.map((row, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                className={rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}
                            >
                                {columns.map((col, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {col.isCustom && renderCustomCells
                                            ? renderCustomCells(col.id, row)
                                            : row[col.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* PAGINATION */}
            <TablePagination
                component="div"
                count={data.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Paper>
    );
};

export default CustomTable;
