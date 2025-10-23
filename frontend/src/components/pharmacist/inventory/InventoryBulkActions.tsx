// src/components/inventory/InventoryBulkActions.tsx
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';

interface Props {
  selectedItems: number[];
  filteredItems: any[];
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onBulkUpdate: () => void;
  onBulkDelete: () => void;
  bulkAction: 'none' | 'update' | 'delete';
  onBulkActionChange: (action: 'none' | 'update' | 'delete') => void;
}

export default function InventoryBulkActions({
  selectedItems,
  filteredItems,
  onSelectAll,
  onClearSelection,
  onBulkUpdate,
  onBulkDelete,
  bulkAction,
  onBulkActionChange
}: Props) {
  const allSelected = selectedItems.length === filteredItems.length && filteredItems.length > 0;

  return (
    <div className="card rounded-2xl p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">
            تم اختيار <span className="font-semibold">{selectedItems.length}</span> عنصر
          </span>
        </div>

        <Select
          value={bulkAction}
          onChange={(value) => onBulkActionChange(value as any)}
          options={[
            { value: 'none', label: 'اختر إجراء جماعي' },
            { value: 'update', label: 'تحديث الكمية' },
            { value: 'delete', label: 'حذف العناصر' },
          ]}
          className="min-w-[180px]"
        />

        {bulkAction === 'update' && (
          <Button onClick={onBulkUpdate} size="sm" className="text-sm">
            تطبيق التحديث
          </Button>
        )}

        {bulkAction === 'delete' && (
          <Button onClick={onBulkDelete} variant="danger" size="sm" className="text-sm">
            حذف العناصر
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-sm"
        >
          إلغاء التحديد
        </Button>
      </div>
    </div>
  );
}