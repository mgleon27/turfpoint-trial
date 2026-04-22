"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";
import { CartesianGrid, AreaChart, Area } from "recharts";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { BarChart, Bar, LabelList } from "recharts";

import OwnerMobileNav from "@/components/OwnerMobileNav";
import OwnerMobileHeader from "@/components/OwnerMobileHeader";

type Booking = {
  price: number;
  booking_date: string;
  booked_by: string;
  start_time: string;
  turf_id: string;
};

type RevenueData = {
  date?: string;
  hour?: string;
  revenue: number;
};


type ChartClickState = {
  activePayload?: {
    payload: {
      index: number;
    };
  }[];
};

export default function OwnerAnalysis() {
  const { user } = useUser();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [range, setRange] = useState<"today" | "week" | "month">("today");

  const [turfs, setTurfs] = useState<{ id: string; name: string }[]>([]);
  const [selectedTurf, setSelectedTurf] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);




  // ================= LOAD =================
  const load = async () => {
  if (!user) return;

  // 🔹 Get turfs
  const { data: turfData } = await supabase
    .from("turfs")
    .select("id, name")
    .eq("owner_id", user.id);

  setTurfs(turfData || []);

  if (turfData && turfData.length > 0) {
    setSelectedTurf((prev) => prev || turfData[0].id);
  }

  // 🔹 Get bookings
  const { data } = await supabase
    .from("bookings")
    .select("price, booking_date, booked_by, start_time, turf_id");

  setBookings(data || []);
};

  useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    await load();
  };

  fetchData();
}, [user]);

  const today = new Date().toISOString().split("T")[0];

  const now = new Date();

  // ✅ TODAY
  const getLocalDate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

const todayStr = getLocalDate(new Date());

  // ✅ WEEK (Monday → Today)
  const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // ✅ MONTH (1st → Today)
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // ================= CALCULATIONS =================

const todayBookings = bookings.filter(
  (b) => b.booking_date === todayStr
);

const weekBookings = bookings.filter((b) => {
  const d = new Date(b.booking_date + "T00:00:00");
  return d >= monday && d <= now;
});

const monthBookings = bookings.filter((b) => {
  const d = new Date(b.booking_date + "T00:00:00");
  return d >= firstDayOfMonth && d <= now;
});

  const calcRevenue = (list: Booking[]) =>
    list.reduce((s, b) => s + (b.price || 0), 0);

  const todayRevenue = calcRevenue(todayBookings);
  const weekRevenue = calcRevenue(weekBookings);
  const monthRevenue = calcRevenue(monthBookings);

  const onlineCount = bookings.filter(b => b.booked_by === "online").length;
  const manualCount = bookings.filter(b => b.booked_by !== "online").length;


  // 📊 GROUP BOOKINGS BY DATE (for line chart)
type RevenueData = {
  date: string;
  revenue: number;
};


const getDates = (type: "today" | "week" | "month") => {
  const today = new Date();
  const dates: string[] = [];

  let days = 1;
  if (type === "week") days = 7;
  if (type === "month") days = 30;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);

    dates.push(d.toISOString().split("T")[0]);
  }

  return dates;
};

const dates = getDates(range);

const getHourlyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return hours.map((h) => {
    const hourBookings = bookings.filter((b) => {
      if (b.booking_date !== today) return false;

      const hour = new Date(`1970-01-01T${b.start_time}`).getHours();
      return hour === h;
    });

    const revenue = hourBookings.reduce(
      (s, b) => s + (b.price || 0),
      0
    );

    return {
      hour: `${String(h).padStart(2, "0")}:00`,
      revenue,
    };
  });
};

const last7Days = getDates("week");



const revenueData = (
  range === "today"
    ? getHourlyData().map((d) => ({
        hour: d.hour,
        date: "",
        revenue: d.revenue,
      }))
    : dates.map((date) => {
        const dayBookings = bookings.filter(
          (b) => b.booking_date === date
        );

        const revenue = dayBookings.reduce(
          (sum, b) => sum + (b.price || 0),
          0
        );

        return {
          hour: "",
          date,
          revenue,
        };
      })
);




const pieData = [
  { name: "Online", value: onlineCount },
  { name: "Manual", value: manualCount },
];

const COLORS = ["#16a34a", "#ef4444"];







 const getHeatmapData = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const matrix = days.map((day, dayIndex) => {
    return hours.map((hour) => {
      const count = bookings.filter((b) => {
        const date = new Date(b.booking_date);
        const bookingDay = date.getDay();

        const bookingHour = new Date(
          `1970-01-01T${b.start_time}`
        ).getHours();

        return (
  bookingDay === dayIndex &&
  bookingHour === hour &&
  b.turf_id === selectedTurf
);
      }).length;

      return count;
    });
  });

  return { days, hours, matrix };
};




 const heatmapData = useMemo(() => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const matrix = days.map((day, dayIndex) =>
    hours.map((hour) => {
      return bookings.filter((b) => {
        const date = new Date(b.booking_date);
        const bookingDay = date.getDay();

        const bookingHour = new Date(`1970-01-01T${b.start_time}`).getHours();

        return (
          bookingDay === dayIndex &&
          bookingHour === hour &&
          b.turf_id === selectedTurf
        );
      }).length;
    })
  );

  return { days, hours, matrix };
}, [bookings, selectedTurf]);






const { days, hours, matrix } = heatmapData;




const getColor = (value: number) => {
  if (value === 0) return "bg-gray-100";
  if (value < 2) return "bg-green-200";
  if (value < 4) return "bg-green-300";
  if (value < 6) return "bg-green-400";
  return "bg-green-600";
};



const last7DaysData = last7Days.map((date) => {
  const dayBookings = bookings.filter((b) => b.booking_date === date);

  const revenue = dayBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  return {
    date,
    revenue,
    bookings: dayBookings.length,
  };
});



const totalRevenue7Days = last7DaysData.reduce((s, d) => s + d.revenue, 0);
const totalBookings7Days = last7DaysData.reduce((s, d) => s + d.bookings, 0);

const avgRevenue = Math.round(totalRevenue7Days / 7);
const avgBookings = Math.round(totalBookings7Days / 7);



// ✅ THIS WEEK (Mon → Today already exists as monday → now)

// ✅ LAST WEEK (previous Monday → Sunday)
const lastWeekStart = new Date(monday);
lastWeekStart.setDate(monday.getDate() - 7);

const lastWeekEnd = new Date(monday);
lastWeekEnd.setDate(monday.getDate() - 1);
lastWeekEnd.setHours(23, 59, 59, 999);

// ✅ WEEK BEFORE LAST
const prevWeekStart = new Date(lastWeekStart);
prevWeekStart.setDate(lastWeekStart.getDate() - 7);

const prevWeekEnd = new Date(lastWeekStart);
prevWeekEnd.setDate(lastWeekStart.getDate() - 1);
prevWeekEnd.setHours(23, 59, 59, 999);



// 🔹 THIS WEEK
const thisWeekBookings = bookings.filter((b) => {
  const d = new Date(b.booking_date + "T00:00:00");
  return d >= monday && d <= now;
});

// 🔹 LAST WEEK
const lastWeekBookings = bookings.filter((b) => {
  const d = new Date(b.booking_date + "T00:00:00");
  return d >= lastWeekStart && d <= lastWeekEnd;
});

// 🔹 WEEK BEFORE LAST
const prevWeekBookings = bookings.filter((b) => {
  const d = new Date(b.booking_date + "T00:00:00");
  return d >= prevWeekStart && d <= prevWeekEnd;
});


const thisWeekRevenue = calcRevenue(thisWeekBookings);
const lastWeekRevenue = calcRevenue(lastWeekBookings);
const prevWeekRevenue = calcRevenue(prevWeekBookings);

const thisWeekCount = thisWeekBookings.length;
const lastWeekCount = lastWeekBookings.length;



const getGrowth = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
};



// This week vs last week
const thisWeekGrowth = getGrowth(thisWeekRevenue, lastWeekRevenue);

// Last week vs previous week
const lastWeekGrowth = getGrowth(lastWeekRevenue, prevWeekRevenue);




const barData = last7DaysData.map((d, i) => ({
  index: i, // ⭐ IMPORTANT
  name: new Date(d.date)
    .toLocaleDateString("en-US", { weekday: "short" })
    .charAt(0),
  value: d.revenue,
}));



  // ================= UI =================

  return (
    <div className="min-h-screen bg-white pt-3 pb-20">

      <OwnerMobileHeader />
      <OwnerMobileNav />

      <div className="px-4">

        {/* ================= TOP CARDS ================= */}
        <div className="grid grid-cols-2 gap-3 mt-3">

          {/* Revenue */}
          <div className="bg-green-100 rounded-lg p-3 shadow-md border border-gray-300">
            <p className="font-medium font-sans text-gray-900 text-base">Revenue</p>
            <p className="text-sm mt-1 font-medium font-sans text-gray-600 -ml-1">Today :<span className="text-black pl-8"> ₹{todayRevenue}/- </span></p>
            <p className="text-sm font-medium font-sans text-gray-600 -ml-1"> This Week :<span className="text-black pl-1"> ₹{weekRevenue}/-</span></p>
            <p className="text-sm font-medium font-sans text-gray-600 -ml-1">This Month :<span className="text-black "> ₹{monthRevenue}/-</span></p>
          </div>

          {/* Bookings */}
          <div className="bg-green-200 rounded-lg p-3 shadow-md border border-gray-300">
            <p className="font-medium font-sans text-gray-800 text-base">Bookings</p>
            <p className="text-sm mt-1 font-medium font-sans text-gray-600">Today : <span className="text-black pl-10.5">{todayBookings.length}</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Week : <span className="text-black pl-3">{weekBookings.length}</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Month : <span className="text-black pl-2">{monthBookings.length}</span></p>
          </div>


          {/* This Week */}
          <div className="bg-green-300 rounded-lg p-3 shadow-md border border-gray-300">
  <p className="font-medium font-sans text-gray-800 text-base">This Week</p>

  <p className="text-sm mt-1 text-gray-600">
    Bookings : <span className="text-black pl-2">{thisWeekCount}</span>
  </p>

  <p className="text-sm text-gray-600">
    Revenue : <span className="text-black pl-2">₹{thisWeekRevenue}</span>
  </p>


  <p className="text-sm text-gray-600">
    Growth : <span className={`text-sm pl-4.5 ${thisWeekGrowth >= 0 ? "text-green-700" : "text-red-600"}`}> {thisWeekGrowth}%</span>
  </p>

  </div>





          {/* Past Week */}
          <div className="bg-green-400 rounded-lg p-3 shadow-md border border-gray-300">
  <p className="font-medium font-sans text-gray-800 text-base">Past Week</p>

  <p className="text-sm mt-1 text-gray-600">
    Bookings : <span className="text-black pl-1.5">{lastWeekCount}</span>
  </p>

  <p className="text-sm text-gray-600">
    Revenue : <span className="text-black pl-2">₹{lastWeekRevenue}</span>
  </p>

  <p className="text-sm text-gray-600">
    Growth : <span className={`text-sm pl-4.5 ${lastWeekGrowth >= 0 ? "text-green-700" : "text-red-600"}`}> {lastWeekGrowth}%</span>
  </p>
</div>

        </div>

        {/* ================= ORDERS ================= */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium font-sans text-black">Orders</p>
            
            <div className="flex gap-2">

  {(["today", "week", "month"] as const).map((r) => (
  <button
    key={r}
    onClick={() => setRange(r)}
    className={`px-2 py-0.5 text-sm rounded-full border font-sans font-normal capitalize ${
      range === r
        ? "bg-black text-white"
        : "bg-white text-black"
    }`}
  >
    {r}
  </button>
))}

</div>


          </div>

          {/* CHART PLACEHOLDER */}
          

<div className="border rounded-xl mt-3 h-44 p-2 font-sans font-medium">
  <ResponsiveContainer width="100%" height="100%">
  <AreaChart data={revenueData} margin={{ top: 20, right: 13 , left: -7, bottom: -10 }} >

    {/* Gradient */}
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
      </linearGradient>
    </defs>

    {/* Grid */}
    <CartesianGrid strokeDasharray="3 3" vertical={false} />

    {/* X Axis */}
    <XAxis
  dataKey={range === "today" ? "hour" : "date"}
  tickFormatter={(d: string) => {
    if (range === "today") return d;

    const date = new Date(d);

    if (range === "week") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    return date.getDate().toString();
  }}
  tick={{ fontSize: 10 }}
/>

    {/* Y Axis */}
    <YAxis
  tick={{ fontSize: 10 }}
  width={45}
  tickFormatter={(value) => {
    if (value >= 1000) return `₹${value / 1000}k`;
    return `₹${value}`;
  }}
/>

    {/* Tooltip */}
    <Tooltip
      formatter={(value) => `₹${value}`}
      labelFormatter={(label) => {
  if (range === "today") return label;
  return new Date(label).toDateString();
}}
    />

    {/* Area */}
    <Area
      type="monotone"
      dataKey="revenue"
      stroke="#16a34a"
      fill="url(#colorRevenue)"
      strokeWidth={2}
      isAnimationActive
      animationDuration={800}
    />

  </AreaChart>
</ResponsiveContainer>
</div>



        </div>

        {/* ================= PEAK ================= */}
        <div className="mt-6 border rounded-xl p-3">
          <div className="flex justify-between items-center">
            <p className="font-medium text-base text-black font-sans">Peak Timings</p>
            <select
  value={selectedTurf}
  onChange={(e) => setSelectedTurf(e.target.value)}
  className="border rounded-full px-2 py-0.5 text-sm font-sans font-normal text-black"
>
  {turfs.map((t) => (
    <option key={t.id} value={t.id}>
      {t.name}
    </option>
  ))}
</select>
          </div>

          <div className="mt-4">

  {/* HOURS */}
  <div className="grid grid-cols-[40px_repeat(24,1fr)] mb-1">
    <div></div>
    {hours.map((h) => (
      <div key={h} className="text-[8px] text-center text-gray-900 font-sans font-medium">
        {h + 1}
      </div>
    ))}
  </div>

  {/* GRID */}
  {matrix.map((row, i) => (
    <div
      key={i}
      className="grid grid-cols-[40px_repeat(24,1fr)] mb-[2px] items-center"
    >

      {/* DAY */}
      <div className="text-[10px] text-gray-800 font-sans font-medium">
        {days[i]}
      </div>

      {/* CELLS */}
      {row.map((value, j) => (
        <div
          key={j}
          className={`aspect-square rounded-[2px] ${getColor(value)} mx-[1px]`}
          title={`${days[i]} ${j}:00 → ${value}`}
        />
      ))}

    </div>
  ))}

</div>


<div className="flex gap-3 mt-3 text-[10px] items-center text-black font-sans font-medium">
  <span>Low</span>
  <div className="w-3 h-3 bg-gray-100" />
  <div className="w-3 h-3 bg-green-200" />
  <div className="w-3 h-3 bg-green-400" />
  <div className="w-3 h-3 bg-green-600" />
  <span>High</span>
</div>
        </div>

        {/* ================= SECOND ROW ================= */}
        <div className="grid grid-cols-2 gap-3 mt-5">

          <div className="border rounded-xl p-3">
            <div>
            <p className="font-medium font-sans text-black text-base">Daily Average</p>
            <p className="font-medium font-sans text-black text-[9px]/3">(Past 7 days)</p> 
            </div>
            <p className="text-sm mt-1 font-semibold text-black font-sans">
  ₹{avgRevenue}
</p>
<p className="text-[11px] text-gray-500 font-medium font-sans">
  Avg {avgBookings} bookings/day
</p>

            



<ResponsiveContainer width="100%" height={150} >
  <BarChart 
  data={barData}
  margin={{ top: 30 }} >
    <YAxis hide domain={[0, "dataMax + 20"]} />
    <XAxis
      dataKey="name"
      tick={{ fontSize: 10 }}
      axisLine={false}
      tickLine={false}
    />

    <Bar
  dataKey="value"
  radius={[4, 4, 0, 0]}
  onClick={(data, index) => {
    setActiveIndex(index);
  }}
>
  {barData.map((entry, index) => (
    <Cell
      key={index}
      fill={index === activeIndex ? "#166534" : "#16a34a"}
    />
  ))}

  <LabelList
  dataKey="value"
  content={(props) => {
    const { x, y, width, value, index } = props;

    if (Number(index) !== activeIndex) return null;

    const cx = (Number(x) || 0) + (Number(width) || 0) / 2;
    const cy = Math.max((Number(y) || 0) - 10, 10);

    return (
      <g>
        {/* Bubble background */}
        <rect
          x={cx - 22}
          y={cy - 16}
          width={44}
          height={18}
          rx={6}
          fill="#1ba91b"
          opacity={0.95}
        />

        {/* Text */}
        <text
          x={cx}
          y={cy - 3}
          textAnchor="middle"
          className=" text-white font-sans  text-[9px] font-semibold"
        >
          ₹{Number(value).toLocaleString()}
        </text>

        {/* Small triangle pointer */}
        <path
          d={`M ${cx - 5} ${cy} L ${cx + 5} ${cy} L ${cx} ${cy + 6} Z`}
          fill="#1ba91b"
        />
      </g>
    );
  }}
/>
</Bar>
  </BarChart>
</ResponsiveContainer>

          </div>

          <div className="border rounded-xl p-3">
            <p className="font-medium font-sans text-black text-base">Portal Analysis</p>

            <div className="h-24 mt-7 flex items-center justify-center">
              
              

              



<ResponsiveContainer width="100%" height={145}>
  <PieChart>
    <Pie
      data={pieData}
      dataKey="value"
      outerRadius={65}
    >
      {pieData.map((entry, index) => (
        <Cell key={index} fill={COLORS[index]} />
      ))}
    </Pie>
  </PieChart>
</ResponsiveContainer>




            </div>

            <div className="text-[13px] mt-8 text-black font-sans font-medium space-y-1">

  <div className="flex justify-between items-center">
    <div className="flex gap-1 items-center">
      <div className="h-2.5 w-2.5 rounded-full bg-red-700" />
      <p>Manual Bookings</p>
    </div>
    <p className="text-gray-800">{manualCount}</p>
  </div>

  <div className="flex justify-between items-center">
    <div className="flex gap-1 items-center">
      <div className="h-2.5 w-2.5 rounded-full bg-green-700" />
      <p>Online Bookings</p>
    </div>
    <p className="text-gray-800">{onlineCount}</p>
  </div>

</div>
          </div>

        </div>

        {/* ================= RATINGS ================= */}
    

      </div>
    </div>
  );
}