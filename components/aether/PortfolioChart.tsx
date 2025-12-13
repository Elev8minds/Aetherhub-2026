import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import GlassCard from './GlassCard';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface PortfolioChartProps {
  assets: Array<{
    name: string;
    symbol: string;
    value: number;
    change24h: number;
  }>;
}

const COLORS = ['#00f0ff', '#ff006e', '#39ff14', '#9d4edd', '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'];

const PortfolioChart: React.FC<PortfolioChartProps> = ({ assets }) => {
  const [chartType, setChartType] = useState<'allocation' | 'performance'>('allocation');
  const [timeframe, setTimeframe] = useState('7d');
  const { hideBalances } = useAppContext();

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);

  const pieData = assets.slice(0, 8).map((asset, i) => ({
    name: asset.symbol,
    value: asset.value,
    percentage: ((asset.value / totalValue) * 100).toFixed(1),
    color: COLORS[i % COLORS.length],
  }));

  // Generate mock performance data
  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: totalValue * (0.9 + Math.random() * 0.2) * (1 + i * 0.005),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg p-3">
          <p className="text-white font-semibold">{data.name || data.date}</p>
          <p className={cn(
            "text-cyan-400 font-mono",
            hideBalances && "blur-sm select-none"
          )}>
            {hideBalances ? '••••••' : `$${data.value?.toLocaleString() || payload[0].value?.toLocaleString()}`}
          </p>
          {data.percentage && !hideBalances && (
            <p className="text-gray-500 text-sm">{data.percentage}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatChange = (value: number) => {
    if (hideBalances) {
      return '••••';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <GlassCard glowColor="cyan" className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Portfolio Analytics</h3>
            <p className="text-xs text-gray-500">Real-time allocation & performance</p>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setChartType('allocation')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              chartType === 'allocation'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-500 hover:text-white'
            )}
          >
            Allocation
          </button>
          <button
            onClick={() => setChartType('performance')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              chartType === 'performance'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-500 hover:text-white'
            )}
          >
            Performance
          </button>
        </div>
      </div>

      {/* Timeframe Selector (for performance) */}
      {chartType === 'performance' && (
        <div className="flex items-center gap-1 sm:gap-2 mb-4 overflow-x-auto pb-1">
          {['24h', '7d', '30d', '90d', '1y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                timeframe === tf
                  ? 'bg-white/10 text-white'
                  : 'text-gray-600 hover:text-gray-400'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="min-h-[280px] sm:min-h-[250px]">
        {chartType === 'allocation' ? (
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            {/* Pie Chart - Full width on mobile, half on desktop */}
            <div className={cn(
              "w-full md:w-1/2 flex justify-center",
              hideBalances && "opacity-30"
            )}>
              <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    className="sm:!innerRadius-[60px] sm:!outerRadius-[100px]"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Below pie on mobile, side by side on desktop */}
            <div className="w-full md:flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-1 gap-2 sm:gap-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-2 py-1.5 sm:bg-transparent sm:px-0 sm:py-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs sm:text-sm text-gray-400 truncate">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-xs sm:text-sm font-medium text-white",
                        hideBalances && "blur-sm select-none"
                      )}>
                        {hideBalances ? '••••' : `${item.percentage}%`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={cn(hideBalances && "opacity-30")}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 10 }}
                  tickFormatter={(value) => hideBalances ? '••••' : `$${(value / 1000).toFixed(0)}k`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00f0ff"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t border-white/10">
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">24h Change</p>
          <div className={cn(
            "flex items-center gap-1 text-green-400",
            hideBalances && "blur-sm select-none"
          )}>
            {!hideBalances && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="font-semibold text-xs sm:text-sm">{formatChange(3.24)}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">7d Change</p>
          <div className={cn(
            "flex items-center gap-1 text-green-400",
            hideBalances && "blur-sm select-none"
          )}>
            {!hideBalances && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="font-semibold text-xs sm:text-sm">{formatChange(12.8)}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1">30d Change</p>
          <div className={cn(
            "flex items-center gap-1 text-red-400",
            hideBalances && "blur-sm select-none"
          )}>
            {!hideBalances && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="font-semibold text-xs sm:text-sm">{formatChange(-2.1)}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default PortfolioChart;
