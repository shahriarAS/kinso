import AddEditCustomerDrawer from './AddEditCustomerDrawer';
import CustomerFilters from './CustomerFilters';
import CustomerTable from './CustomerTable';

export default function Customers() {
  return (
    <div className='h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-semibold'>Customers</h1>
        <AddEditCustomerDrawer />
      </div>
      {/* Filters */}
      <CustomerFilters />
      {/* Table */}
      <CustomerTable />
    </div>
  );
} 