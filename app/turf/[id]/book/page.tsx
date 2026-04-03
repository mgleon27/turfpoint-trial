"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";

// ================= TYPES =================
type Turf = {
  id: string;
  name: string;
  address:string;
  locality: string;
  price: number;
  is_24_7: boolean;
  opening_time?: string;
  closing_time?: string;
};

type Booking = {
  start_time: string;
  end_time: string;
};

// ================= TIME HELPERS =================
const pad2 = (n: number) => String(n).padStart(2, "0");

const minutesToTime = (m: number) =>
  `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}:00`;

const timeToMinutes = (t?: string) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const label = (m: number) => {
  const h = Math.floor(m / 60);
  const am = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${am}`;
};

// ================= SLOT BUILDER =================
function buildSlots(turf: Turf) {
  const open = turf.is_24_7 ? 0 : timeToMinutes(turf.opening_time);
  const close = turf.is_24_7 ? 1440 : timeToMinutes(turf.closing_time);

  const arr = [];

  for (let m = open; m + 60 <= close; m += 60) {
    arr.push({
      key: `${m}-${m + 60}`,
      start: minutesToTime(m),
      end: minutesToTime(m + 60),
      label: label(m),
      startMin: m,
    });
  }

  return arr;
}


const getToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};




// ================= PAGE =================
export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const { user, loadingUser } = useUser();

if (loadingUser) {
  return <div className="p-5">Loading...</div>;
}

if (!user) {
  router.push("/login");
  return null;
}

  const [turf, setTurf] = useState<Turf | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [date, setDateState] = useState(() => getToday());

  const [profile, setProfile] = useState<{ full_name: string } | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

const setDate = (newDate: string) => {
  setSelected(new Set()); // ✅ reset here
  setDateState(newDate);
};
  const [loading, setLoading] = useState(true);


  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
  const interval = setInterval(() => {
    const newToday = getToday();

    setDateState((prev) => {
      if (prev !== newToday) {
        setSelected(new Set());
        return newToday;
      }
      return prev;
    });
  }, 60000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (!user) return;

  const getProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  getProfile();
}, [user]);

  // ================= LOAD =================
  const load = async () => {

  // TURF
  const turfRes = await supabase
    .from("turfs")
    .select("*")
    .eq("id", id)
    .single();

  if (turfRes.error) throw new Error(turfRes.error.message);

  setTurf(turfRes.data as Turf);

  // BOOKINGS
  const bookingRes = await supabase
    .from("bookings")
    .select("start_time,end_time")
    .eq("turf_id", id)
    .eq("booking_date", date);

  if (bookingRes.error) throw new Error(bookingRes.error.message);

  setBookings((bookingRes.data ?? []) as Booking[]);
};
  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [id, date]);

 useEffect(() => {
  if (!id) return;

  const todayNow = getToday();

  setTimeout(() => {
    setDateState(todayNow);
    setSelected(new Set());
  }, 0);

}, [id]);
  

  // ================= REALTIME =================
  useEffect(() => {
    if (!id) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`booking-${id}-${date}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `turf_id=eq.${id}`,
        },
        async () => {
          await load();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, date]);


   if (!turf || loading) return <div className="p-5">Loading...</div>;


  const slots = buildSlots(turf);

  const bookedSet = new Set(
    bookings.map(
      (b) =>
        `${timeToMinutes(b.start_time)}-${timeToMinutes(b.end_time)}`
    )
  );

  const now = new Date();
 const today = getToday();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const computed = slots.map((s) => {
  const isBooked = bookedSet.has(s.key);

  const selectedDate = new Date(date);
  const todayDate = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  todayDate.setHours(0, 0, 0, 0);

  const isPastDate = selectedDate < todayDate;

  const isTimeout =
    isPastDate || 
    (date === today && s.startMin <= currentMin);

  const status = isTimeout
    ? "timeout"
    : isBooked
    ? "booked"
    : "available";

  return { ...s, status };
});

  // ================= SELECT =================
  const toggle = (key: string) => {
    const slot = computed.find((s) => s.key === key);
    if (!slot || slot.status !== "available") return;

    setSelected((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const total = selected.size * turf.price;

  const amount = total + (selected.size * 10) ;

  // ================= BOOK =================
  const book = async () => {
    if (selected.size === 0) {
  alert("Please select atleast one slot to continue");
  return;
}
    
    if (loadingUser) {
  alert("Please wait...");
  return;
}

if (!user) {
  router.push("/login");
  return;
}

    const keys = Array.from(selected);

    const { data: latest } = await supabase
      .from("bookings")
      .select("start_time,end_time")
      .eq("turf_id", id)
      .eq("booking_date", date);

    const latestSet = new Set(
      (latest || []).map(
        (b) =>
          `${timeToMinutes(b.start_time)}-${timeToMinutes(b.end_time)}`
      )
    );

    const conflict = keys.filter((k) => latestSet.has(k));

    if (conflict.length) {
      alert("Some slots already booked!");
      setSelected(new Set());
      return;
    }

    const rows = keys.map((k) => {
      const [s, e] = k.split("-").map(Number);
      return {
        turf_id: id,
        user_id: user.id,
        booking_date: date,
        start_time: minutesToTime(s),
        end_time: minutesToTime(e),
        status: "confirmed",
        price: turf.price,
        booked_by : "online",
      };
    });

   const { error } = await supabase.from("bookings").insert(rows);

if (error) {
  const msg = error.message?.toLowerCase() || "";

  if (
    error.code === "23505" || // postgres unique error
    msg.includes("duplicate") ||
    msg.includes("unique")
  ) {
    alert("⚠️ Some slots were just booked by another user. Please select again.");
    
    // reload fresh bookings
    const { data } = await supabase
      .from("bookings")
      .select("start_time,end_time")
      .eq("turf_id", id)
      .eq("booking_date", date);

    setBookings(data || []);
    setSelected(new Set());
    return;
  }

  alert("Booking failed: " + error.message);
  return;
}

    alert("Booked ✅");
    router.push("/bookings");
  };

  const next10Days = Array.from({ length: 10 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);

  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  const value = local.toISOString().split("T")[0];

  let label = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (i === 0) label = "Today";
  if (i === 1) label = "Tomorrow";

  return { value, label };
});

  return (
    <div className="min-h-screen bg-white">

      {/* MOBILE */}
      <div className="md:hidden p-4">

        <div className="flex items-center gap-3 mb-4">
          <img src="/icons/back.png" className="w-4 h-4"
            onClick={() => router.back()} />
          <h1 className="text-lg">Book Slot</h1>
        </div>

<div className="flex flex-row justify-between">
        <h2 className="font-semibold font-sans text-lg">{turf.name}</h2>

        <div className="flex flex-row text-center items-center gap-1">
        <img src="/icons/locationtop.png" className="h-4 " />
        <p className="text-gray-500 font-sans">
        {turf.locality}</p>
        </div>
             
</div>
         
    <div className="text-gray-600 font-sans font-normal text-base mt-1">
            {turf.address.split(",").map((line, i) => (
            <div key={i}>{line.trim()}</div>
))}
    </div>


        <p className="mt-2 font-semibold font-sans text-black text-lg">
          ₹{turf.price}<span className="text-gray-500 text-base"> / hr </span>
        </p>

        <hr className="my-4 border-gray-400 mt-2"/>

        <div className="flex justify-between mt-4">
          <h3 className="text-black font-sans font-medium text-lg">Select Slots</h3>




          {/* DATE SELECTOR */}
<div className="relative">

  {/* SMALL DATE BUTTON */}
  <div
    onClick={() => setShowDatePicker(!showDatePicker)}
    className="px-3 py-1 border rounded-lg text-sm cursor-pointer bg-gray-100"
  >
    {next10Days.find(d => d.value === date)?.label || "Select Date"}
  </div>

  {/* DROPDOWN DATE SCROLL */}
  {showDatePicker && (
    <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-xl p-3 z-50 w-[260px]">

      <div className="flex gap-3 overflow-x-auto no-scrollbar">

        {next10Days.map((d) => (
          <div
            key={d.value}
            onClick={() => {
              setDate(d.value);
              setShowDatePicker(false); // ✅ close after select
            }}
            className={`min-w-[75px] p-1 rounded-lg text-center cursor-pointer border
            
            ${date === d.value
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-black"
            }
            `}
          >
            <div className="text-xs font-medium font-sans">{d.label}</div>
            <div className="text-[10px] mt-1 font-sans font-medium">
              {d.value.split("-").slice(1).join("/")}
            </div>
          </div>
        ))}

      </div>

    </div>
  )}

</div>



        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 bg-white">
          {computed.map((s) => {
            const isSelected = selected.has(s.key);

            return (
              <div
                key={s.key}
                onClick={() => toggle(s.key)}
                className={`relative rounded-full px-3 py-2 text-center text-sm
                ${s.status === "timeout" && "bg-gray-300 text-white"}
                ${s.status === "booked" && "bg-gray-200 text-white"}
                ${s.status === "available" && "text-black text-base font-sans font-medium border-2 border-green-800"}
                ${isSelected && "bg-green-500 text-white border border-gray-200"}
              `}
              >
                {s.label}

                {s.status === "available" && (
                  <div className="absolute -top-2 -right-1">
                    {isSelected ? 
                    <img src="/icons/tick.png" className="h-5 "/> 
                    : 
                    <img src="/icons/plus.png" className="h-5 "/>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 font-sans text-black text-base font-medium">Selected: {selected.size} hrs </p>



<p className="mt-4 text-black text-base font-sans font-medium">Payment summary</p>


<div className="mt-2 border border-gray-300 rounded-2xl p-3">

     <div className="flex flex-row justify-between">
         <p className="font-sans text-gray-700 text-sm font-normal">Booking amount:</p>
         <p className="font-sans text-gray-700 text-sm font-normal">₹{total}</p>
     </div>

     <div className="flex flex-row justify-between mt-3">
        <p className="font-sans text-gray-700 text-sm font-normal">Taxes & fees</p>
        <p className="font-sans text-gray-700 text-sm font-normal">₹{selected.size * 10}.00</p>
     </div>
<hr className="my-4 border-gray-400 mt-7"/>

     <div className="flex flex-row justify-between mt-3">
        <p className="font-sans text-black text-base font-medium">To be paid</p>
        <p className="font-sans text-black text-sm font-medium">₹{amount}.00</p>
     </div>
    
</div>  

<p className="mt-4 text-black text-base font-sans font-medium">Your Details</p>


<div className="mt-2 border border-gray-300 rounded-2xl p-4 space-y-3">

  {/* NAME */}
  <div className="flex flex-col">
    <p className="text-sm text-gray-500 font-medium">Name</p>
    <p className="text-sm text-black font-medium">
      {profile?.full_name}
    </p>


    <p className="text-sm text-gray-500 font-medium mt-3">Mobile</p>
    <p className="text-sm text-black font-medium">
      +91 xxxxxxxxxx
    </p>
  

  {/* EMAIL */}
  
    <p className="text-sm text-gray-500 font-medium mt-3">Email</p>
    <p className="text-sm text-black font-medium">
      {user?.email}
    </p>

    


    <p className="text-sm text-gray-600 font-normal mt-5">
      The Booking details will be send to the users email.
    </p>
  </div>

</div>





<div
          onClick={book}
          className="mt-4 w-full border py-2 px-4 rounded-lg bg-green-700 text-xl text-white font-normal font-sans"
        >
    <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-white text-sm font-sans font-medium">₹{amount}.00</p>
          <p className="text-gray-200 text-sm font-sans font-light">Total</p>
        </div>
        <div>
            <p className="text-white text-base font-sans font-normal">Proceed To Pay</p>
        </div>
    </div>

</div>
      </div>

      {/* DESKTOP */}
      {/* ================= DESKTOP ================= */}
<div className="hidden md:flex h-screen bg-[#f7f7f7]">

  {/* LEFT PANEL */}
  <div className="w-[30%] border-r bg-white p-6 flex flex-col justify-between">

    <div>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}>←</button>
        <h1 className="text-lg font-medium">Book Slot</h1>
      </div>

      {/* TURF DETAILS */}
      <h2 className="text-xl font-semibold">{turf.name}</h2>

      <div className="mt-2 text-gray-600 text-sm leading-5">
        {turf.locality}
      </div>

      <p className="mt-4 text-lg font-semibold">
        ₹{turf.price} <span className="text-gray-500 text-base">/ hr</span>
      </p>
    </div>

    {/* PAYMENT SECTION */}
    <div>
      <h3 className="font-medium mb-4 text-lg">
        Select Payment Method
      </h3>

      <div className="space-y-3 text-sm">
        {["UPI Payment", "Debit / Credit Card", "Net Banking", "Turfia Wallet"].map((p) => (
          <label key={p} className="flex items-center gap-3">
            <input type="radio" name="payment" />
            {p}
          </label>
        ))}
      </div>

      <button
        onClick={book}
        className="mt-8 w-full border rounded-full py-3 text-lg"
      >
        Continue &gt;&gt;
      </button>
    </div>
  </div>

  {/* RIGHT PANEL */}
  <div className="w-[70%] p-6 overflow-y-auto">

    {/* HEADER */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-medium">Select Slots</h2>



      <div className="overflow-x-auto no-scrollbar">
  <div className="flex gap-4 w-max">

    {next10Days.map((d) => (
      <div
        key={d.value}
        onClick={() => setDate(d.value)}
        className={`min-w-[110px] px-4 py-3 rounded-xl text-center cursor-pointer border
        
        ${date === d.value
          ? "bg-green-600 text-white border-green-600"
          : "bg-white"
        }
        `}
      >
        <div className="text-sm font-semibold">{d.label}</div>
        <div className="text-xs mt-1 opacity-80">
          {d.value.split("-").slice(1).join("/")}
        </div>
      </div>
    ))}

  </div>
</div>



    </div>

    {/* SLOT GRID */}
    <div className="grid grid-cols-6 gap-4">

      {computed.map((s) => {
        const isSelected = selected.has(s.key);

        return (
          <div
            key={s.key}
            onClick={() => toggle(s.key)}
            className={`relative border rounded-full px-4 py-2 text-center cursor-pointer
              
              ${s.status === "timeout" && "bg-gray-100 text-gray-400"}
              ${s.status === "booked" && "text-red-500"}
              ${isSelected && "bg-green-200 border-green-500"}
            `}
          >
            {/* TIME */}
            <div className="text-sm font-medium">
              {s.label}
            </div>

            {/* STATUS */}
            <div className="text-xs mt-1">
              {s.status === "available" && "Available"}
              {s.status === "booked" && "Booked"}
              {s.status === "timeout" && "Timeout"}
            </div>

            {/* ICON */}
            {s.status === "available" && (
              <div className="absolute -top-2 -right-2 text-green-600 text-lg">
                {isSelected ? "✔" : "+"}
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* SELECTED + PRICE */}
    <div className="mt-8">

      <p className="text-lg">
        Selected :
        <span className="ml-2">
          {Array.from(selected).map((k) => {
            const s = slots.find((x) => x.key === k);
            return (
              <span
                key={k}
                className="ml-2 px-3 py-1 bg-gray-200 rounded-full text-sm"
              >
                {s?.label}
              </span>
            );
          })}
        </span>
      </p>

      <p className="mt-3 text-lg font-medium">
        Price : ₹{total}
      </p>

    </div>

  </div>
</div>
    </div>
  );
}