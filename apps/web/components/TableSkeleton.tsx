type TableSkeletonProps = {
  columns: number;
  rows?: number;
};

export const TableSkeleton = ({ columns, rows = 5 }: TableSkeletonProps) => (
  <div className="table-card">
    <div className="border-b border-border px-5 py-4">
      <div className="skeleton h-4 w-40 rounded-md" />
      <div className="skeleton mt-2 h-3 w-72 rounded-md" />
    </div>
    <div className="table-wrap">
      <table className="min-w-full">
        <thead className="bg-[rgba(15,23,42,0.03)]">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-5 py-3">
                <div className="skeleton h-3 w-20 rounded-md" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-border">
              {Array.from({ length: columns }).map((_, columnIndex) => (
                <td key={`${rowIndex}-${columnIndex}`} className="px-5 py-4">
                  <div className="skeleton h-4 w-full rounded-md" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
