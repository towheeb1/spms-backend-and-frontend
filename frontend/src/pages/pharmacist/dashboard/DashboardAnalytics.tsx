import DashboardCharts from '../../../components/pharmacist/pharmacist-dashboard/DashboardCharts';
import { fetchPharmacistDashboard, type PharmacistDashboard } from '../../../services/pharmacist';
import React, { useEffect, useState } from 'react';

const DashboardAnalytics: React.FC = () => {
  const [data, setData] = useState<PharmacistDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchPharmacistDashboard({ period: '7d' });
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to load dashboard analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">تحليلات المبيعات</h1>
       {data?.analytics && <DashboardCharts analytics={data.analytics} />}
    </div>
  );
};

export default DashboardAnalytics;
