import RepairRecordsList from '@/components/repairs/RepairRecordsList';

export default function RepairPage() {
  return (
    <div>
      <h1 className="page-title">報修紀錄</h1>
      <RepairRecordsList sheetName="總表" />
    </div>
  );
}
