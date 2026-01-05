import React, { useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { MdAdd, MdEdit, MdDelete, MdFilterList } from "react-icons/md";
import AddBikeModal from "./AddBikeModal";

type Props = {
    tableContent: any[];
    loading: boolean;
    onRefresh?: () => void;
};

const BikeTable: React.FC<Props> = ({ tableContent, loading, onRefresh }) => {
    const [statusFilter, setStatusFilter] = useState("All");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const data = React.useMemo(() => {
        if (!tableContent) return [];
        if (Array.isArray(tableContent)) {
            if (statusFilter === "All") return tableContent;
            return tableContent.filter((item) => item.status === statusFilter);
        }
        return [];
    }, [tableContent, statusFilter]);

    const columns = React.useMemo(
        () => [
            {
                Header: "ID",
                accessor: "id",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        #{value}
                    </p>
                ),
            },
            {
                Header: "Bike Model",
                accessor: "model",
                Cell: ({ row }: any) => (
                    <div className="flex items-center gap-3">
                        {row.original.image && (
                            <div className="h-12 w-16 overflow-hidden rounded-lg bg-gray-200">
                                <img
                                    src={row.original.image}
                                    alt={row.original.model}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                                {row.original.model}
                            </p>
                            {row.original.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {row.original.description.substring(0, 50)}...
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: ({ value }: any) => {
                    let colorClass = "bg-gray-100 text-gray-700";
                    if (value === "available") colorClass = "bg-green-100 text-green-700";
                    if (value === "rented") colorClass = "bg-blue-100 text-blue-700";
                    if (value === "maintenance") colorClass = "bg-yellow-100 text-yellow-700";

                    return (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${colorClass}`}>
                            {value}
                        </span>
                    );
                },
            },
            {
                Header: "Price/Day",
                accessor: "price",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        ${value?.toFixed(2) || "0.00"}
                    </p>
                ),
            },
            {
                Header: "Location",
                accessor: "location",
                Cell: ({ value }: any) => (
                    <p className="text-sm text-navy-700 dark:text-white">
                        {value || "N/A"}
                    </p>
                ),
            },
            {
                Header: "Park ID",
                accessor: "park_id",
                Cell: ({ value }: any) => (
                    <p className="text-sm text-navy-700 dark:text-white">
                        #{value}
                    </p>
                ),
            },
            {
                Header: "Rating",
                accessor: "rating",
                Cell: ({ value }: any) => (
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {value?.toFixed(1) || "0.0"}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Actions",
                id: "actions",
                Cell: ({ row }: any) => (
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                            <MdEdit className="h-4 w-4" />
                            Edit
                        </button>
                        <button className="flex items-center gap-1 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600">
                            <MdDelete className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
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
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {["All", "available", "rented", "maintenance"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${statusFilter === status
                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                    <MdAdd className="h-5 w-5" />
                    Add Bike
                </button>
            </div>

            {/* Add Bike Modal */}
            <AddBikeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    if (onRefresh) onRefresh();
                }}
            />

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
                                <td colSpan={8} className="py-8 text-center text-gray-500">
                                    No bikes found
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

export default BikeTable;
