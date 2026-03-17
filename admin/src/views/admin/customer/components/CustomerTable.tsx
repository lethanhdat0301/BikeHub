import React, { useState } from "react";
import { useTable, usePagination, useSortBy, useGlobalFilter } from "react-table";
import { MdSearch, MdEdit } from "react-icons/md";

type Props = {
    tableContent: any[];
    loading: boolean;
};

const CustomerTable: React.FC<Props> = ({ tableContent, loading }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const data = React.useMemo(() => {
        if (!tableContent) return [];
        if (Array.isArray(tableContent)) {
            if (!searchTerm) return tableContent;
            return tableContent.filter(
                (item) =>
                    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return [];
    }, [tableContent, searchTerm]);

    const columns = React.useMemo(
        () => [
            {
                Header: "Customer",
                accessor: "name",
                Cell: ({ row }: any) => (
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                            {row.original.image ? (
                                <img
                                    src={row.original.image}
                                    alt={row.original.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-300 text-lg font-bold text-gray-600">
                                    {row.original.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                                {row.original.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {row.original.phone || "N/A"}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                Header: "Total Rentals",
                accessor: "total_rentals",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {value || 0}
                    </p>
                ),
            },
            {
                Header: "Total Spent",
                accessor: "total_spent",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {Number(value || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                ),
            },
            {
                Header: "Average Rating",
                accessor: "average_rating",
                Cell: ({ value }: any) => {
                    const rating = value || 0;
                    return (
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-lg">
                                    {star <= rating ? "⭐" : "☆"}
                                </span>
                            ))}
                        </div>
                    );
                },
            },
            {
                Header: "Last Rental Date",
                accessor: "last_rental_date",
                Cell: ({ value }: any) => {
                    if (!value) return <p className="text-sm text-gray-500">N/A</p>;
                    const date = new Date(value);
                    return (
                        <p className="text-sm text-navy-700 dark:text-white">
                            {date.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    );
                },
            },
            {
                Header: "",
                id: "actions",
                Cell: ({ row }: any) => (
                    <button className="flex items-center gap-2 text-sm text-navy-700 hover:text-blue-500 dark:text-white">
                        <MdEdit className="h-5 w-5" />
                        View & Edit
                    </button>
                ),
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        nextPage,
        previousPage,
        state: { pageIndex },
        pageCount,
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-lg text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-navy-800">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table {...getTableProps()} className="w-full">
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()} className="border-b border-gray-200">
                                {headerGroup.headers.map((column) => (
                                    <th
                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                        className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                    >
                                        <div className="flex items-center gap-2">
                                            <>{column.render("Header")}</>
                                            <span>
                                                {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                    No customers found
                                </td>
                            </tr>
                        ) : (
                            page.map((row) => {
                                prepareRow(row);
                                return (
                                    <tr
                                        {...row.getRowProps()}
                                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-700"
                                    >
                                        {row.cells.map((cell) => (
                                            <td {...cell.getCellProps()} className="px-4 py-4">
                                                <>{cell.render("Cell")}</>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Page {pageIndex + 1} of {pageCount}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;
