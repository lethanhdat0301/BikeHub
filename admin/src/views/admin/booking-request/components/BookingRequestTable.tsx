import React, { useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { MdFilterList, MdCheckCircle, MdCancel } from "react-icons/md";
import UpdateBookingRequestModal from "./UpdateBookingModal";

type Props = {
    tableContent: any[];
    loading: boolean;
    onRefresh?: () => void;
};

const BookingRequestTable: React.FC<Props> = ({ tableContent, loading, onRefresh }) => {
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const data = React.useMemo(() => {
        if (!tableContent) return [];
        if (statusFilter === "All") return tableContent;
        return tableContent.filter((item) => item.status === statusFilter);
    }, [tableContent, statusFilter]);

    const handleUpdate = (booking: any) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const columns = React.useMemo(
        () => [
            {
                Header: "Booking ID",
                accessor: "id",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        BK{String(value).padStart(6, '0')}
                    </p>
                ),
            },
            {
                Header: "Customer",
                accessor: "name",
                Cell: ({ row }: any) => (
                    <div>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {row.original.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {row.original.email}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Contact Method",
                accessor: "contact_method",
                Cell: ({ value }: any) => (
                    <span className="text-sm text-navy-700 dark:text-white capitalize">
                        {value}
                    </span>
                ),
            },
            {
                Header: "Contact Details",
                accessor: "contact_details",
                Cell: ({ value }: any) => (
                    <p className="text-sm text-navy-700 dark:text-white">
                        {value}
                    </p>
                ),
            },
            {
                Header: "Motorbike",
                accessor: "Bike",
                Cell: ({ value }: any) => (
                    <div>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {value?.model || "N/A"}
                        </p>
                        {value?.license_plate && (
                            <p className="text-xs text-black-600 dark:text-black-400 font-medium">
                                {value.license_plate}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                Header: "Dealer",
                accessor: "Dealer",
                Cell: ({ value }: any) => (
                    <p className="text-sm text-navy-700 dark:text-white">
                        {value?.name || "N/A"}
                    </p>
                ),
            },
            {
                Header: "Rental Period",
                accessor: "start_date",
                Cell: ({ row }: any) => {
                    const start = row.original.start_date;
                    const end = row.original.end_date;
                    if (!start) return <p className="text-sm text-navy-700 dark:text-white">N/A</p>;

                    const startDate = new Date(start);
                    const endDate = end ? new Date(end) : null;

                    return (
                        <div className="text-sm text-navy-700 dark:text-white">
                            <p>{startDate.toLocaleDateString()}</p>
                            {endDate && <p>→ {endDate.toLocaleDateString()}</p>}
                        </div>
                    );
                },
            },
            {
                Header: "Price",
                accessor: "estimated_price",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {value ? `${Number(value).toLocaleString('vi-VN')} VNĐ` : "N/A"}
                    </p>
                ),
            },
            {
                Header: "Pickup Location",
                accessor: "pickup_location",
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
                    let colorClass = "bg-gray-100 text-gray-700";
                    if (value === "PENDING") colorClass = "bg-yellow-100 text-yellow-700";
                    if (value === "APPROVED") colorClass = "bg-green-100 text-green-700";
                    if (value === "REJECTED") colorClass = "bg-red-100 text-red-700";
                    if (value === "COMPLETED") colorClass = "bg-blue-100 text-blue-700";

                    return (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
                            {value}
                        </span>
                    );
                },
            },
            {
                Header: "Created",
                accessor: "created_at",
                Cell: ({ value }: any) => {
                    const date = new Date(value);
                    return (
                        <p className="text-sm text-navy-700 dark:text-white">
                            {date.toLocaleDateString()}
                        </p>
                    );
                },
            },
            {
                Header: "Actions",
                id: "actions",
                Cell: ({ row }: any) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleUpdate(row.original)}
                            className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                        >
                            <MdCheckCircle className="h-4 w-4" />
                            Update
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
            {selectedBooking && (
                <UpdateBookingRequestModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    booking={selectedBooking}
                    onSuccess={() => {
                        if (onRefresh) onRefresh();
                    }}
                />
            )}

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {["All", "PENDING", "APPROVED", "REJECTED", "COMPLETED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === status
                                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
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
                                        <>{column.render("Header")}</>
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
                                    className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-navy-700"
                                >
                                    {row.cells.map((cell) => (
                                        <td {...cell.getCellProps()} className="px-4 py-4">
                                            <>{cell.render("Cell")}</>
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {pageIndex * 10 + 1} to {Math.min((pageIndex + 1) * 10, data.length)} of{" "}
                    {data.length} results
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => previousPage()}
                        disabled={!canPreviousPage}
                        className={`rounded px-4 py-2 text-sm ${canPreviousPage
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => nextPage()}
                        disabled={!canNextPage}
                        className={`rounded px-4 py-2 text-sm ${canNextPage
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingRequestTable;
