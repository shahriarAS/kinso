import AddEditWarehouseDrawer from './AddEditWarehouseDrawer';
import WarehouseFilters from './WarehouseFilters';
import WarehouseTable from './WarehouseTable';

export default function Warehouse() {
  return (
    <div className='h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-semibold'>Warehouses</h1>
        <AddEditWarehouseDrawer />
      </div>
      {/* Filters */}
      <WarehouseFilters />
      {/* Table */}
      <WarehouseTable />
    </div>
  );
} 