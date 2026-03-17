import React, { useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { useToast } from "@chakra-ui/react";
import CreateParkModal from "./CreateParkModal";
import EditParkModal from "./EditParkModal";

type Props = {
    tableContent: any[];
    loading: boolean;
    onRefresh: () => void;
};

const ParkTable: React.FC<Props> = ({ tableContent, loading, onRefresh }) => {
    const toast = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPark, setSelectedPark] = useState<any>(null);

    const handleEdit = (park: any) => {
        setSelectedPark(park);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (parkId: number) => {
        if (!window.confirm("Are you sure you want to delete this park?")) {
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}parks/park/${parkId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to delete park");
            }

            toast({
                title: "Park deleted successfully",
                status: "success",
                duration: 3000,
            });
            onRefresh();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete park",
                status: "error",
                duration: 3000,
            });
        }
    };
    const data = React.useMemo(() => {
        if (!tableContent) return [];
        if (Array.isArray(tableContent)) return tableContent;
        return [];
    }, [tableContent]);

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
                Header: "Park Name",
                accessor: "name",
                Cell: ({ row }: any) => (
                    <div className="flex items-center gap-3">
                        {row.original.image && (
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-200">
                                <img
                                    src={row.original.image}
                                    alt={row.original.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {row.original.name}
                        </p>
                    </div>
                ),
            },
            {
                Header: "Location",
                accessor: "location",
                Cell: ({ value }: any) => (
                    <p className="text-sm text-navy-700 dark:text-white">{value}</p>
                ),
            },
            {
                Header: "Bikes",
                accessor: "Bike",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-semibold text-blue-600">
                        {Array.isArray(value) ? value.length : 0} bikes
                    </p>
                ),
            },
            {
                Header: "Created At",
                accessor: "created_at",
                Cell: ({ value }: any) => {
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
                Header: "Actions",
                id: "actions",
                Cell: ({ row }: any) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(row.original)}
                            className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                        >
                            <MdEdit className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="flex items-center gap-1 rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                        >
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
                <div>
                    <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                        All Parks
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Total: {data.length} parks
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                    <MdAdd className="h-5 w-5" />
                    Add Park
                </button>
            </div>

            {/* Modals */}
            <CreateParkModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={onRefresh}
            />
            <EditParkModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                park={selectedPark}
                onSuccess={onRefresh}
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
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                    No parks found
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

export default ParkTable;
