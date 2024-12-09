import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import Loading from "~/components/loading"
import Table from "~/components/table"
import { useDeleteProduct } from "~/hooks/products/useDeleteProduct.hook"
import { useGetProducts } from "~/hooks/products/useGetProducts.hook"
import useDebounce from "~/hooks/useDebounce"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { CreateProductForm } from "./create-product-form"
import { UpdateProductForm } from "./update-product-form"
import { useInsertProduct } from "~/hooks/products/useCreateProduct.hook"
import { InsertProduct } from "~/utils/schema"

const Products = () => {
  const [searchParams] = useSearchParams()
  const params = Object.fromEntries(searchParams.entries())
  const { mutate: deleteProduct } = useDeleteProduct()
  const { mutate: insertProduct } = useInsertProduct()
  const [page, setPage] = useState(params.page ? parseInt(params.page) : 1)
  const [search, setSearch] = useState(params.search || "")
  const debouncedInputValue = useDebounce(search, 300)
  const [actionSheet, setActionSheet] = useState(0) // 0: default 1: add, 2: edit
  const navigate = useNavigate()
  const { data, isLoading } = useGetProducts(page, debouncedInputValue)

  const handleDelete = (ids: number[]) => {
    deleteProduct(ids)
  }

  const handleEdit = (data: Partial<InsertProduct>) => {}

  const handleInsert = (data: InsertProduct) => {
    insertProduct(data)
  }

  const handleSearch = (searchValue: string) => {
    const updatedParams = new URLSearchParams(searchParams)
    if (searchValue.length === 0) {
      updatedParams.delete("search")
    } else {
      updatedParams.set("search", searchValue)
    }
    setPage(1)
    setSearch(searchValue)
    navigate(`?${updatedParams.toString()}`)
  }

  const handleChangePage = (pageNumber: number) => {
    const updatedParams = new URLSearchParams(searchParams)
    if (pageNumber === 1) {
      updatedParams.delete("page")
    } else {
      updatedParams.set("page", pageNumber.toString())
    }
    setPage(pageNumber)
    navigate(`?${updatedParams.toString()}`)
  }

  if (isLoading) return <Loading />

  return (
    <div className="w-full p-4">
      <Table
        columnsTitle={[
          "name",
          "description",
          "image",
          "price",
          "stock",
          "category",
          "brand"
        ]}
        textConfirm="Are you sure you want to delete this product?"
        totalPages={data?.data.totalPages || 1}
        page={page}
        dataRow={data?.data.items || []}
        title="List Product"
        searchValue={search}
        onActionSheet={setActionSheet}
        onDelete={handleDelete}
        onChangePage={handleChangePage}
        onSearch={handleSearch}
      />

      {!!actionSheet && (
        <Sheet open={!!actionSheet} onOpenChange={() => setActionSheet(0)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {actionSheet === 1 ? "Insert New Product" : "Edit Product"}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8">
              {actionSheet === 1 && (
                <CreateProductForm onInsert={handleInsert} />
              )}
              {actionSheet === 2 && <UpdateProductForm />}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

export default Products