export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalDocs, 
  entries = 10,
}) {
  return (
    <div className="flex items-center justify-end py-2">
      {/* Total records info */}
           {/* {totalDocs !== undefined && (
        <div className="text-sm text-gray-600 m-2">
          Showing{" "}
          <span className="font-medium text-gray-800">
            {(currentPage - 1) * entries + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-800">
            {Math.min(currentPage * entries, totalDocs)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-800">{totalDocs}</span> Entries
        </div>
      )} */}


      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={`px-2 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-blue-700 text-white cursor-pointer"
          }`}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-2 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-blue-700 text-white cursor-pointer"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
