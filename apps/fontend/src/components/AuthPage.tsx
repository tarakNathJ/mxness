import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Shield, TrendingUp } from "lucide-react";
import { api_init } from "./api/auth.js";
import { toast } from "./ui/use-toast.js";
import { useNavigate } from "react-router-dom";

export function AuthPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [user,setUserName] = useState("");
  const [password ,setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

const onSubmit = async () => {
 
  if (!email.trim()) {
    alert("Email is required");
    return;
  }

 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Invalid email format");
    return;
  }


  if (!password.trim()) {
    alert("Password is required");
    return;
  }

  
  if (isLogin) {
    
    const result =  await  api_init("/api/login",{
      // @ts-ignore
        email:email,
        password:password,
      })

      if(result.data.success){
        navigate("/trade")
      }
  } else {
    
    const result = await api_init("/api/register",{
      //@ts-ignore
      name:user,
      email:email,
      password:password
    })
  }
};
 


  return (
    <div className="min-h-screen flex">
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#0D1117]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl text-slate-900 dark:text-white">
                TradePro
              </h1>
            </div>

            <h2 className="text-3xl text-slate-900 dark:text-white mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Start your trading journey today"}
            </p>
          </div>
          {/* name */}
          <div className={`${isLogin ? " hidden " : ""}`}>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
              User Name
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="name"
                onChange={(e)=>setUserName(e.target.value)}
                placeholder="Entter your name"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
              onChange={(e)=>setEmail(e.target.value)}
                type="email"
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 2FA Toggle */}
          {/* <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-teal-500" />
                <div>
                  <p className="text-sm text-slate-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Extra layer of security</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnable2FA(!enable2FA)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  enable2FA ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  enable2FA ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div> */}

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <button
                type="button"
                className="text-teal-500 hover:text-teal-600"
              >
                Forgot password?
              </button>
            </div>
          )}
          {!isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              {/* <button
                type="button"
                className="text-teal-500 hover:text-teal-600"
              >
                Forgot password?
              </button> */}
            </div>
          )}

          <button
            type="submit"
            onClick={onSubmit}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-teal-500 hover:text-teal-600"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {!isLogin && (
            <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-900 dark:text-blue-300">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy. We do not recommend storing sensitive personal
                information on this platform.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-500 via-blue-500 to-purple-500 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

        <div className="relative z-10 max-w-lg text-center text-white">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-12 h-12" />
          </div>

          <h2 className="text-4xl mb-4">Trade with Confidence</h2>
          <p className="text-xl text-white/90 mb-8">
            Access professional trading tools, real-time market data, and
            AI-powered insights all in one platform.
          </p>

          <div className="grid grid-cols-3 gap-8 mt-12">
            <div>
              <p className="text-3xl mb-2">500K+</p>
              <p className="text-white/80 text-sm">Active Traders</p>
            </div>
            <div>
              <p className="text-3xl mb-2">$2.8B</p>
              <p className="text-white/80 text-sm">Daily Volume</p>
            </div>
            <div>
              <p className="text-3xl mb-2">99.9%</p>
              <p className="text-white/80 text-sm">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
