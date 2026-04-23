"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // ================= LOGIN =================

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      router.replace("/");
    }
  });

}, []);
  const handleLogin = async () => {
  if (loading) return;
  setErrorMsg("");
  setSuccessMsg("");
  setLoading(true);

  if (!/^\S+@\S+\.\S+$/.test(email)) {
  setErrorMsg("Enter valid email");
  setLoading(false);
  return;
}

if (password.length < 6) {
  setLoading(false);
  setErrorMsg("Password must be at least 6 characters");
  return;
}

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setErrorMsg(error.message);
    setLoading(false);
    return;
  }

  const user = data.user;
  if (!user) {
    setLoading(false);
    return;
  }

  router.replace("/");

  setLoading(false);
};




const handleGoogleLogin = async () => {
  setLoading(true);
  setErrorMsg("");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    setErrorMsg("Google login failed");
    setLoading(false);
  }
};


  // ================= SIGNUP =================
  const handleSignup = async () => {
  if (loading) return;

  setErrorMsg("");
  setSuccessMsg("");
  setLoading(true);

  if (password !== confirmPassword) {
    setErrorMsg("Passwords do not match");
    setLoading(false);
    return;
  }

  if (name.trim().length < 2) {
    setErrorMsg("Enter your name");
    setLoading(false);
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setErrorMsg("Enter valid email");
    setLoading(false);
    return;
  }

  if (password.length < 6) {
    setErrorMsg("Password must be at least 6 characters");
    setLoading(false);
    return;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: "user" },
    },
  });

  if (error) {
    setErrorMsg(error.message);
    setLoading(false);
    return;
  }

  setSuccessMsg("Account created! Please verify your email.");
  setLoading(false);

  setEmail("");
  setPassword("");
  setConfirmPassword("");
  setName("");
};




const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    if (loading) return;

    isLogin ? handleLogin() : handleSignup();
  }
};


  return (
  <div className="min-h-screen bg-gray-200 flex items-center justify-center">

    {/* ================= DESKTOP ================= */}
    <div className="hidden md:flex w-[900px] h-[500px]">

      {/* LEFT SIDE */}
      <div className="w-1/2 bg-green-500 rounded-3xl relative flex flex-col items-center justify-center">
        <img src="/logo-new.png" className="h-10 absolute top-6 left-6" />

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
        {errorMsg && (
  <p className="text-red-500 text-sm mb-4 text-center">
    {errorMsg}
  </p>
)}

{successMsg && (
  <p className="text-green-600 text-sm mb-4 text-center">
    {successMsg}
  </p>
)}

        {!isLogin && (
          <input
            type="text"
            placeholder="Your Name"
            className="border-b p-2 mb-4 outline-none"
            onChange={(e) => {setName(e.target.value); setErrorMsg(""); setSuccessMsg("");} }
            onKeyDown={handleKeyDown} 
          />
        )}


        <input
          type="email"
          placeholder="Email ID"
          className="border-b p-2 mb-4 outline-none"
          onChange={(e) => {setEmail(e.target.value); setErrorMsg(""); setSuccessMsg("");}}
          onKeyDown={handleKeyDown} 
        />



        <input
          type="password"
          
          placeholder="Password"
          className="border-b p-2 mb-4 outline-none"
          onChange={(e) => { setPassword(e.target.value) ; setErrorMsg(""); setSuccessMsg("");}}
          onKeyDown={handleKeyDown} 
        />

        {!isLogin && (
          <input
            type="password"
            onChange={(e) =>{ setConfirmPassword(e.target.value) ; setErrorMsg(""); setSuccessMsg("");}}
            placeholder="Confirm Password"
            className="border-b p-2 mb-4 outline-none"
            onKeyDown={handleKeyDown} 
          />
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
  disabled={loading}
  className="bg-green-500 text-white py-2 rounded-lg mt-2 disabled:opacity-50"
>
  {loading ? "Please wait..." : isLogin ? "Sign in Now" : "Sign Up Now"}
</button>

        <p className="text-sm mt-4 text-center">
          {isLogin ? (
            <>
              Don’t have an Account?{" "}
              <span
                onClick={() => {
                    setIsLogin(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                className="text-blue-600 cursor-pointer"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an Account?{" "}
              <span
                onClick={() => {
                    setIsLogin(true);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
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

        <button
  onClick={handleGoogleLogin}
  className="w-full mt-3 border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
>
  <img src="/google.png" className="h-5 w-5" />
  Continue with Google
</button>

      </div>
      
    </div>

    {/* ================= MOBILE ================= */}
    <div className="md:hidden w-full min-h-screen bg-white px-6 py-10 flex flex-col justify-center">

      {/* OPTIONAL LOGO */}
      <img src="/logo-new.png" className="h-17 mb-5 self-center" />

      {/* SAME FORM (COPIED — NOT SEPARATE COMPONENT) */}
      <h1 className="text-2xl font-bold mb-6 text-center text-black font-sans">
        {isLogin ? "Welcome Back!!!" : "Create Account !!!"}
      </h1>
      {errorMsg && (
  <p className="text-red-500 text-sm mb-4 text-center">
    {errorMsg}
  </p>
)}

{successMsg && (
  <p className="text-green-600 text-sm mb-4 text-center">
    {successMsg}
  </p>
)}
      
      {!isLogin && (
        <input
          type="text"
          placeholder="Your Name"
          className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
          onChange={(e) =>{ setName(e.target.value); setErrorMsg(""); setSuccessMsg("");}}
          onKeyDown={handleKeyDown} 
        />
      )}


      <input
        type="email"
        placeholder="Email ID"
        className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
        onChange={(e) => {setEmail(e.target.value); setErrorMsg(""); setSuccessMsg("");}}
        onKeyDown={handleKeyDown} 
      />

      <input
        type="password"
        placeholder="Password"
        className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
        onChange={(e) =>{ setPassword(e.target.value); setErrorMsg(""); setSuccessMsg("");}}
        onKeyDown={handleKeyDown} 
      />

      {!isLogin && (
        <input
          type="password"
          onChange={(e) => {setConfirmPassword(e.target.value); setErrorMsg(""); setSuccessMsg("");}}
          placeholder="Confirm Password"
          className="border-b p-2 mb-4 outline-none text-gray-700 font-sans"
          onKeyDown={handleKeyDown} 
        />
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
  disabled={loading}
  className="bg-green-500 text-white py-2 rounded-lg mt-2 disabled:opacity-50"
>
  {loading ? "Please wait..." : isLogin ? "Sign in Now" : "Sign Up Now"}
</button>

      <p className="text-sm mt-4 text-center text-black font-sans">
        {isLogin ? (
          <>
            Don’t have an Account?{" "}
            <span
              onClick={() => {
                  setIsLogin(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              className="text-blue-600 cursor-pointer"
            >
              Sign Up
            </span>
          </>
        ) : (
          <>
            Already have an Account?{" "}
            <span
              onClick={() => {
                  setIsLogin(true);
                  setErrorMsg("");
                  setSuccessMsg("");
                  }}
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


      <div className="flex flex-col align-center w-full justify-center items-center mt-5">

        <div className="border border-black rounded-full p-2"><img src="/icons/google.png" className="h-6 w-6" /></div>
        <p className="font-sans font-normal text-[12px] text-black mt-2">Continue with google</p>

      </div>

    </div>
  </div>
  
);
}