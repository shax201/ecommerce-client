import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ColorsSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-[250px]" />
          </div>

          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Skeleton className="h-4 w-[40px]" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Skeleton className="h-4 w-[60px] ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="w-full flex justify-between items-center">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-8 w-[300px]" />
          </div>
        </div>
      </div>
    </div>
  )
}