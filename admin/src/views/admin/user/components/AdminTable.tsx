import React, { useState } from "react";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from "react-table";
import { AiFillEdit, AiFillDelete, AiOutlinePlus } from "react-icons/ai";
import DrawerEdit from "./DrawerEdit";
import ModalCreate from "./ModelCreate";
import useAuth from "utils/auth/AuthHook";

type ColumnHeader = {
  id: string;
  title: string;
};

type Props = {
  tableContent: any[];
  tableHeader: ColumnHeader[];
  moduleName: string;
};

const AdminTable: React.FC<Props> = ({
  tableHeader,
  tableContent,
  moduleName,
}) => {
  // Ensure data is always an array (API may return an object or { data: [...] })
  const data = React.useMemo(() => {
    if (Array.isArray(tableContent)) return tableContent;
    if (tableContent && Array.isArray((tableContent as any).data)) return (tableContent as any).data;
    return [];
  }, [tableContent]);
  const columns = React.useMemo(
    () =>
      tableHeader.map((header) => ({
        Header: header.title,
        accessor: header.id,
        Cell: (cellInfo: { value: any; row?: any }) => {
          const value = cellInfo.value;
          // Custom renderers
          if (header.id === "created_at" || header.id === "updated_at" || header.id === "last_rental_date") {
            const date = value ? new Date(value) : null;
            return (
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                {date ? date.toLocaleDateString() : "-"}
              </p>
            );
          }

          if (header.id === "image") {
            return (
              <img
                src={value || ""}
                alt="img"
                className="h-12 w-12 rounded object-cover"
              />
            );
          }

          if (header.id === "status") {
            const s = value || "-";
            const normalized = String(s).toLowerCase();
            const statusMap: Record<string, string> = {
              // Rentals statuses
              confirmed: "bg-blue-100 text-blue-800",
              delivering: "bg-yellow-100 text-yellow-800",
              delivered: "bg-green-100 text-green-800",
              returned: "bg-gray-100 text-gray-800",
              // Fallbacks / other entities
              available: "bg-green-100 text-green-800",
              active: "bg-green-100 text-green-800",
              rented: "bg-yellow-100 text-yellow-800",
              maintenance: "bg-red-100 text-red-800",
              out_of_stock: "bg-red-100 text-red-800",
            };

            const bgClass = statusMap[normalized] ?? "bg-gray-100 text-gray-800";
            return (
              <span
                className={`inline-block ${bgClass} rounded px-2 py-1 text-sm font-semibold`}
              >
                {s}
              </span>
            );
          }

          if (header.id === "vehicles" || header.id === "total_rentals") {
            return (
              <p className="text-sm font-bold text-navy-700 dark:text-white">{Number(value) || 0}</p>
            );
          }

          if (["total_revenue", "platform_fee_est", "current_debt", "total_spent"].includes(header.id)) {
            if (value === undefined || value === null || value === "-") return <p className="text-sm font-bold text-navy-700 dark:text-white">-</p>;
            const num = Number(value);
            if (isNaN(num)) return <p className="text-sm font-bold text-navy-700 dark:text-white">{String(value)}</p>;
            return <p className="text-sm font-bold text-navy-700 dark:text-white">${num.toFixed(2)}</p>;
          }

          if (header.id === "price") {
            const num = Number(value);
            return (
              <p className="text-sm font-bold text-navy-700 dark:text-white">{isNaN(num) ? '-' : `$${num.toFixed(2)}`}</p>
            );
          }

          if (header.id === "average_rating") {
            const num = Number(value);
            return (
              <p className="text-sm font-bold text-navy-700 dark:text-white">{isNaN(num) ? '-' : num.toFixed(1)}</p>
            );
          }

          return (
            <p className="text-sm font-bold text-navy-700 dark:text-white">
              {value}
            </p>
          );
        },
      })),
    [tableHeader]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageCount,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = useTable(
    { columns, data, initialState: { sortBy: [{ id: "created_at", desc: true }] } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  // eslint-disable-next-line
  const [editData, setEditData] = useState(null);
  const { user } = useAuth();

  const handleEdit = (row: any) => {
    setEditData({ module: moduleName, id: row.id });
  };

  const handleClose = () => {
    setEditData(null);
  };

  const handleDelete = async (row: any) => {
    // prevent non-admin from deleting rentals
    if (moduleName === 'rental' && user?.role !== 'admin') {
      alert('Only admins can delete bookings');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${moduleName} with ID: ${row.id} ?`
    );
    if (confirmDelete) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}${moduleName}s/${moduleName}/${row.id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        // console.log("-response------------")
        // console.log(response)
        // console.log("-------------")
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  return (
    <div className="h-full w-full px-6 pb-6 sm:overflow-x-auto">
      <div className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          {moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s Table
        </div>
        {!(moduleName === 'rental' && user?.role !== 'admin') && (
          <ModalCreate module={moduleName}>
            <button className="flex items-center gap-1 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-400">
              <AiOutlinePlus />
              Create
            </button>
          </ModalCreate>
        )}
      </div>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table {...getTableProps()} className="w-full">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="!border-px !border-gray-400"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="cursor-pointer border-b-[1px] border-gray-200 pb-2 pr-4 pt-4 text-start"
                  >
                    <div className="flex items-center justify-between text-md dark:text-white">
                      <span>{column.render("Header") as any}</span>
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="text-left dark:text-white">Actions</th>
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="min-w-[150px] border-white/0 py-3 pr-4 dark:text-red-500"
                    >
                      {cell.render("Cell") as any}
                    </td>
                  ))}
                  <td className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(row.original)}
                      className="flex items-center gap-1 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-400"
                    >
                      <AiFillEdit />
                      Edit
                    </button>
                    {!(moduleName === 'rental' && user?.role !== 'admin') && (
                      <button
                        onClick={() => handleDelete(row.original)}
                        className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-white hover:bg-red-400 disabled:cursor-not-allowed"
                      >
                        <AiFillDelete />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <DrawerEdit
        key={editData?.id}
        isOpen={!!editData}
        onClose={() => {
          handleClose();
        }}
        data={editData}
      />
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-lg dark:text-white">
          <b>
            {pageIndex + 1} / {pageCount}
          </b>
        </span>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminTable;
