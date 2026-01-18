import React, { useState } from "react";
import { useTable, usePagination, useSortBy } from "react-table";
import { MdAdd, MdMoreHoriz, MdVisibility } from "react-icons/md";
import ReferralHistoryModal from "./ReferralHistoryModal";

type Props = {
    tableContent: any[];
    loading: boolean;
};

const ReferrerTable: React.FC<Props> = ({ tableContent, loading }) => {
    const [selectedReferrer, setSelectedReferrer] = useState<{ id: number, name: string } | null>(null);

    const data = React.useMemo(() => {
        if (!tableContent) return [];
        if (Array.isArray(tableContent)) return tableContent;
        return [];
    }, [tableContent]);

    const columns = React.useMemo(
        () => [
            {
                Header: "Referrer",
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
                Header: "Total Earnings",
                accessor: "total_earnings",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {Number(value || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                ),
            },
            {
                Header: "Referral Count",
                accessor: "referral_count",
                Cell: ({ value }: any) => (
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {value || 0}
                    </p>
                ),
            },
            {
                Header: "Last Referral Date",
                accessor: "last_referral_date",
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedReferrer({ id: row.original.id, name: row.original.name })}
                            className="rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            title="View Referral History"
                        >
                            <MdVisibility className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-navy-700">
                            <MdMoreHoriz className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
                        Referrer List
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        A list of all referral partners and their performance.
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                    <MdAdd className="h-5 w-5" />
                    Add Referrer
                </button>
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
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    No referrers found
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
            {/* Referral History Modal */}
            <ReferralHistoryModal
                isOpen={!!selectedReferrer}
                onClose={() => setSelectedReferrer(null)}
                referrerId={selectedReferrer?.id || 0}
                referrerName={selectedReferrer?.name || ''}
            />        </div>
    );
};

export default ReferrerTable;
