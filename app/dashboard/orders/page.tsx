import AddEditOrderDrawer from './AddEditOrderDrawer';
import OrderFilters from './OrderFilters';
import OrderTable from './OrderTable';

export default function Orders() {
  return (
    <div className='h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-semibold'>Orders</h1>
        <AddEditOrderDrawer />
      </div>
      {/* Filters */}
      <OrderFilters />
      {/* Table */}
      <OrderTable />
    </div>
  );
} 