import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Clock,
  ArrowRight,
  Layers,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardOverview({ onNavigateTab }) {
  const [timeRange, setTimeRange] = useState('7days'); // 'today' | '7days' | '30days'
  const [isSyncing, setIsSyncing] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  // Time-series chart datasets for different time intervals
  const chartDatasets = {
    today: [
      { label: '06:00', revenue: 3200, orders: 2, formattedRev: '₹3,200' },
      { label: '09:00', revenue: 8400, orders: 5, formattedRev: '₹8,400' },
      { label: '12:00', revenue: 14600, orders: 8, formattedRev: '₹14,600' },
      { label: '15:00', revenue: 21900, orders: 13, formattedRev: '₹21,900' },
      { label: '18:00', revenue: 36400, orders: 21, formattedRev: '₹36,400' },
      { label: '21:00', revenue: 44200, orders: 25, formattedRev: '₹44,200' },
      { label: '23:59', revenue: 48940, orders: 28, formattedRev: '₹48,940' },
    ],
    '7days': [
      { label: 'Mon', revenue: 34200, orders: 19, formattedRev: '₹34,200' },
      { label: 'Tue', revenue: 41800, orders: 24, formattedRev: '₹41,800' },
      { label: 'Wed', revenue: 38900, orders: 22, formattedRev: '₹38,900' },
      { label: 'Thu', revenue: 52400, orders: 29, formattedRev: '₹52,400' },
      { label: 'Fri', revenue: 68100, orders: 38, formattedRev: '₹68,100' },
      { label: 'Sat', revenue: 84300, orders: 46, formattedRev: '₹84,300' },
      { label: 'Sun', revenue: 92400, orders: 52, formattedRev: '₹92,400' },
    ],
    '30days': [
      { label: 'W1 (1-7)', revenue: 245000, orders: 138, formattedRev: '₹2,45,000' },
      { label: 'W2 (8-14)', revenue: 298000, orders: 164, formattedRev: '₹2,98,000' },
      { label: 'W3 (15-21)', revenue: 342000, orders: 192, formattedRev: '₹3,42,000' },
      { label: 'W4 (22-30)', revenue: 412000, orders: 236, formattedRev: '₹4,12,000' },
    ],
  };

  const currentData = chartDatasets[timeRange] || chartDatasets['7days'];
  const maxRevenue = Math.max(...currentData.map((d) => d.revenue)) * 1.15;

  // Category sales share data
  const categorySales = [
    { name: 'Compression Wear', units: 142, revenue: '₹1,84,600', percentage: 38, color: 'bg-neutral-900' },
    { name: 'Heavyweight Oversized Tees', units: 98, revenue: '₹1,46,900', percentage: 28, color: 'bg-red-600' },
    { name: 'Tactical Inseam Gym Shorts', units: 74, revenue: '₹81,300', percentage: 18, color: 'bg-neutral-700' },
    { name: 'Cargo Joggers & Pants', units: 46, revenue: '₹78,150', percentage: 11, color: 'bg-neutral-500' },
    { name: 'Stringers & Tanks', units: 24, revenue: '₹23,990', percentage: 5, color: 'bg-neutral-400' },
  ];

  // Sample recent orders list
  const recentOrders = [
    {
      id: 'ORD-98421',
      customer: 'Vikram Mehta',
      email: 'vikram.m@athlete.com',
      itemSummary: 'Acid Wash Heavyweight Oversized Tee (L) + 1 more',
      total: 2598,
      paymentMethod: 'UPI (PhonePe)',
      status: 'In Transit',
      date: 'Today, 11:30 AM',
    },
    {
      id: 'ORD-98420',
      customer: 'Aman Sharma',
      email: 'aman.sharma@gym.in',
      itemSummary: 'Pro Muscle-Lock Compression Shirt (M)',
      total: 1299,
      paymentMethod: 'Credit Card (HDFC)',
      status: 'Processing',
      date: 'Today, 09:15 AM',
    },
    {
      id: 'ORD-98419',
      customer: 'Rohan Deshmukh',
      email: 'rohan.d@gmail.com',
      itemSummary: 'Tapered Heavyweight Cargo Joggers (L)',
      total: 3697,
      paymentMethod: 'Cash on Delivery',
      status: 'Delivered',
      date: 'Yesterday, 04:45 PM',
    },
    {
      id: 'ORD-98418',
      customer: 'Karan Verma',
      email: 'karan.v@fitness.com',
      itemSummary: '5" Tactical Inseam Gym Shorts (M) x 2',
      total: 2198,
      paymentMethod: 'UPI (GPay)',
      status: 'Delivered',
      date: 'Yesterday, 01:20 PM',
    },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Live sales telemetry synchronized');
    }, 500);
  };

  // SVG dimensions for interactive area chart
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const points = currentData.map((d, index) => {
    const x = paddingX + (index / (currentData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.revenue / maxRevenue) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Generate smooth SVG curve path
  const generatePath = () => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const curvePath = generatePath();
  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="w-full space-y-5 font-sans">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 uppercase tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time sales velocity, fulfillment telemetry, and category performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Tabs */}
          <div className="flex items-center p-0.5 bg-neutral-100 rounded-sm border border-neutral-200 text-xs">
            {['today', '7days', '30days'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setHoveredPointIndex(null);
                }}
                className={`px-2.5 py-1 rounded-sm font-medium transition-colors cursor-pointer text-xs ${
                  timeRange === range
                    ? 'bg-white text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-700 hover:text-red-600 rounded-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin text-red-600' : 'text-neutral-500'}`} />
            <span className="hidden sm:inline">Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Gross Revenue */}
        <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">Gross Revenue</span>
            <div className="p-1.5 rounded-sm bg-neutral-100 text-neutral-800">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-900 tracking-tight">
              {timeRange === 'today' ? '₹48,940' : timeRange === '7days' ? '₹4,12,100' : '₹12,97,000'}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18.4% vs previous period</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">Total Orders</span>
            <div className="p-1.5 rounded-sm bg-neutral-100 text-neutral-800">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-900 tracking-tight">
              {timeRange === 'today' ? '28 Orders' : timeRange === '7days' ? '230 Orders' : '730 Orders'}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium mt-0.5">
              <Clock className="h-3 w-3 text-neutral-400" />
              <span>8 pending dispatch</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">Average Order Value</span>
            <div className="p-1.5 rounded-sm bg-neutral-100 text-neutral-800">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-900 tracking-tight">₹1,748</div>
            <div className="flex items-center gap-1 text-[11px] text-neutral-600 font-medium mt-0.5">
              <span className="text-red-600 font-medium">+4.2%</span>
              <span className="text-neutral-400">bundle rate</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white border border-neutral-200 rounded-sm p-4 space-y-2.5">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">Store Conversion</span>
            <div className="p-1.5 rounded-sm bg-neutral-100 text-neutral-800">
              <Zap className="h-3.5 w-3.5 text-red-600 fill-red-600" />
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-900 tracking-tight">4.62%</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
              <ArrowUpRight className="h-3 w-3" />
              <span>+0.8% prepaid boost</span>
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS ROW: 1. Interactive Revenue Velocity Chart + 2. Category Share Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* Main Interactive Revenue Graph (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-sm p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">
                  Revenue & Sales Velocity
                </h2>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Hover over data points to inspect detailed revenue timestamps
              </p>
            </div>

            {/* Live Point Hover Info Badge */}
            {hoveredPointIndex !== null ? (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-neutral-900 text-white rounded-sm text-xs font-medium">
                <span className="text-neutral-300">{points[hoveredPointIndex].label}:</span>
                <span className="text-white font-semibold">{points[hoveredPointIndex].formattedRev}</span>
                <span className="text-red-400 font-mono text-[10px]">({points[hoveredPointIndex].orders} orders)</span>
              </div>
            ) : (
              <div className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-neutral-400" />
                <span>Showing {timeRange === 'today' ? 'Hourly Today' : timeRange === '7days' ? 'Last 7 Days Trend' : 'Monthly Trend'}</span>
              </div>
            )}
          </div>

          {/* Responsive SVG Chart */}
          <div className="w-full pt-4 relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 sm:h-56 overflow-visible"
            >
              <defs>
                {/* Clean gradient fill under curve */}
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#f1f1f1"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </g>
                );
              })}

              {/* Shaded Area Under Curve */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Smooth Stroke Curve */}
              <path
                d={curvePath}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & Interactive Hover Targets */}
              {points.map((p, index) => {
                const isHovered = hoveredPointIndex === index;
                return (
                  <g
                    key={index}
                    onMouseEnter={() => setHoveredPointIndex(index)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="cursor-pointer"
                  >
                    {/* Vertical hover guide line */}
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={paddingY}
                        x2={p.x}
                        y2={svgHeight - paddingY}
                        stroke="#dc2626"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Outer glow circle on hover */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="7"
                        fill="#dc2626"
                        fillOpacity="0.2"
                      />
                    )}

                    {/* Main Dot */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? '4.5' : '3.5'}
                      fill="#ffffff"
                      stroke="#dc2626"
                      strokeWidth={isHovered ? '2.5' : '2'}
                      className="transition-all duration-150"
                    />

                    {/* X-Axis Label */}
                    <text
                      x={p.x}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      className={`text-[10px] font-sans transition-colors ${
                        isHovered ? 'fill-neutral-900 font-semibold' : 'fill-neutral-400'
                      }`}
                    >
                      {p.label}
                    </text>

                    {/* Invisible Larger Hit Target for easy hover on touch/mouse */}
                    <rect
                      x={p.x - 20}
                      y={paddingY}
                      width="40"
                      height={svgHeight - paddingY * 2}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Chart Metric Summary Footer */}
          <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-neutral-100 text-center text-xs">
            <div>
              <span className="text-[10px] uppercase text-neutral-400 block font-medium">Period High</span>
              <span className="font-semibold text-neutral-900">₹{Math.max(...currentData.map(d => d.revenue)).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-400 block font-medium">Avg Order Velocity</span>
              <span className="font-semibold text-neutral-900">{(currentData.reduce((a, b) => a + b.orders, 0) / currentData.length).toFixed(1)} / period</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-neutral-400 block font-medium">Prepaid Ratio</span>
              <span className="font-semibold text-emerald-600">82.4% Auto UPI</span>
            </div>
          </div>
        </div>

        {/* Category & Collection Performance Breakdown (1 Column) */}
        <div className="bg-white border border-neutral-200 rounded-sm p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-neutral-700" />
                <h2 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">
                  Category Share
                </h2>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">100% Vol</span>
            </div>

            {/* Progress distribution bar */}
            <div className="w-full h-2 rounded-xs overflow-hidden flex bg-neutral-100 my-3.5">
              {categorySales.map((cat, idx) => (
                <div
                  key={idx}
                  style={{ width: `${cat.percentage}%` }}
                  className={`${cat.color} h-full transition-all`}
                  title={`${cat.name}: ${cat.percentage}%`}
                />
              ))}
            </div>

            {/* Category breakdown items list */}
            <div className="space-y-3 pt-1">
              {categorySales.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-xs ${cat.color}`} />
                      <span className="font-medium text-neutral-800 text-[11px] truncate max-w-[140px]">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-neutral-900 text-xs">{cat.revenue}</span>
                      <span className="text-neutral-400 text-[10px] ml-1.5 font-mono">({cat.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-100 h-1 rounded-xs overflow-hidden">
                    <div
                      className={`h-full ${cat.color}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-sm text-center">
            <span className="text-[11px] text-neutral-500">
              Top Pick: <strong className="text-neutral-900 font-medium">Muscle Compression Tees</strong> leading sales
            </span>
          </div>
        </div>

      </div>

      {/* Recent Dispatches & Orders Table */}
      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-900">
              Recent Dispatches & Orders
            </h2>
            <p className="text-[11px] text-neutral-500">Latest customer orders requiring fulfillment</p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-neutral-600 hover:text-red-600 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                <th className="p-3 font-semibold text-[11px] uppercase tracking-wider">Order ID</th>
                <th className="p-3 font-semibold text-[11px] uppercase tracking-wider">Customer</th>
                <th className="p-3 font-semibold text-[11px] uppercase tracking-wider">Items</th>
                <th className="p-3 font-semibold text-[11px] uppercase tracking-wider">Payment</th>
                <th className="p-3 font-semibold text-[11px] uppercase tracking-wider">Amount</th>
                <th className="p-3 font-semibold text-[11px] uppercase tracking-wider">Status</th>
                <th className="p-3 font-semibold text-[11px] uppercase tracking-wider text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="p-3 font-mono font-medium text-neutral-900">
                    {ord.id}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-neutral-900">{ord.customer}</div>
                    <div className="text-[10px] text-neutral-400">{ord.email}</div>
                  </td>
                  <td className="p-3 text-neutral-600 max-w-xs truncate">
                    {ord.itemSummary}
                  </td>
                  <td className="p-3 text-neutral-600">
                    {ord.paymentMethod}
                  </td>
                  <td className="p-3 font-semibold text-neutral-900">
                    ₹{ord.total.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-medium ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'In Transit'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-3 text-right text-neutral-400 text-[11px]">
                    {ord.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
