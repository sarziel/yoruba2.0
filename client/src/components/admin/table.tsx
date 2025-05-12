import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Column {
  key: string;
  header: string;
  cell?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>
                {column.header}
              </TableHead>
            ))}
            {(onEdit || onDelete) && (
              <TableHead>Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-4">
                Carregando...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-4">
                Nenhum registro encontrado
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.cell ? column.cell(row) : row[column.key]}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {onEdit && (
                        <Button 
                          variant="ghost" 
                          className="text-primary hover:text-primary-light p-1 h-auto"
                          onClick={() => onEdit(row)}
                        >
                          <span className="material-icons">edit</span>
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-900 p-1 h-auto"
                          onClick={() => onDelete(row)}
                        >
                          <span className="material-icons">delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{data.length > 0 ? (page - 1) * 10 + 1 : 0}</span> a <span className="font-medium">{Math.min(page * 10, (page - 1) * 10 + data.length)}</span> de <span className="font-medium">{totalPages * 10}</span> resultados
          </p>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => page > 1 && onPageChange(page - 1)} 
                className={page === 1 ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <PaginationItem key={i}>
                  <Button 
                    variant={pageNumber === page ? 'default' : 'outline'}
                    className="w-10 h-10 p-0"
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext 
                onClick={() => page < totalPages && onPageChange(page + 1)} 
                className={page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default DataTable;
