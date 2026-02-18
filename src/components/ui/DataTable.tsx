import React from 'react';
import clsx from 'clsx';

export interface Column<T> {
    header: string;
    accessor: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    keyField: keyof T;
}

function DataTable<T extends Record<string, any>>({ data, columns, onRowClick, keyField }: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={clsx("px-6 py-4 font-semibold tracking-wider", col.className)}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                                No matching records found.
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={String(item[keyField])}
                                onClick={() => onRowClick && onRowClick(item)}
                                className={clsx(
                                    "group transition-colors",
                                    onRowClick ? "cursor-pointer hover:bg-slate-50" : ""
                                )}
                            >
                                {columns.map((col, idx) => (
                                    <td key={idx} className={clsx("px-6 py-4 whitespace-nowrap text-slate-700", col.className)}>
                                        {col.accessor(item)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
