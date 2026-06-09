"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Package, ShoppingCart, Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import { SetAdminHeader } from "@/lib/adminHeaderContext";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytics is accessible to all ADMINs

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          adminService.getStats(),
          adminService.getSalesChart(),
        ]);
        setStats(statsRes.data.data);
        setChartData(chartRes.data.data);
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600 w-8 h-8" /></div>;
  }

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <SetAdminHeader 
        title="Advanced Analytics" 
        subtitle="In-depth metrics and revenue reporting" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue", value: formatPrice(stats?.revenue || 0), icon: <TrendingUp size={20} className="text-emerald-500" /> },
          { label: "Total Orders", value: stats?.orders || 0, icon: <ShoppingCart size={20} className="text-indigo-500" /> },
          { label: "Total Products", value: stats?.products || 0, icon: <Package size={20} className="text-amber-500" /> },
          { label: "Registered Customers", value: stats?.customers || 0, icon: <Users size={20} className="text-blue-500" /> },
        ].map((stat, i) => (
          <div key={i} className="card p-5 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-slate-900 mb-6">30-Day Revenue Trend</h3>
        
        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <BarChart3 size={48} className="mb-2 opacity-20" />
            <p>No sales data for the last 30 days.</p>
          </div>
        ) : (
          <div className="h-80 flex items-end gap-2">
            {chartData.map((day, i) => {
              const heightPercentage = Math.max((day.revenue / maxRevenue) * 100, 2); // min 2% height
              return (
                <div key={i} className="relative flex-1 group h-full flex flex-col justify-end">
                  <div
                    className="w-full bg-indigo-200 hover:bg-indigo-500 transition-colors rounded-t-sm"
                    style={{ height: `${heightPercentage}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-32">
                    <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-xl text-center">
                      <p className="font-bold">{day.date}</p>
                      <p className="text-indigo-200">{formatPrice(day.revenue)}</p>
                      <p className="text-slate-400">{day.orders} orders</p>
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Traffic Sources</h3>
          <div className="flex items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            Google Analytics Integration Pending
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Top Performing Products</h3>
          <div className="flex items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            Order Item Aggregation Pending
          </div>
        </div>
      </div>
    </div>
  );
}
