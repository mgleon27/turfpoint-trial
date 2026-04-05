"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "owner">("user");

  // ================= LOGIN =================
  const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const user = data.user;

  if (!user) return;

  // 🔥 FETCH PROFILE
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, owner_approved")
    .eq("id", user.id)
    .single();

  if (!profile) {
    router.push("/");
    return;
  }

  // 🔥 ROLE BASED REDIRECT
  if (profile.role === "owner") {
  if (profile.owner_approved) {
    router.push("/owner");
  } else {
    router.push("/owner-pending"); // 🔥 NOT home
  }
} else {
  router.push("/");
}
  };

  // ================= SIGNUP =================
  const handleSignup = async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  });

  if (error) {
    alert(error.message);
    return;
  }

  // ✅ REDIRECTION
  if (data.session) {
    if (role === "owner") {
      router.replace("/owner-pending");
    } else {
      router.replace("/");
    }
    return;
  }

  alert("Account created! Please verify your email.");
};

  return (
  <div className="min-h-screen bg-gray-200 flex items-center justify-center">

    {/* ================= DESKTOP ================= */}
    <div className="hidden md:flex w-[900px] h-[500px]">

      {/* LEFT SIDE */}
      <div className="w-1/2 bg-green-500 rounded-3xl relative flex flex-col items-center justify-center">
        <img src="/logo.png" className="h-10 absolute top-6 left-6" />

        <div className="w-[80%] h-[70%] rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src="/login.png"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* RIGHT SIDE (YOUR ORIGINAL FORM — NO CHANGE) */}
      <div className="w-1/2 bg-white rounded-3xl shadow-xl p-10 flex flex-col justify-center">
        
        <h1 className="text-2xl font-bold mb-6">
          {isLogin ? "Welcome Back!!!" : "Create Account !!!"}
        </h1>

        {!isLogin && (
          <input
            type="text"
            placeholder="Your Name"
            className="border-b p-2 mb-4 outline-none"
            onChange={(e) => setName(e.target.value)}
          />
        )}


        <input
          type="email"
          placeholder="Email ID"
          className="border-b p-2 mb-4 outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />



        <input
          type="password"
          placeholder="Password"
          className="border-b p-2 mb-4 outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="border-b p-2 mb-4 outline-none"
          />
        )}




        {!isLogin && (
  <div className="flex mb-4 gap-2">

    <button
      type="button"
      onClick={() => setRole("user")}
      className={`flex-1 py-2 rounded-lg border 
      ${role === "user" 
        ? "bg-green-500 text-white border-green-500" 
        : "bg-white text-black"}
      `}
    >
      User
    </button>

    <button
      type="button"
      onClick={() => setRole("owner")}
      className={`flex-1 py-2 rounded-lg border 
      ${role === "owner" 
        ? "bg-green-500 text-white border-green-500" 
        : "bg-white text-black"}
      `}
    >
      Owner
    </button>

  </div>
)}




        {isLogin && (
          <div className="flex justify-between text-sm mb-4">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <span className="cursor-pointer text-gray-500">
              Forgot Password?
            </span>
          </div>
        )}

        <button
          onClick={isLogin ? handleLogin : handleSignup}
          className="bg-green-500 text-white py-2 rounded-lg mt-2"
        >
          {isLogin ? "Sign in Now" : "Sign Up Now"}
        </button>

        <p className="text-sm mt-4 text-center">
          {isLogin ? (
            <>
              Don’t have an Account?{" "}
              <span
                onClick={() => setIsLogin(false)}
                className="text-blue-600 cursor-pointer"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an Account?{" "}
              <span
                onClick={() => setIsLogin(true)}
                className="text-blue-600 cursor-pointer"
              >
                Login
              </span>
            </>
          )}
        </p>

        <button
          onClick={() => router.push("/")}
          className="mt-4 text-gray-600 hover:text-black text-sm underline"
        >
          Skip for now →
        </button>

      </div>
    </div>

    {/* ================= MOBILE ================= */}
    <div className="md:hidden w-full min-h-screen bg-white px-6 py-10 flex flex-col justify-center">

      {/* OPTIONAL LOGO */}
      <img src="/logo.png" className="h-10 mb-8 self-center" />

      {/* SAME FORM (COPIED — NOT SEPARATE COMPONENT) */}
      <h1 className="text-2xl font-bold mb-6 text-center text-black font-sans">
        {isLogin ? "Welcome Back!!!" : "Create Account !!!"}
      </h1>

      {!isLogin && (
        <input
          type="text"
          placeholder="Your Name"
          className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
          onChange={(e) => setName(e.target.value)}
        />
      )}


      <input
        type="email"
        placeholder="Email ID"
        className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
        onChange={(e) => setPassword(e.target.value)}
      />

      {!isLogin && (
        <input
          type="password"
          placeholder="Confirm Password"
          className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
        />
      )}

      {!isLogin && (
  <div className="flex mb-4 gap-2">

    <button
      type="button"
      onClick={() => setRole("user")}
      className={`flex-1 py-1.5 rounded-lg border 
      ${role === "user" 
        ? "bg-green-500 text-white border-green-500 shadow-lg/20 font-semibold font-sans " 
        : "bg-white border-gray-400 text-black font-sans"}
      `}
    >
      User
    </button>

    <button
      type="button"
      onClick={() => setRole("owner")}
      className={`flex-1 py-1.5 rounded-lg border 
      ${role === "owner" 
        ? "bg-green-500 text-white border-green-500 shadow-lg/20 font-semibold font-sans" 
        : "bg-white border-gray-400 text-black font-sans"}
      `}
    >
      Owner
    </button>

  </div>
)}


      {isLogin && (
        <div className="flex justify-between text-sm mb-4 text-black font-sans">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
          <span className="cursor-pointer text-gray-500 font-sans">
            Forgot Password?
          </span>
        </div>
      )}

      <button
        onClick={isLogin ? handleLogin : handleSignup}
        className="bg-green-500 text-white py-3 rounded-lg mt-2 font-sans"
      >
        {isLogin ? "Sign in Now" : "Sign Up Now"}
      </button>

      <p className="text-sm mt-4 text-center text-black font-sans">
        {isLogin ? (
          <>
            Don’t have an Account?{" "}
            <span
              onClick={() => setIsLogin(false)}
              className="text-blue-600 cursor-pointer"
            >
              Sign Up
            </span>
          </>
        ) : (
          <>
            Already have an Account?{" "}
            <span
              onClick={() => setIsLogin(true)}
              className="text-blue-600 cursor-pointer font-sans"
            >
              Login
            </span>
          </>
        )}
      </p>

      <button
        onClick={() => router.push("/")}
        className="mt-4 text-gray-600 text-sm underline font-sans"
      >
        Skip for now →
      </button>

    </div>
  </div>
);
}