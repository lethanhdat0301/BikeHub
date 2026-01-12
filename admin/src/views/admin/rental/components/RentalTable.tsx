import React, { useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { MdAdd, MdEdit, MdDelete, MdCheckCircle } from "react-icons/md";
import UpdateRentalModal from "./UpdateRentalModal";
import DealerUpdateRentalModal from "./DealerUpdateRentalModal";

type Props = {
    tableContent: any[];
    loading: boolean;
    onRefresh?: () => void;
    userRole?: string; // 'admin' or 'dealer'
};

const RentalTable: React.FC<Props> = ({ tableContent, loading, onRefresh, userRole = 'admin' }) => {
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedRental, setSelectedRental] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const data = React.useMemo(() => {
        if (!tableContent) return [];
        if (Array.isArray(tableContent)) {
            if (statusFilter === "All") return tableContent;
            return tableContent.filter((item) => item.status === statusFilter);
        }
        return [];
    }, [tableContent, statusFilter]);

    const handleUpdate = (rental: any) => {
        setSelectedRental(rental);
        setIsModalOpen(true);
    };

    const columns = React.useMemo(
        () => [
            {
                Header: "Booking ID",
                accessor: "id",
                Cell: ({ row }: any) => {
                    // Use booking_request_id if available, otherwise use rental id
                    const bookingId = row.original.booking_request_id || row.original.id;
                    return (
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            BK{String(bookingId).padStart(6, '0')}
                        </p>
                    );
                },
            },
            {
                Header: "Customer",
                accessor: "User",
                Cell: ({ row }: any) => {
                    const user = row.original.User;
                    const contactName = row.original.contact_name;
                    const contactEmail = row.original.contact_email;
                    const contactPhone = row.original.contact_phone;

                    console.log('Customer data:', {
                        user,
                        contactName,
                        contactEmail,
                        contactPhone,
                    });

                    return (
                        <div>
                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                                {user ? user.name : contactName || "Guest"}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {user ? user.email : contactEmail || "N/A"}
                            </p>
                            {!user && contactPhone && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {contactPhone}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: "Motorbike",
                accessor: "Bike",
                Cell: ({ value }: any) => (
                    <div>
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {value?.model || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {value?.location || ""}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Period",
                accessor: "start_time",
                Cell: ({ row }: any) => {
                    const start = new Date(row.original.start_time);
                    const end = row.original.end_time ? new Date(row.original.end_time) : null;
                    return (
                        <div>
                            <p className="text-sm text-navy-700 dark:text-white">
                                {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                {end && ` - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </p>
                        </div>
                    );
                },
            },
            {
                Header: "Price",
                accessor: "price",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        `${(value || 0).toLocaleString('vi-VN')} VNĐ`
                    </p>
                ),
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: ({ value }: any) => {
                    let colorClass = "bg-gray-100 text-gray-700";
                    if (value === "confirmed") colorClass = "bg-green-100 text-green-700";
                    if (value === "pending") colorClass = "bg-yellow-100 text-yellow-700";
                    if (value === "cancelled") colorClass = "bg-red-100 text-red-700";
                    if (value === "completed") colorClass = "bg-blue-100 text-blue-700";

                    return (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${colorClass}`}>
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
                        <div>
                            <p className="text-sm text-navy-700 dark:text-white">
                                {date.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {date.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
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
            {selectedRental && (
                userRole === 'dealer' ? (
                    <DealerUpdateRentalModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedRental(null);
                        }}
                        rental={selectedRental}
                        onSuccess={() => {
                            if (onRefresh) onRefresh();
                        }}
                    />
                ) : (
                    <UpdateRentalModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedRental(null);
                        }}
                        rental={selectedRental}
                        onSuccess={() => {
                            if (onRefresh) onRefresh();
                        }}
                    />
                )
            )}

            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {["All", "pending", "active", "completed", "cancelled"].map((status) => (
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
                                <td colSpan={8} className="py-8 text-center text-gray-500">
                                    No rentals found
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

export default RentalTable;
