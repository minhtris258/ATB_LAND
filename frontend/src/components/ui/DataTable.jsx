export default function DataTable({ columns, data = [], emptyText = 'Không có dữ liệu' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3.5 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row._id || row.id || rowIndex} className="hover:bg-slate-50/80">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-slate-700">
                    {col.render ? col.render(row) : row[col.accessor]}
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