import HistoricoSidebar from '@/components/HistoricoSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <HistoricoSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
