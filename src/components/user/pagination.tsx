import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
}

export function Pagination({ currentPage, totalPages, setCurrentPage }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <Button
        variant="outline"
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  )
}

