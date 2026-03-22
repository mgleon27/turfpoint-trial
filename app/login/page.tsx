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

  // ================= LOGIN =================
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else {
      alert("Login successful!");
      router.push("/");
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) alert(error.message);
    else {
      alert("Account created!");
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="flex w-[900px] h-[500px]">

        {/* LEFT SIDE */}
        <div className="w-1/2 bg-green-500 rounded-3xl relative flex flex-col items-center justify-center">
          
          {/* LOGO */}
          <img src="/logo.png" className="h-10 absolute top-6 left-6" />

          {/* IMAGE CONTAINER */}
          <div className="w-[80%] h-[70%] rounded-lg overflow-hidden flex items-center justify-center">
            
            <img
              src="/login.png" // 👉 you will add this image
              alt="login visual"
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback to yellow box if image not found
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />

          </div>
        </div>

        {/* RIGHT SIDE */}
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
    </div>
  );
}