"use client";

import { useEffect, useState } from "react";
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
import { BarChart, Bar } from "recharts";

import OwnerMobileNav from "@/components/OwnerMobileNav";
import OwnerMobileHeader from "@/components/OwnerMobileHeader";

type Booking = {
  price: number;
  booking_date: string;
  booked_by: string;
  start_time: string;
};

type RevenueData = {
  date?: string;
  hour?: string;
  revenue: number;
};

export default function OwnerAnalysis() {
  const { user } = useUser();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [range, setRange] = useState<"today" | "week" | "month">("today");

  // ================= LOAD =================
  const load = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("bookings")
      .select("price, booking_date, booked_by, start_time");

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

  // ================= CALCULATIONS =================

  const todayBookings = bookings.filter(b => b.booking_date === today);
  const weekBookings = bookings; // simplify for now
  const monthBookings = bookings;

  const calcRevenue = (list: Booking[]) =>
    list.reduce((s, b) => s + (b.price || 0), 0);

  const todayRevenue = calcRevenue(todayBookings);
  const weekRevenue = calcRevenue(weekBookings);
  const monthRevenue = calcRevenue(monthBookings);

  const onlineCount = bookings.filter(b => b.booked_by === "online").length;
  const manualCount = bookings.filter(b => b.booked_by !== "online").length;

  const slotFillRate = Math.round((todayBookings.length / 24) * 100);


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




const barData = bookings.slice(0, 7).map((b, i) => ({
  name: i,
  value: b.price,
}));




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

        return bookingDay === dayIndex && bookingHour === hour;
      }).length;

      return count;
    });
  });

  return { days, hours, matrix };
};

const { days, hours, matrix } = getHeatmapData();


const getColor = (value: number) => {
  if (value === 0) return "bg-gray-100";
  if (value < 2) return "bg-green-200";
  if (value < 4) return "bg-green-300";
  if (value < 6) return "bg-green-400";
  return "bg-green-600";
};




  // ================= UI =================

  return (
    <div className="min-h-screen bg-white pt-3">

      <OwnerMobileHeader />
      <OwnerMobileNav />

      <div className="px-4">

        {/* ================= TOP CARDS ================= */}
        <div className="grid grid-cols-2 gap-3 mt-3">

          {/* Revenue */}
          <div className="bg-green-100 rounded-lg p-3 shadow-md border border-gray-300">
            <p className="font-medium font-sans text-gray-800 text-base">Revenue</p>
            <p className="text-sm mt-1 font-medium font-sans text-gray-600">Today :<span className="text-black pl-9"> ₹{todayRevenue}/- </span></p>
            <p className="text-sm font-medium font-sans text-gray-600"> This Week :<span className="text-black pl-1.5"> ₹{weekRevenue}/-</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Month :<span className="text-black pl-0.5"> ₹{monthRevenue}/-</span></p>
          </div>

          {/* Bookings */}
          <div className="bg-green-100 rounded-lg p-3 shadow-md border border-gray-300">
            <p className="font-medium font-sans text-gray-800 text-base">Bookings</p>
            <p className="text-sm mt-1 font-medium font-sans text-gray-600">Today : <span className="text-black pl-10.5">{todayBookings.length}</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Week : <span className="text-black pl-3">{weekBookings.length}</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Month : <span className="text-black pl-2">{monthBookings.length}</span></p>
          </div>


          {/* Growth */}
          <div className="bg-green-100 rounded-lg p-3 shadow-md border border-gray-300">
            <p className="font-medium font-sans text-gray-800 text-base">Growth %</p>
            <p className="text-sm mt-1 font-medium font-sans text-gray-600">Today : <span className="text-green-800 pl-10">+5%</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Week : <span className="text-red-600 pl-3">-2%</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Month : <span className="text-red-600 pl-2">-2%</span></p>
          </div>

          {/* Slot Fill */}
          <div className="bg-green-100 rounded-lg p-3 shadow-md border border-gray-300">
            <p className="font-medium font-sans text-gray-800 text-base">Slot fill Rate %</p>
            <p className="text-sm mt-1 font-medium font-sans text-gray-600">Today :<span className="text-green-800 pl-10"> {slotFillRate}% </span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Week :<span className="text-green-800 pl-2.5"> 15%</span></p>
            <p className="text-sm font-medium font-sans text-gray-600">This Month :<span className="text-green-800 pl-1.5"> 15%</span></p>
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
    className={`px-3 py-1 text-sm rounded-full border ${
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

          <div className="flex gap-3 mt-2 text-sm">
            <p className="flex items-center gap-1 text-green-600">
              ● Online
            </p>
            <p className="flex items-center gap-1 text-red-500">
              ● Offline
            </p>
          </div>

          {/* CHART PLACEHOLDER */}
          

<div className="border rounded-xl mt-3 h-44 p-2">
  <ResponsiveContainer width="100%" height="100%">
  <AreaChart data={revenueData}>

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
    <YAxis hide />

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
            <p className="font-medium">Peak Timings</p>
            <select className="border rounded-full px-2 py-1 text-sm">
              <option>Turf 1</option>
            </select>
          </div>

          <div className="mt-4">

  {/* HOURS */}
  <div className="flex ml-10 mb-1">
    {hours.map((h) => (
      <div key={h} className="w-[12px] text-[9px] text-center text-gray-500">
        {h + 1}
      </div>
    ))}
  </div>

  {/* GRID */}
  {matrix.map((row, i) => (
    <div key={i} className="flex items-center mb-[2px]">

      {/* DAY */}
      <div className="w-10 text-[10px] text-gray-600">
        {days[i]}
      </div>

      {/* CELLS */}
      <div className="flex gap-[2px]">
        {row.map((value, j) => (
          <div
            key={j}
            className={`w-[12px] h-[12px] rounded-[2px] ${getColor(value)}`}
            title={`${days[i]} ${j}:00 → ${value}`}
          />
        ))}
      </div>

    </div>
  ))}

</div>
<div className="flex gap-3 mt-3 text-[10px] items-center">
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
            <p className="font-medium font-sans text-black text-base">Daily Average</p>
            <p className="text-sm mt-1">₹12000 (15 bookings)</p>

            



<ResponsiveContainer width="100%" height={100}>
  <BarChart data={barData}>
    <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>


          </div>

          <div className="border rounded-xl p-3">
            <p className="font-medium font-sans text-black text-base">Portal Analysis</p>

            <div className="h-24 mt-2 flex items-center justify-center">
              
              

              



<ResponsiveContainer width="100%" height={120}>
  <PieChart>
    <Pie
      data={pieData}
      dataKey="value"
      outerRadius={50}
    >
      {pieData.map((entry, index) => (
        <Cell key={index} fill={COLORS[index]} />
      ))}
    </Pie>
  </PieChart>
</ResponsiveContainer>




            </div>

            <div className="text-sm mt-2 text-black font-sans font-medium">
              <div className="flex gap-1 items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-700" />
                  <p>Manual Bookings</p>
              </div>

              <div className="flex gap-1 items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-700" />
                  <p>Online Bookings</p>
              </div>

            </div>
          </div>

        </div>

        {/* ================= RATINGS ================= */}
    

      </div>
    </div>
  );
}