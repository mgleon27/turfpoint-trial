 "use client";

import { useRouter } from "next/navigation";

export default function DownloadPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <div className="max-w-[900px] mx-auto">

        <div className="flex items-center gap-2 mb-3 ml-1">
          <img onClick={() => router.back()}  
          src="/icons/back.png" className="h-4.5" />
          <p className="font-sans font-medium text-xl text-black" >Back</p>
        </div>

        <div className="flex flex-col p-5 items-center bg-green-500 rounded-xl">
        <h1 className="text-[30px]/7 text-white font-sans font-bold pt-2 px-2">Download</h1>
        <h1 className="text-xl text-white font-sans font-medium px-2">Our New App</h1>
        <h1 className="text-lg text-white font-sans font-medium pb-3 px-2"> TURFIA </h1>

        <p className="text-white font-sans font-normal text-sm text-center mb-7">   Our turf booking app makes it easy to find and reserve sports turfs near you in just a few taps.Choose your preferred location, time slot, and sport with real-time availability. Enjoy a smooth and secure booking experience with instant confirmation.	Discover top-quality turfs and play without any hassle. Play more, plan less — your game starts here!</p>
    
        <div className="flex justify-between w-full ml-5 mb-5">
            <img src="/icons/qr-svg.svg" className="h-30" />

            <div className="m-auto ml-7" >
                <img src="/icons/playstore.png" className="h-7" />
                <img src="/icons/appstore.png" className="h-7" />
            </div>

        </div>
        
        
        
        
        
        
        </div>

      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}