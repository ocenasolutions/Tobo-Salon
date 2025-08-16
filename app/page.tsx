"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, BarChart3, Star, ArrowRight, Package2, Sparkles, Heart, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
      <header className="border-b border-white/20 backdrop-blur-md bg-white/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/HUSN.png"
                alt="HUSN Logo"
                width={44}
                height={44}
                className="rounded-full object-cover shadow-lg ring-2 ring-purple-200"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full shadow-sm"></div>
            </div>
            <div>
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                HUSN
              </span>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Beauty Management</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-purple-600 transition-colors font-medium">
              Features
            </a>
            <a href="#testimonials" className="text-slate-600 hover:text-purple-600 transition-colors font-medium">
              Testimonials
            </a>
            <a href="#contact" className="text-slate-600 hover:text-purple-600 transition-colors font-medium">
              Contact
            </a>
            <Link href="/auth">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                Get Started
              </Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/auth">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Start
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-50/30 to-indigo-100/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Image
                  src="/HUSN.png"
                  alt="HUSN Logo"
                  width={140}
                  height={140}
                  className="rounded-full object-cover shadow-2xl ring-4 ring-white/50 relative z-10 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 z-20">
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-slate-800 leading-tight">
                Transform Your{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                    Beauty Business
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"></div>
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto">
                Streamline operations, delight clients, and grow your salon with our comprehensive management platform
                designed for modern beauty professionals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="text-xl px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl group transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span>Loved by 1000+ salons</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span>Industry leading</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>Easy setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-800 mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Powerful, intuitive tools designed specifically for beauty professionals who want to focus on what they do
              best
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50/50 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4 text-slate-800">Package Management</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create stunning service packages with flexible pricing for Basic and Premium offerings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-pink-50/50 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4 text-slate-800">Smart Billing</h3>
                <p className="text-slate-600 leading-relaxed">
                  Generate professional invoices, track payments, and maintain comprehensive billing history.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-indigo-50/50 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4 text-slate-800">Analytics & Insights</h3>
                <p className="text-slate-600 leading-relaxed">
                  Track performance, analyze trends, and make data-driven decisions to grow your business.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-emerald-50/50 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Package2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4 text-slate-800">Inventory Control</h3>
                <p className="text-slate-600 leading-relaxed">
                  Track products, manage expiry dates, and monitor payment status for all your inventory.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-800 mb-6">
              Trusted by Beauty{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Professionals
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how HUSN has transformed salons and spas across the country
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed italic">
                  "HUSN completely transformed how we manage our salon. The package management system is intuitive and
                  our billing is now seamless. Our clients love the professional invoices!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Maria Johnson</p>
                    <p className="text-sm text-slate-500">Luxe Hair Studio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed italic">
                  "The analytics dashboard gives us insights we never had before. We've increased our revenue by 30%
                  since implementing HUSN. The ROI has been incredible!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold">DK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">David Kim</p>
                    <p className="text-sm text-slate-500">Elite Beauty Lounge</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 md:col-span-2 lg:col-span-1">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 leading-relaxed italic">
                  "Professional, reliable, and exactly what our growing salon needed. The customer support is
                  exceptional and the platform is so easy to use!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold">SP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Sarah Parker</p>
                    <p className="text-sm text-slate-500">Glamour Salon & Spa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
              Ready to Transform Your Salon?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of beauty professionals who have elevated their business with HUSN!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="text-3xl px-8 py-6 bg-white text-purple-600 hover:bg-gray-50 shadow-xl group transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/HUSN.png"
                  alt="HUSN Logo"
                  width={44}
                  height={44}
                  className="rounded-full object-cover shadow-lg ring-2 ring-purple-400/30"
                />
                <div>
                  <span className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    HUSN
                  </span>
                  <p className="text-xs text-slate-400">Beauty Management Platform</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed max-w-md mb-6">
                Empowering beauty professionals with cutting-edge management tools designed for growth, efficiency, and
                exceptional client experiences.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">@</span>
                </div>
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#features" className="hover:text-purple-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center">
            <p className="text-slate-400">&copy; 2024 HUSN Beauty Management Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
