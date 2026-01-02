import React, { useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { AiOutlinePlus } from "react-icons/ai";
import { MdFilterList } from "react-icons/md";
import CreateDealerModal from "./CreateDealerModal";

type Props = {
    tableContent: any[];
    loading: boolean;
    onRefresh?: () => void;
};

const DealerTable: React.FC<Props> = ({ tableContent, loading, onRefresh }) => {
    const [filterTab, setFilterTab] = useState("All");
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const data = React.useMemo(() => {
        const validData = Array.isArray(tableContent) ? tableContent : [];
        if (filterTab === "All") return validData;
        return validData.filter((item) => item.status === filterTab);
    }, [tableContent, filterTab]);

    const columns = React.useMemo(
        () => [
            {
                Header: "Dealer",
                accessor: "name",
                Cell: ({ row }: any) => (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                            {row.original.image ? (
                                <img
                                    src={row.original.image}
                                    alt={row.original.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-300 text-gray-600">
                                    {row.original.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                                {row.original.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {row.original.location || "N/A"}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                Header: "Contact",
                accessor: "email",
                Cell: ({ row }: any) => (
                    <div>
                        <p className="text-sm text-navy-700 dark:text-white">
                            {row.original.email}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {row.original.phone || "N/A"}
                        </p>
                        <p className="text-xs text-blue-500">
                            {row.original.telegram || "N/A"}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: ({ value }: any) => (
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${value === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                            }`}
                    >
                        {value}
                    </span>
                ),
            },
            {
                Header: "Vehicles",
                accessor: "vehicle_count",
                Cell: ({ value }: any) => (
                    <div className="flex items-center gap-2">
                        <svg
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {value} vehicles
                        </p>
                    </div>
                ),
            },
            {
                Header: "Total Revenue",
                accessor: "total_revenue",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        ${value?.toFixed(2) || "0.00"}
                    </p>
                ),
            },
            {
                Header: "Platform Fee (Est.)",
                accessor: "platform_fee",
                Cell: ({ value }: any) => (
                    <p className="text-sm text-navy-700 dark:text-white">
                        ${value?.toFixed(2) || "0.00"} per month
                    </p>
                ),
            },
            {
                Header: "Current Debt",
                accessor: "current_debt",
                Cell: ({ value }: any) => (
                    <p className={`text-sm font-bold ${value > 0 ? "text-red-500" : "text-green-500"}`}>
                        ${value?.toFixed(2) || "0.00"}
                    </p>
                ),
            },
            {
                Header: "Last Payment",
                accessor: "last_payment_date",
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
        state: { pageIndex, pageSize },
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
            <CreateDealerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    if (onRefresh) onRefresh();
                }}
            />

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowDateFilter(!showDateFilter)}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-700 dark:text-gray-300"
                    >
                        <MdFilterList className="h-5 w-5" />
                        Filter by payment date
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                        <AiOutlinePlus className="h-5 w-5" />
                        Add Dealer
                    </button>
                    <button
                        onClick={() => setFilterTab("All")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${filterTab === "All"
                            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterTab("Active")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${filterTab === "Active"
                            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300"
                            }`}
                    >
                        Active
                    </button>
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
                                            {column.render("Header")}
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
                        {page.map((row) => {
                            prepareRow(row);
                            return (
                                <tr
                                    {...row.getRowProps()}
                                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-navy-700"
                                >
                                    {row.cells.map((cell) => (
                                        <td {...cell.getCellProps()} className="px-4 py-4">
                                            {cell.render("Cell")}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
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

export default DealerTable;
