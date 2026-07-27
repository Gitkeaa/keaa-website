import { lazy, Suspense } from 'react';

// react-apexcharts pulls in the heavy apexcharts core, so it loads on demand. The chart boxes
// reserve their height (300px), so deferring it never shifts the dashboard layout.
const Chart = lazy(() => import('react-apexcharts'));

/**
 * Dashboard visualisations (ApexCharts). Two charts off the same /api/inquiries list the
 * dashboard already loads: monthly volume by channel, and the current pipeline split.
 *
 * Colours: the series palette is the brand categorical set, validated colourblind-safe with the
 * dataviz skill's checker (blue / amber / emerald / violet). The donut uses reserved STATUS
 * colours (each state its own hue) with value labels + a legend, so identity is never colour
 * alone. Axis/label text stays in ink tokens, never a series colour.
 */
const SERIES = ['#2F74B8', '#B45309', '#0E9F6E', '#7C3AED']; // fixed categorical order, never cycled
const INK = '#0A2342';
const MUTED = '#64748B';
const GRID = '#E2E8F0';

const STATUS_LABEL = {
  NEW: 'New', CONTACTED: 'Contacted', QUOTATION_SENT: 'Quotation Sent', FOLLOW_UP: 'Follow-up',
  NEGOTIATION: 'Negotiation', WON: 'Won', LOST: 'Lost', CLOSED: 'Closed',
};
const STATUS_COLOR = {
  NEW: '#2F74B8', CONTACTED: '#6366F1', QUOTATION_SENT: '#B45309', FOLLOW_UP: '#D97706',
  NEGOTIATION: '#7C3AED', WON: '#0E9F6E', LOST: '#DC2626', CLOSED: '#64748B',
};

function lastMonths(n) {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleString('en-GB', { month: 'short' }) });
  }
  return out;
}

export default function AdminCharts({ inquiries = [] }) {
  const months = lastMonths(6);
  const ym = (r) => String(r.createdAt || '').slice(0, 7);
  const typeOf = (r) => String(r.type || '').toUpperCase();

  // Channels in a stable order (known first, then any extras), capped at the 4-slot palette.
  const known = ['RFQ', 'CONTACT', 'EXPORT'];
  const extra = [...new Set(inquiries.map(typeOf).filter((t) => t && !known.includes(t)))];
  const types = [...known.filter((t) => inquiries.some((r) => typeOf(r) === t)), ...extra].slice(0, 4);
  const label = (t) => ({ RFQ: 'RFQ', CONTACT: 'Contact', EXPORT: 'Export' }[t] || t.charAt(0) + t.slice(1).toLowerCase());

  const trendSeries = types.length
    ? types.map((t) => ({ name: label(t), data: months.map((m) => inquiries.filter((r) => typeOf(r) === t && ym(r) === m.key).length) }))
    : [{ name: 'Inquiries', data: months.map((m) => inquiries.filter((r) => ym(r) === m.key).length) }];

  const trendOptions = {
    chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'inherit', foreColor: MUTED, animations: { speed: 350 } },
    colors: SERIES,
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 4, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['#fff'] }, // 2px surface gap between stacked segments
    grid: { borderColor: GRID, strokeDashArray: 4, xaxis: { lines: { show: false } }, padding: { left: 4, right: 4 } },
    xaxis: { categories: months.map((m) => m.label), axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: MUTED, fontSize: '12px' } } },
    yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => String(Math.round(v)), style: { colors: MUTED, fontSize: '12px' } } },
    legend: { show: types.length > 1, position: 'top', horizontalAlign: 'left', fontSize: '13px', labels: { colors: INK }, markers: { radius: 3 }, itemMargin: { horizontal: 10 } },
    tooltip: { theme: 'light' },
    fill: { opacity: 1 },
  };

  // Pipeline status split.
  const order = ['NEW', 'CONTACTED', 'QUOTATION_SENT', 'FOLLOW_UP', 'NEGOTIATION', 'WON', 'LOST', 'CLOSED'];
  const counts = {};
  inquiries.forEach((r) => { const s = String(r.status || '').toUpperCase(); if (s) counts[s] = (counts[s] || 0) + 1; });
  const statuses = order.filter((s) => counts[s]);
  const donutSeries = statuses.map((s) => counts[s]);
  const donutOptions = {
    chart: { type: 'donut', fontFamily: 'inherit', foreColor: MUTED },
    labels: statuses.map((s) => STATUS_LABEL[s] || s),
    colors: statuses.map((s) => STATUS_COLOR[s] || MUTED),
    stroke: { width: 2, colors: ['#fff'] }, // 2px surface ring between slices
    dataLabels: { enabled: true, formatter: (_v, o) => String(o.w.config.series[o.seriesIndex]), style: { fontSize: '12px', fontWeight: 700 }, dropShadow: { enabled: false } },
    legend: { position: 'bottom', fontSize: '13px', labels: { colors: INK }, markers: { radius: 3 }, itemMargin: { horizontal: 8, vertical: 2 } },
    plotOptions: { pie: { donut: { size: '62%', labels: { show: true, total: { show: true, label: 'Total', color: MUTED, fontSize: '13px', formatter: (w) => String(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) } } } } },
    tooltip: { theme: 'light' },
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="font-display text-base font-bold text-navy-900">Inquiries over time</h2>
        <p className="mt-0.5 text-sm text-slate-500">Monthly volume by channel, last 6 months.</p>
        {inquiries.length ? (
          <Suspense fallback={<div className="h-[300px]" />}>
            <Chart options={trendOptions} series={trendSeries} type="bar" height={300} />
          </Suspense>
        ) : <Empty />}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">Pipeline status</h2>
        <p className="mt-0.5 text-sm text-slate-500">Where inquiries currently sit.</p>
        {statuses.length ? (
          <Suspense fallback={<div className="h-[300px]" />}>
            <Chart options={donutOptions} series={donutSeries} type="donut" height={300} />
          </Suspense>
        ) : <Empty />}
      </div>
    </div>
  );
}

function Empty() {
  return <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">No data to chart yet.</div>;
}
