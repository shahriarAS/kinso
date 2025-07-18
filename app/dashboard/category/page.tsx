import AddEditCategoryDrawer from './AddEditCategoryDrawer';
import CategoryFilters from './CategoryFilters';
import CategoryTable from './CategoryTable';

export default function Category() {
  return (
    <div className='h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-semibold'>Categories</h1>
        <AddEditCategoryDrawer />
      </div>
      {/* Filters */}
      <CategoryFilters />
      {/* Table */}
      <CategoryTable />
    </div>
  );
} 