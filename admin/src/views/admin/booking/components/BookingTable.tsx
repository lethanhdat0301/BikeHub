import React, { useState } from "react";
import { useTable, usePagination, useSortBy, useGlobalFilter } from "react-table";
import { MdSearch, MdAdd, MdEdit } from "react-icons/md";
import UpdateBookingRequestModal from "../../booking-request/components/UpdateBookingModal";
import CreateBookingModal from "./CreateBookingModal";

type Props = {
    tableContent: any[];
    loading: boolean;
    onRefresh?: () => void;
};

const BookingTable: React.FC<Props> = ({ tableContent, loading, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const data = React.useMemo(() => {
        if (!tableContent) return [];
        if (Array.isArray(tableContent)) {
            let filtered = tableContent;

            // Filter by search term
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filtered = filtered.filter(
                    (item) =>
                        item.id?.toString().includes(searchTerm) ||
                        item.bookingId?.toLowerCase().includes(searchLower) ||
                        item.customer_name?.toLowerCase().includes(searchLower) ||
                        item.customer_phone?.toLowerCase().includes(searchLower)
                );
            }

            // Filter by status
            if (statusFilter !== "All") {
                filtered = filtered.filter((item) => item.status === statusFilter);
            }

            return filtered;
        }
        return [];
    }, [tableContent, searchTerm, statusFilter]);

    const columns = React.useMemo(
        () => [
            {
                Header: "Booking ID",
                accessor: "id",
                Cell: ({ row }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {row.original.bookingId || `#${row.original.id}`}
                    </p>
                ),
            },
            {
                Header: "Customer",
                accessor: "customer_name",
                Cell: ({ row }: any) => (
                    <div>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {row.original.customer_name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {row.original.customer_phone || "N/A"}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Vehicle",
                accessor: "vehicle_model",
                Cell: ({ row }: any) => (
                    <div>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {row.original.vehicle_model || "N/A"}
                        </p>
                        {row.original.vehicle_license_plate && (
                            <p className="text-xs text-black-600 dark:text-black-400 font-medium">
                                {row.original.vehicle_license_plate}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                Header: "Dealer",
                accessor: "dealer_name",
                Cell: ({ value }: any) => (
                    <p className="text-sm text-navy-700 dark:text-white">
                        {value || "N/A"}
                    </p>
                ),
            },
            {
                Header: "Rental Period",
                accessor: "rental_period",
                Cell: ({ row }: any) => {
                    const start = row.original.start_time
                        ? new Date(row.original.start_time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })
                        : "N/A";
                    const end = row.original.end_time
                        ? new Date(row.original.end_time).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })
                        : "N/A";
                    return (
                        <p className="text-sm text-navy-700 dark:text-white">
                            {start} - {end}
                        </p>
                    );
                },
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
                Header: "Status",
                accessor: "status",
                Cell: ({ value }: any) => {
                    const status = value?.toLowerCase() || 'pending';
                    let colorClass = "bg-gray-100 text-gray-700";
                    if (status === "confirmed" || status === "active") colorClass = "bg-green-100 text-green-700";
                    if (status === "pending") colorClass = "bg-yellow-100 text-yellow-700";
                    if (status === "completed" || status === "delivered" || status === "returned") colorClass = "bg-blue-100 text-blue-700";
                    if (status === "cancelled") colorClass = "bg-red-100 text-red-700";
                    if (status === "delivering") colorClass = "bg-orange-100 text-orange-700";

                    return (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${colorClass}`}>
                            {value || "Pending"}
                        </span>
                    );
                },
            },
            {
                Header: "Actions",
                id: "actions",
                Cell: ({ row }: any) => (
                    <button
                        onClick={() => {
                            setSelectedBooking(row.original);
                            setIsUpdateModalOpen(true);
                        }}
                        className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                        <MdEdit className="h-4 w-4" />
                        Update
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
                <p className="text-lg text-gray-500 dark:text-gray-400">Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-navy-800">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, name, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                    />
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                    <MdAdd className="h-5 w-5" />
                    Create Booking
                </button>
            </div>

            {/* Status Filters */}
            <div className="mb-6 flex gap-2">
                {["All", "Confirmed", "Delivering", "Delivered", "Returned"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === status
                            ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-navy-700 dark:text-gray-300"
                            }`}
                    >
                        {status}
                    </button>
                ))}
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
                                <td colSpan={7} className="py-8 text-center text-gray-500">
                                    {loading ? "Loading bookings..." : "No bookings found"}
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

            {/* Update Booking Modal */}
            <UpdateBookingRequestModal
                isOpen={isUpdateModalOpen}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedBooking(null);
                }}
                booking={selectedBooking}
                onSuccess={() => {
                    if (onRefresh) onRefresh();
                }}
            />

            {/* Create Booking Modal */}
            <CreateBookingModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    if (onRefresh) onRefresh();
                }}
            />
        </div>
    );
};

export default BookingTable;
