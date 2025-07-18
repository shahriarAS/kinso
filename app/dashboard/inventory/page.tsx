import AddEditProductDrawer from './AddEditProductDrawer'
import InventoryFilters from './InventoryFilters'
import InventoryTable from './InventoryTable'

type Props = {}

export default function Inventory({}: Props) {
  return (
    <div className='h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-semibold'>Inventory</h1>
        <AddEditProductDrawer />
      </div>
      {/* Filters */}
      <InventoryFilters />
      {/* Table */}
      <InventoryTable />
    </div>
  )
}