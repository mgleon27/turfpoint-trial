"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";

type PricingType = {
  day: string;
  from: string;
  to: string;
  price: number;
};


type ToggleListProps = {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
};


type InputProps = {
  label: string;
  value: string;
  placeHolder: string;
  setValue: (val: string) => void;
};

type StepProps = {
  label: string;
  active: boolean;
};

type SectionTitleProps = {
  title: string;
};


type Feature = {
  id: string;
  name: string;
};

type Sport = {
  id: string;
  name: string;
};

type PriceException = {
  day: number;
  from: string;
  to: string;
  price: string;
};

type TurfPricingInsert = {
  turf_id: string;
  day_of_week: number;
  start_hour: number;
  price: number;
};

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];






export default function AddTurfPage() {
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState(1);

  // ================= BASIC INFO =================
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");

  const [featuresList, setFeaturesList] = useState<Feature[]>([]);
  const [sportsList, setSportsList] = useState<Sport[]>([]);

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const [is24hr, setIs24hr] = useState(false);

  const [exceptions, setExceptions] = useState<PriceException[]>([]);

  // ================= PRICING =================
  const [basePrice, setBasePrice] = useState("");
  const [pricing, setPricing] = useState<PricingType[]>([]);

  // ================= IMAGES =================
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [otherImages, setOtherImages] = useState<File[]>([]);

  const toggleItem = (
  value: string,
  list: string[],
  setList: React.Dispatch<React.SetStateAction<string[]>>
) => {
  if (list.includes(value)) {
    setList(list.filter((i) => i !== value));
  } else {
    setList([...list, value]);
  }
};


const [workingHours, setWorkingHours] = useState(
  days.map((_, i) => ({
    day_of_week: i,
    open_time: "06:00",
    close_time: "22:00",
  }))
);

  // ================= SAVE =================
  const handleSubmit = async () => {
    if (!user) return;



    if (!is24hr) {
  for (const d of workingHours) {
    if (d.open_time >= d.close_time) {
      alert(`Invalid timing for ${days[d.day_of_week]}`);
      return;
    }
  }
}

    

    // 1️⃣ INSERT TURF
    const { data: turf, error } = await supabase
      .from("turfs")
      .insert({
        name,
        address,
        locality,
        contact_phone: phone,
        owner_id: user.id,
        price: Number(basePrice),
        area_sqm: Number(area),
      })
      .select()
      .single();

    if (error) {
      console.log("ERROR:", error);
      alert(error.message);
      return;
    }
    const turfId = turf.id;

    // 🕒 WORKING HOURS
// 🕒 WORKING HOURS
const workingHoursData = is24hr
  ? Array.from({ length: 7 }).map((_, i) => ({
      turf_id: turfId,
      day_of_week: i,
      open_time: "00:00:00",
      close_time: "23:59:00",
    }))
  : workingHours.map((d) => ({
      turf_id: turfId,
      day_of_week: d.day_of_week,
      open_time: d.open_time.length === 5 ? d.open_time + ":00" : d.open_time,
      close_time: d.close_time.length === 5 ? d.close_time + ":00" : d.close_time,
    }));

// ✅ REPLACE INSERT WITH THIS
const { error: whError } = await supabase
  .from("turf_working_hours")
  .upsert(workingHoursData, {
    onConflict: "turf_id,day_of_week",
  });

if (whError) {
  console.log("UPSERT ERROR:", whError);
  alert(whError.message);
}



    // FEATURES
if (selectedFeatures.length > 0) {
  await supabase.from("turf_features").insert(
    selectedFeatures.map((fid) => ({
      turf_id: turfId,
      feature_id: fid,
    }))
  );
}

// SPORTS
if (selectedSports.length > 0) {
  await supabase.from("turf_sports").insert(
    selectedSports.map((sid) => ({
      turf_id: turfId,
      sport_id: sid,
    }))
  );
}

    // 4️⃣ PRICING
    // 4️⃣ PRICING (EXCEPTIONS BASED)
if (exceptions.length > 0) {
  const pricingRows: TurfPricingInsert[] = [];

  exceptions.forEach((ex) => {
    const start = parseInt(ex.from.split(":")[0]);
    const end = parseInt(ex.to.split(":")[0]);

    for (let h = start; h < end; h++) {
      pricingRows.push({
        turf_id: turfId,
        day_of_week: ex.day,
        start_hour: h,
        price: Number(ex.price),
      });
    }
  });

  await supabase.from("turf_pricing").insert(pricingRows);
}

    // 5️⃣ IMAGES
    if (mainImage) {
      const fileName = `${turfId}/main.jpg`;

      await supabase.storage
        .from("turfs")
        .upload(fileName, mainImage, { upsert: true });

      const { data } = supabase.storage
        .from("turfs")
        .getPublicUrl(fileName);

      await supabase
        .from("turfs")
        .update({ img_url: data.publicUrl })
        .eq("id", turfId);
    }

    // other images
    for (let i = 0; i < otherImages.length; i++) {
      const file = otherImages[i];
      const filePath = `${turfId}/${i}.jpg`;

      await supabase.storage.from("turfs").upload(filePath, file, {
        upsert: true,
      });

      const { data } = supabase.storage
        .from("turfs")
        .getPublicUrl(filePath);

      await supabase.from("turf_images").insert({
        turf_id: turfId,
        image_url: data.publicUrl,
        position: i,
      });
    }

    router.push("/owner");
  };

  const addException = () => {
  setExceptions([
    ...exceptions,
    { day: 0, from: "06:00", to: "07:00", price: "" },
  ]);
};

const updateException = (
  index: number,
  field: keyof PriceException,
  value: string | number
) => {
  const updated = [...exceptions];
  updated[index] = { ...updated[index], [field]: value };
  setExceptions(updated);
};

const removeException = (index: number) => {
  setExceptions(exceptions.filter((_, i) => i !== index));
};


const removeLastException = () => {
  if (exceptions.length === 0) return;
  setExceptions(exceptions.slice(0, -1));
};

  useEffect(() => {
  const load = async () => {
    const { data: f } = await supabase.from("features").select("id, name");
    const { data: s } = await supabase.from("sports").select("id, name");

    setFeaturesList(f || []);
    setSportsList(s || []);
  };

  load();
}, []);

  // ================= UI =================

  return (
    <div className="p-4 max-w-md mx-auto bg-white">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <img onClick={() => router.back()} src="/icons/back.png" className="h-4.5" />
        <h1 className="text-lg font-semibold">Add Turf</h1>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex justify-between text-sm mb-6">
        <Step label="Basic Info" active={step === 1} />
        <Step label="Pricing" active={step === 2} />
        <Step label="Images" active={step === 3} />
      </div>

      {/* ================= STEP 1 ================= */}
      {step === 1 && (
        <>
          <Input label="Turf Name" value={name} setValue={setName} placeHolder="Turf Name" />
          <Input label="Address" value={address} setValue={setAddress} placeHolder="Turf Address" />
          <Input label="Locality" value={locality} setValue={setLocality} placeHolder="Eg: Nagercoil" />
          <Input label="Phone" value={phone} setValue={setPhone} placeHolder="Mobile Number" />
          <Input label="Area of Turf (sq.m)" value={area} setValue={setArea} placeHolder="Eg: 5000" />




          {/* WORKING HOURS */}
<p className="font-medium text-black font-sans text-[17px] mt-7 mb-3">
  Working Hours
</p>

<div className="flex gap-3 mb-4">
  <button
    onClick={() => setIs24hr(true)}
    className={`px-4 py-1 border rounded-full font-sans font-medium text-base shadow-md/10 ${
      is24hr
        ? "bg-green-600 text-white border-green-700"
        : "bg-gray-300 border-gray-400"
    }`}
  >
    Available - 24/7
  </button>

  <button
    onClick={() => setIs24hr(false)}
    className={`px-4 py-1 border rounded-full font-sans font-medium text-base shadow-md/10 ${
      !is24hr
        ? "bg-green-600 text-white border-green-700"
        : "bg-gray-300 border-gray-400"
    }`}
  >
    Custom Timings
  </button>
</div>









{!is24hr && (
  <div className="mt-4 border rounded-2xl overflow-hidden">

    {/* HEADER */}
    <div className="grid grid-cols-3 bg-gray-200 text-sm font-semibold font-sans text-center py-3">
      <div>Days</div>
      <div>Start Time</div>
      <div>Closing Time</div>
    </div>

    {/* ROWS */}
    {workingHours.map((d, index) => (
      <div
        key={d.day_of_week}
        className={`grid grid-cols-3 items-center text-center py-3 ${
          index % 2 === 0 ? "bg-white" : "bg-gray-100"
        }`}
      >
        {/* DAY */}
        <div className="text-base font-medium font-sans text-black">
          {days[d.day_of_week]}
        </div>

        {/* OPEN TIME */}
        <div>
          <input
            type="time"
            value={d.open_time}
            onChange={(e) => {
  setWorkingHours((prev) =>
    prev.map((item, i) =>
      i === index
        ? { ...item, open_time: e.target.value }
        : item
    )
  );
}}
            className="bg-transparent outline-none text-[15px] font-medium font-sans text-gray-800 text-center"
          />
        </div>

        {/* CLOSE TIME */}
        <div>
          <input
            type="time"
            value={d.close_time}
            onChange={(e) => {
  setWorkingHours((prev) =>
    prev.map((item, i) =>
      i === index
        ? { ...item, close_time: e.target.value }
        : item
    )
  );
}}
            className="bg-transparent outline-none text-[15px] font-medium font-sans text-gray-800 text-center"
          />
        </div>
      </div>
    ))}
  </div>
)}












          {/* FEATURES */}
          <p className="font-medium mt-4 mb-2 text-black font-sans text-[17px] mt-7 mb-3">Features</p>
            <div className="flex flex-wrap gap-2">
            {featuresList.map((f) => (
             <button
            key={f.id}
            onClick={() =>
            toggleItem(f.id, selectedFeatures, setSelectedFeatures)
            }
            className={`px-4 py-1 border rounded-full font-sans font-medium text-base shadow-md/10 ${
                selectedFeatures.includes(f.id)
                ? "bg-green-600 text-white border-green-700"
                : "bg-gray-300 border-gray-400"
                }`}
                >
                {f.name}
            </button>
            ))}
            </div>

          {/* SPORTS */}
          <p className="font-medium mt-4 mb-2 text-black font-sans text-[17px] mt-7">Sports</p>
            <div className="flex flex-wrap gap-2">
            {sportsList.map((s) => (
            <button
            key={s.id}
            onClick={() =>
            toggleItem(s.id, selectedSports, setSelectedSports)
            }
            className={`px-3 py-1 border rounded-full font-sans font-medium text-base shadow-md/10 ${
            selectedSports.includes(s.id)
            ? "bg-green-600 text-white border-green-700"
            : "bg-gray-300 border-gray-400"
            }`}
            >
            {s.name}
            </button>
            ))}
            </div>


          <button
            onClick={() => setStep(2)}
            className="btn-primary mt-6 bg-green-600 rounded-lg px-3 py-0.5 text-white font-sans font-medium text-base shadow-md"
          >
            Next →
          </button>
        </>
      )}

      {/* ================= STEP 2 ================= */}
      {step === 2 && (
  <>
    <Input
      label="Base Price"
      value={basePrice}
      setValue={setBasePrice}
      placeHolder="Turf Base Price"
    />

    {/* PRICE EXCEPTIONS */}
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
  <p className="text-black font-medium font-sans text-[17px]">
    Add Price Exceptions
  </p>

  <div className="flex gap-2">
    {/* ADD */}
    <button
      onClick={addException}
      className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
    >
      Add +
    </button>

    {/* REMOVE (only if exists) */}
    {exceptions.length > 0 && (
      <button
        onClick={removeLastException}
        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
      >
        Remove
      </button>
    )}
  </div>
</div>

      {/* INPUT ROWS */}
      <div className="space-y-3">
        {exceptions.map((ex, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-2 items-center"
          >
            {/* DAY */}
            <select
              value={ex.day}
              onChange={(e) =>
                updateException(index, "day", Number(e.target.value))
              }
              className="border rounded px-2 py-1 text-sm"
            >
              {days.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>

            {/* FROM */}
            <input
              type="time"
              value={ex.from}
              onChange={(e) =>
                updateException(index, "from", e.target.value)
              }
              className="border rounded px-2 py-1 text-sm"
            />

            {/* TO */}
            <input
              type="time"
              value={ex.to}
              onChange={(e) =>
                updateException(index, "to", e.target.value)
              }
              className="border rounded px-2 py-1 text-sm"
            />

            {/* PRICE */}
            <input
              type="number"
              placeholder="₹"
              value={ex.price}
              onChange={(e) =>
                updateException(index, "price", e.target.value)
              }
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
    </div>

    <div className="flex justify-between mt-6">
  <button
    onClick={() => setStep(1)}
    className="btn-primary bg-gray-400 rounded-lg px-4 py-0.5 text-white font-sans font-medium text-base shadow-md"
  >
    ← Back
  </button>

  <button
    onClick={() => setStep(3)}
    className="btn-primary bg-green-500 rounded-lg px-4 py-0.5 text-white font-sans font-medium text-base shadow-md"
  >
    Next →
  </button>
</div>
  </>
)}

      {/* ================= STEP 3 ================= */}
      {step === 3 && (
        <>
          <p className="font-medium mt-4 mb-2 text-black font-sans text-[17px]">Main Image</p>
          <input type="file" onChange={(e) => setMainImage(e.target.files?.[0] || null)} />

          <p className="font-medium mt-4 mb-2 text-black font-sans text-[17px]">Other Images</p>
          <input
            type="file"
            multiple
            onChange={(e) =>
              setOtherImages(Array.from(e.target.files || []))
            }
          />

          <div className="flex justify-between mt-6">
  <button
    onClick={() => setStep(2)}
    className="btn-primary bg-gray-400 rounded-lg px-4 py-0.5 text-white font-sans font-medium text-base shadow-md"
  >
    ← Back
  </button>

  <button
    onClick={handleSubmit}
    className="btn-primary bg-green-500 rounded-lg px-4 py-0.5 text-white font-sans font-medium text-base shadow-md"
  >
    Add Turf
  </button>
</div>
        </>
      )}
    </div>
  );
}

// ================= COMPONENTS =================

function Input({ label, placeHolder, value, setValue }: InputProps) {
  return (
    <div className="mb-5">
      <p className="text-base font-sans text-gray-700 font-medium">{label}</p>
      <input
        value={value}
        placeholder={placeHolder}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-1 py-2 border-b-1 border-gray-600 text-[17px] font-sans text-black font-medium"
      />
    </div>
  );
}





function ToggleList({ items, selected, onToggle }: ToggleListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item: string) => (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className={`px-3 py-1 rounded-full ${
            selected.includes(item)
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Step({ label, active }: StepProps) {
  return (
    <div className={active ? "text-green-600" : "text-gray-400"}>
      {label}
    </div>
  );
}