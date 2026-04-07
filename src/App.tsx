/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ReactNode } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  CreditCard, 
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { orders } from './data';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#141414', '#4a4a4a', '#8e9299', '#d1d1d1', '#E4E3E0'];

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');

  // Filtered data
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.product.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProduct = selectedProduct === 'All' || order.product === selectedProduct;
      return matchesSearch && matchesProduct;
    });
  }, [searchTerm, selectedProduct]);

  // KPIs
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((acc, curr) => acc + curr.price, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Find top product
    const productCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      productCounts[o.product] = (productCounts[o.product] || 0) + 1;
    });
    const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { totalRevenue, totalOrders, avgOrderValue, topProduct };
  }, [filteredOrders]);

  // Chart Data: Sales Trend
  const salesTrendData = useMemo(() => {
    const daily: Record<string, number> = {};
    filteredOrders.forEach(o => {
      daily[o.date] = (daily[o.date] || 0) + o.price;
    });
    return Object.entries(daily)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  // Chart Data: Product Performance
  const productPerformanceData = useMemo(() => {
    const performance: Record<string, number> = {};
    filteredOrders.forEach(o => {
      performance[o.product] = (performance[o.product] || 0) + o.price;
    });
    return Object.entries(performance)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  // Chart Data: Payment Methods
  const paymentMethodData = useMemo(() => {
    const methods: Record<string, number> = {};
    filteredOrders.forEach(o => {
      methods[o.paymentMethod] = (methods[o.paymentMethod] || 0) + 1;
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const uniqueProducts = ['All', ...Array.from(new Set(orders.map(o => o.product)))];

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      {/* Sidebar / Header Navigation */}
      <header className="sticky top-0 z-50 bg-sky-50/80 backdrop-blur-md border-b border-[#141414]/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Vanguard Analytics</h1>
            <p className="text-xs text-[#141414]/50 font-mono uppercase tracking-widest">Order Management System v2.4</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" size={16} />
            <input 
              type="text" 
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 bg-[#F5F5F4] border-none rounded-full text-sm focus:ring-2 focus:ring-[#141414]/10 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 border border-white shadow-sm overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto space-y-8">
        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#141414]/60" />
            <span className="text-sm font-medium">Filter by Product:</span>
            <select 
              className="bg-white border border-[#141414]/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/5"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="text-sm font-mono text-[#141414]/50">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            icon={<DollarSign size={20} />}
            trend="+12.5%"
            isPositive={true}
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders.toString()} 
            icon={<ShoppingCart size={20} />}
            trend="+5.2%"
            isPositive={true}
          />
          <StatCard 
            title="Avg. Order Value" 
            value={`$${stats.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            icon={<TrendingUp size={20} />}
            trend="-1.2%"
            isPositive={false}
          />
          <StatCard 
            title="Top Product" 
            value={stats.topProduct} 
            icon={<Package size={20} />}
            subValue="By volume"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trend Chart */}
          <div className="lg:col-span-2 bg-sky-50 p-6 rounded-2xl border border-[#141414]/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Revenue Trend</h3>
                <p className="text-sm text-[#141414]/50">Daily performance overview</p>
              </div>
              <div className="flex items-center gap-2 bg-[#F5F5F4] p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-medium bg-white rounded shadow-sm">Daily</button>
                <button className="px-3 py-1 text-xs font-medium text-[#141414]/40">Weekly</button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#14141460' }}
                    tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#14141460' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => [`$${val.toFixed(2)}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#141414" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-sky-50 p-6 rounded-2xl border border-[#141414]/5 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight mb-2">Payment Distribution</h3>
            <p className="text-sm text-[#141414]/50 mb-8">Preferred transaction methods</p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Performance Bar Chart */}
          <div className="lg:col-span-1 bg-sky-50 p-6 rounded-2xl border border-[#141414]/5 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight mb-2">Product Performance</h3>
            <p className="text-sm text-[#141414]/50 mb-8">Revenue by product category</p>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productPerformanceData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#14141410" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#14141480' }}
                    width={120}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F5F5F4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="#141414" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-sky-50 rounded-2xl border border-[#141414]/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#141414]/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Recent Transactions</h3>
                <p className="text-sm text-[#141414]/50">Detailed order history</p>
              </div>
              <button className="text-xs font-semibold uppercase tracking-wider text-[#141414]/60 hover:text-[#141414] transition-colors">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F5F4]/50">
                    <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-widest text-[#141414]/40 italic">Order ID</th>
                    <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-widest text-[#141414]/40 italic">Product</th>
                    <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-widest text-[#141414]/40 italic">Date</th>
                    <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-widest text-[#141414]/40 italic text-right">Price</th>
                    <th className="px-6 py-4 text-[11px] font-mono uppercase tracking-widest text-[#141414]/40 italic">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/5">
                  {filteredOrders.slice(0, 10).map((order, idx) => (
                    <tr key={`${order.orderNumber}-${idx}`} className="hover:bg-[#F5F5F4]/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 font-mono text-xs font-medium">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm font-medium">{order.product}</td>
                      <td className="px-6 py-4 text-sm text-[#141414]/60">{format(parseISO(order.date), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 text-sm font-mono text-right font-semibold">${order.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#F5F5F4] text-[10px] font-bold uppercase tracking-wider text-[#141414]/60">
                          {order.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-[#141414]/5 p-8 text-center">
        <p className="text-sm text-[#141414]/40 font-mono">© 2025 Vanguard Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
}

function StatCard({ title, value, icon, trend, isPositive, subValue }: { 
  title: string; 
  value: string; 
  icon: ReactNode; 
  trend?: string; 
  isPositive?: boolean;
  subValue?: string;
}) {
  return (
    <div className="bg-sky-50 p-6 rounded-2xl border border-[#141414]/5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F5F5F4] flex items-center justify-center text-[#141414]/60 group-hover:bg-[#141414] group-hover:text-white transition-colors">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-[#141414]/50 mb-1">{title}</p>
        <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
        {subValue && <p className="text-[10px] uppercase tracking-widest font-mono text-[#141414]/30 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}


