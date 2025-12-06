'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Users, Package, Shield, TrendingUp, Coins, Map,
  FileCheck, Truck, Building2, Leaf, Globe, ChevronRight,
  Search, Bell, Settings, Menu, X, ArrowUpRight, ArrowDownRight,
  Activity, Wallet, Lock, Eye, Filter, Plus, Download, RefreshCw,
  CheckCircle2, Clock, AlertTriangle, ChevronDown, Layers,
  Database, Zap, Ship, Factory, Home, LayoutDashboard, Store,
  FileText, CreditCard, PieChart, UserCircle, LogOut, HelpCircle,
  Anchor, Boxes, Scale, LineChart, Target, Award, Landmark,
  ShieldCheck, Fingerprint, QrCode, MapPin, Calendar, Upload,
  ClipboardCheck, Microscope, Container, Wheat, Gem, Music,
  TreePine, Sun, Moon
} from 'lucide-react';
import ProducerRegistrationFlow from './ProducerRegistration';

// User type for localStorage
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ============================================
// SRGG MARKETPLACE PLATFORM - COMPLETE UI/UX
// ============================================

// Color System
const colors = {
  primary: {
    900: '#0c1929',
    800: '#0f2744',
    700: '#14365f',
    600: '#1a4a80',
    500: '#2563eb',
    400: '#4f8ff7',
    300: '#93bbfc',
  },
  accent: {
    gold: '#d4a853',
    goldLight: '#e8c778',
    goldDark: '#b8923f',
    emerald: '#10b981',
    ruby: '#ef4444',
    amber: '#f59e0b',
  },
  neutral: {
    900: '#111827',
    800: '#1f2937',
    700: '#374151',
    600: '#4b5563',
    500: '#6b7280',
    400: '#9ca3af',
    300: '#d1d5db',
    200: '#e5e7eb',
    100: '#f3f4f6',
    50: '#f9fafb',
  }
};

// Navigation Items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'producers', label: 'Producers', icon: Users },
  { id: 'commodities', label: 'Commodities', icon: Package },
  { id: 'tokenization', label: 'Tokenization', icon: Coins },
  { id: 'validation', label: 'Validation', icon: ClipboardCheck },
  { id: 'insurance', label: 'Insurance', icon: Shield },
  { id: 'hedging', label: 'Hedging', icon: TrendingUp },
  { id: 'logistics', label: 'Logistics', icon: Ship },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ============================================
// SIDEBAR COMPONENT
// ============================================
interface SidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar = ({ activeScreen, setActiveScreen, collapsed, setCollapsed, user, onLogout }: SidebarProps) => {
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
        border-r border-slate-800/50 transition-all duration-300 z-50
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600
              flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight">SRGG</h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Marketplace</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600
            flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Globe className="w-6 h-6 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-10rem)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }
                ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : ''}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800/50 space-y-2">
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50
          cursor-pointer transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600
            flex items-center justify-center text-white font-semibold text-sm">
            {user ? getUserInitials(user.name) : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role || 'Role'}</p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
            text-slate-400 hover:text-red-400 hover:bg-red-500/10 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

// ============================================
// HEADER COMPONENT
// ============================================
interface HeaderProps {
  title: string;
  subtitle: string;
  userName?: string;
  onNewListing?: () => void;
}

const Header = ({ title, subtitle, userName, onNewListing }: HeaderProps) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50
      flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}{userName ? `, ${userName}` : ''}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className={`relative transition-all duration-300 ${searchFocused ? 'w-80' : 'w-64'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search commodities, producers..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl
              text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50
              focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px]
            text-slate-500 bg-slate-700/50 rounded">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-slate-800 text-slate-400
          hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full
            ring-2 ring-slate-900"></span>
        </button>

        {/* Quick Actions */}
        <button
          onClick={onNewListing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500
            to-amber-600 rounded-xl text-sm font-medium text-white hover:from-amber-400
            hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </button>
      </div>
    </header>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================
type StatCardColor = 'amber' | 'emerald' | 'blue' | 'purple' | 'red';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down';
  color?: StatCardColor;
}

const StatCard = ({ icon: Icon, label, value, change, changeType, color = 'amber' }: StatCardProps) => {
  const colorClasses: Record<StatCardColor, string> = {
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5
      hover:border-slate-600/50 transition-all group">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium
            ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD SCREEN
// ============================================
const DashboardScreen = () => {
  const recentTransactions = [
    { id: 'TXN-001', type: 'Tokenization', commodity: 'Cocoa Beans', qty: '50 MT', value: '$125,000', status: 'completed', time: '2 min ago' },
    { id: 'TXN-002', type: 'Insurance', commodity: 'Gold Reserve', qty: '200 oz', value: '$380,000', status: 'pending', time: '15 min ago' },
    { id: 'TXN-003', type: 'Hedge Position', commodity: 'Maize Futures', qty: '100 MT', value: '$45,000', status: 'completed', time: '1 hr ago' },
    { id: 'TXN-004', type: 'Export', commodity: 'Cassava', qty: '75 MT', value: '$32,500', status: 'processing', time: '2 hr ago' },
    { id: 'TXN-005', type: 'Carbon Credit', commodity: 'Forest Reserve', qty: '500 tCO2', value: '$15,000', status: 'completed', time: '3 hr ago' },
  ];

  const marketData = [
    { commodity: 'Cocoa', price: '$2,485/MT', change: '+3.2%', trend: 'up' },
    { commodity: 'Gold', price: '$1,925/oz', change: '+0.8%', trend: 'up' },
    { commodity: 'Maize', price: '$215/MT', change: '-1.2%', trend: 'down' },
    { commodity: 'Coffee', price: '$1,820/MT', change: '+2.1%', trend: 'up' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Coins} label="Total Tokenized Assets" value="$4.2M" change="+12.5%" changeType="up" color="amber" />
        <StatCard icon={Users} label="Active Producers" value="2,847" change="+8.3%" changeType="up" color="emerald" />
        <StatCard icon={Shield} label="Insured Volume" value="$18.5M" change="+15.2%" changeType="up" color="blue" />
        <StatCard icon={TrendingUp} label="Hedge Positions" value="$6.8M" change="+5.7%" changeType="up" color="purple" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Market Overview Chart */}
        <div className="col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Market Overview</h3>
              <p className="text-sm text-slate-500">Real-time commodity trading volume</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white 
                hover:bg-slate-700/50 rounded-lg transition-colors">24H</button>
              <button className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 
                rounded-lg">7D</button>
              <button className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white 
                hover:bg-slate-700/50 rounded-lg transition-colors">30D</button>
            </div>
          </div>
          
          {/* Simulated Chart */}
          <div className="h-64 flex items-end gap-2 px-4">
            {[65, 45, 78, 52, 88, 42, 95, 68, 72, 85, 58, 92, 48, 76, 82, 55, 90, 62, 78, 88].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-gradient-to-t from-amber-500/80 to-amber-400/40 rounded-t-sm 
                    hover:from-amber-400 hover:to-amber-300/60 transition-all cursor-pointer"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 mt-2 text-xs text-slate-500">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
            <span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Live Market Prices */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Live Prices</h3>
            <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />
          </div>
          <div className="space-y-3">
            {marketData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 
                rounded-xl hover:bg-slate-900/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${item.trend === 'up' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <LineChart className={`w-5 h-5 ${item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.commodity}</p>
                    <p className="text-xs text-slate-500">{item.price}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${item.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <p className="text-sm text-slate-500">Latest marketplace activity</p>
          </div>
          <button className="text-sm text-amber-400 hover:text-amber-300 font-medium">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Commodity</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-amber-400">{txn.id}</td>
                  <td className="py-3 px-4 text-sm text-white">{txn.type}</td>
                  <td className="py-3 px-4 text-sm text-white">{txn.commodity}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{txn.qty}</td>
                  <td className="py-3 px-4 text-sm font-medium text-white">{txn.value}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${txn.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                        txn.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-blue-500/10 text-blue-400'}`}>
                      {txn.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> :
                       txn.status === 'pending' ? <Clock className="w-3 h-3" /> :
                       <RefreshCw className="w-3 h-3" />}
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{txn.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gateway Hubs */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm 
          rounded-2xl border border-emerald-500/20 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Ghana Hub</h3>
              <p className="text-sm text-emerald-400">West Africa Gateway</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="text-center p-3 bg-slate-900/30 rounded-xl">
              <p className="text-xl font-bold text-white">1,247</p>
              <p className="text-xs text-slate-500">Producers</p>
            </div>
            <div className="text-center p-3 bg-slate-900/30 rounded-xl">
              <p className="text-xl font-bold text-white">$2.8M</p>
              <p className="text-xs text-slate-500">Volume</p>
            </div>
            <div className="text-center p-3 bg-slate-900/30 rounded-xl">
              <p className="text-xl font-bold text-white">89%</p>
              <p className="text-xs text-slate-500">Verified</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm 
          rounded-2xl border border-blue-500/20 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Dominican Republic Hub</h3>
              <p className="text-sm text-blue-400">Caribbean Gateway</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="text-center p-3 bg-slate-900/30 rounded-xl">
              <p className="text-xl font-bold text-white">892</p>
              <p className="text-xs text-slate-500">Producers</p>
            </div>
            <div className="text-center p-3 bg-slate-900/30 rounded-xl">
              <p className="text-xl font-bold text-white">$1.4M</p>
              <p className="text-xs text-slate-500">Volume</p>
            </div>
            <div className="text-center p-3 bg-slate-900/30 rounded-xl">
              <p className="text-xl font-bold text-white">94%</p>
              <p className="text-xs text-slate-500">Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MARKETPLACE SCREEN
// ============================================
const MarketplaceScreen = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: 'All Assets', icon: Layers },
    { id: 'agriculture', label: 'Agriculture', icon: Wheat },
    { id: 'minerals', label: 'Minerals', icon: Gem },
    { id: 'carbon', label: 'Carbon Credits', icon: TreePine },
    { id: 'cultural', label: 'Cultural IP', icon: Music },
  ];

  const listings = [
    { id: 'LST-001', name: 'Premium Cocoa Beans', category: 'agriculture', origin: 'Ghana', qty: '50 MT', price: '$2,500/MT', verified: true, insurance: true, image: '🍫' },
    { id: 'LST-002', name: 'Gold Reserve Token', category: 'minerals', origin: 'Ghana', qty: '500 oz', price: '$1,925/oz', verified: true, insurance: true, image: '🥇' },
    { id: 'LST-003', name: 'Mangrove Carbon Credits', category: 'carbon', origin: 'DR', qty: '1,000 tCO2', price: '$32/tCO2', verified: true, insurance: false, image: '🌳' },
    { id: 'LST-004', name: 'Organic Cassava', category: 'agriculture', origin: 'Ghana', qty: '100 MT', price: '$180/MT', verified: true, insurance: true, image: '🥔' },
    { id: 'LST-005', name: 'Kente Textile IP', category: 'cultural', origin: 'Ghana', qty: '1 License', price: '$15,000', verified: true, insurance: true, image: '🎨' },
    { id: 'LST-006', name: 'Arabica Coffee Beans', category: 'agriculture', origin: 'DR', qty: '25 MT', price: '$1,820/MT', verified: true, insurance: true, image: '☕' },
  ];

  const filteredListings = selectedCategory === 'all' 
    ? listings 
    : listings.filter(l => l.category === selectedCategory);

  return (
    <div className="p-6 space-y-6">
      {/* Category Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'}`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border 
            border-slate-700/30 overflow-hidden hover:border-amber-500/30 transition-all group cursor-pointer">
            {/* Image Area */}
            <div className="h-40 bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center 
              justify-center text-6xl">
              {listing.image}
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-mono">{listing.id}</p>
                  <h4 className="text-base font-semibold text-white mt-1">{listing.name}</h4>
                </div>
                <div className="flex gap-1">
                  {listing.verified && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center" 
                      title="Verified">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                  {listing.insurance && (
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"
                      title="Insured">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-xs text-slate-400">
                  {listing.origin}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-xs text-slate-400">
                  {listing.qty}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
                <div>
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="text-lg font-bold text-amber-400">{listing.price}</p>
                </div>
                <button className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-sm 
                  font-medium hover:bg-amber-500/20 transition-colors">
                  Trade
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// PRODUCERS SCREEN
// ============================================
interface ProducersScreenProps {
  onStartRegistration?: () => void;
}

const ProducersScreen = ({ onStartRegistration }: ProducersScreenProps) => {
  const producers = [
    { id: 'PRD-001', name: 'Kwame Asante', type: 'Farmer', location: 'Kumasi, Ghana', commodities: ['Cocoa', 'Maize'], verified: true, rating: 4.8, volume: '$125K' },
    { id: 'PRD-002', name: 'Maria Santos', type: 'Cooperative', location: 'Santo Domingo, DR', commodities: ['Coffee', 'Cassava'], verified: true, rating: 4.9, volume: '$280K' },
    { id: 'PRD-003', name: 'Kofi Mining Ltd', type: 'Miner', location: 'Obuasi, Ghana', commodities: ['Gold', 'Bauxite'], verified: true, rating: 4.7, volume: '$890K' },
    { id: 'PRD-004', name: 'Caribbean Arts Collective', type: 'Artisan', location: 'Puerto Plata, DR', commodities: ['Cultural IP'], verified: true, rating: 4.6, volume: '$45K' },
    { id: 'PRD-005', name: 'Green Forest Initiative', type: 'Environmental', location: 'Accra, Ghana', commodities: ['Carbon Credits'], verified: true, rating: 4.9, volume: '$320K' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Producers" value="2,847" change="+124 this month" changeType="up" color="amber" />
        <StatCard icon={CheckCircle2} label="Verified" value="2,412" change="85%" changeType="up" color="emerald" />
        <StatCard icon={Globe} label="Countries" value="12" color="blue" />
        <StatCard icon={Wallet} label="Total Volume" value="$18.5M" change="+22%" changeType="up" color="purple" />
      </div>

      {/* Producer Registration CTA */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent rounded-2xl 
        border border-amber-500/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Register New Producer</h3>
            <p className="text-sm text-slate-400">Onboard farmers, miners, artisans, and cooperatives to the SRGG ecosystem</p>
          </div>
        </div>
        <button
          onClick={onStartRegistration}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500
            to-amber-600 rounded-xl text-sm font-medium text-white hover:from-amber-400
            hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Start Registration
        </button>
      </div>

      {/* Producers Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 overflow-hidden">
        <div className="p-5 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Producer Registry</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search producers..."
                  className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl
                    text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button className="p-2 rounded-xl bg-slate-700/50 text-slate-400 hover:text-white">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl bg-slate-700/50 text-slate-400 hover:text-white">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/30">
              <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase">Producer</th>
              <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase">Type</th>
              <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase">Location</th>
              <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase">Commodities</th>
              <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase">Rating</th>
              <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase">Volume</th>
              <th className="text-left py-3 px-5 text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="text-right py-3 px-5 text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {producers.map((producer) => (
              <tr key={producer.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 
                      flex items-center justify-center text-white font-semibold text-sm">
                      {producer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{producer.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{producer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className="px-2 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-300">
                    {producer.type}
                  </span>
                </td>
                <td className="py-4 px-5 text-sm text-slate-400">{producer.location}</td>
                <td className="py-4 px-5">
                  <div className="flex gap-1 flex-wrap">
                    {producer.commodities.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-xs text-amber-400">
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-white">{producer.rating}</span>
                    <span className="text-amber-400">★</span>
                  </div>
                </td>
                <td className="py-4 px-5 text-sm font-medium text-white">{producer.volume}</td>
                <td className="py-4 px-5">
                  {producer.verified && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
                      bg-emerald-500/10 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </td>
                <td className="py-4 px-5 text-right">
                  <button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// TOKENIZATION SCREEN
// ============================================
const TokenizationScreen = () => {
  const [currentStep, setCurrentStep] = useState(2);
  
  const steps = [
    { id: 1, label: 'Asset Selection', status: 'completed' },
    { id: 2, label: 'Validation', status: 'current' },
    { id: 3, label: 'Insurance', status: 'pending' },
    { id: 4, label: 'Tokenization', status: 'pending' },
    { id: 5, label: 'Marketplace', status: 'pending' },
  ];

  const tokens = [
    { id: 'TKN-001', asset: 'Cocoa Beans Lot #2847', value: '$125,000', tokens: '125,000', status: 'minted', blockchain: 'Polygon' },
    { id: 'TKN-002', asset: 'Gold Reserve Certificate', value: '$380,000', tokens: '380,000', status: 'minted', blockchain: 'Polygon' },
    { id: 'TKN-003', asset: 'Carbon Credits - Forest', value: '$45,000', tokens: '45,000', status: 'pending', blockchain: 'Polygon' },
    { id: 'TKN-004', asset: 'Kente Cultural IP', value: '$15,000', tokens: '15,000', status: 'minted', blockchain: 'Polygon' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Coins} label="Total Tokens Minted" value="4.2M" change="+245K" changeType="up" color="amber" />
        <StatCard icon={Database} label="Assets Tokenized" value="847" change="+32" changeType="up" color="emerald" />
        <StatCard icon={Lock} label="Total Value Locked" value="$18.5M" change="+12%" changeType="up" color="blue" />
        <StatCard icon={Activity} label="24h Transactions" value="1,247" change="+8%" changeType="up" color="purple" />
      </div>

      {/* Tokenization Workflow */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Tokenization Workflow</h3>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                  ${step.status === 'completed' ? 'bg-emerald-500 text-white' :
                    step.status === 'current' ? 'bg-amber-500 text-white ring-4 ring-amber-500/20' :
                    'bg-slate-700 text-slate-400'}`}>
                  {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <p className={`text-xs mt-2 font-medium
                  ${step.status === 'current' ? 'text-amber-400' : 
                    step.status === 'completed' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="bg-slate-900/50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">Validation in Progress</h4>
              <p className="text-sm text-slate-400">Asset: Premium Cocoa Beans - Lot #2847</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Quality Test</span>
              </div>
              <p className="text-xs text-slate-500">Grade A - 98% purity</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">Origin Verified</span>
              </div>
              <p className="text-xs text-slate-500">Kumasi, Ghana - GPS confirmed</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Lab Analysis</span>
              </div>
              <p className="text-xs text-slate-500">In progress - Est. 2 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Token Registry */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Token Registry</h3>
          <button className="text-sm text-amber-400 hover:text-amber-300 font-medium">View All</button>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Token ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Asset</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Value</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Total Tokens</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Blockchain</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-4 text-sm font-mono text-amber-400">{token.id}</td>
                <td className="py-3 px-4 text-sm text-white">{token.asset}</td>
                <td className="py-3 px-4 text-sm font-medium text-white">{token.value}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{token.tokens}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{token.blockchain}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${token.status === 'minted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {token.status === 'minted' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// VALIDATION SCREEN
// ============================================
const ValidationScreen = () => {
  const validationQueue = [
    { id: 'VAL-001', type: 'Lab Test', asset: 'Cocoa Beans', producer: 'Kwame Asante', priority: 'high', status: 'in_progress', eta: '2 hours' },
    { id: 'VAL-002', type: 'Port Inspection', asset: 'Gold Shipment', producer: 'Kofi Mining Ltd', priority: 'high', status: 'queued', eta: '4 hours' },
    { id: 'VAL-003', type: 'Quality Test', asset: 'Coffee Beans', producer: 'Maria Santos', priority: 'medium', status: 'completed', eta: '-' },
    { id: 'VAL-004', type: 'Origin Verification', asset: 'Cassava', producer: 'Ghana Coop', priority: 'low', status: 'queued', eta: '1 day' },
    { id: 'VAL-005', type: 'Carbon Audit', asset: 'Forest Reserve', producer: 'Green Forest', priority: 'medium', status: 'in_progress', eta: '6 hours' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={ClipboardCheck} label="Pending Validations" value="47" color="amber" />
        <StatCard icon={Microscope} label="Lab Tests Today" value="23" change="+5" changeType="up" color="emerald" />
        <StatCard icon={Ship} label="Port Inspections" value="12" color="blue" />
        <StatCard icon={CheckCircle2} label="Completed Today" value="89" change="+15%" changeType="up" color="purple" />
      </div>

      {/* Validation Types */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Microscope, label: 'Lab Analysis', count: 15, color: 'emerald' },
          { icon: Ship, label: 'Port Inspection', count: 8, color: 'blue' },
          { icon: MapPin, label: 'Origin Verification', count: 12, color: 'amber' },
          { icon: TreePine, label: 'Carbon Audit', count: 6, color: 'purple' },
        ].map((type, i) => {
          const Icon = type.icon;
          return (
            <button key={i} className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 
              p-5 hover:border-amber-500/30 transition-all text-left group">
              <Icon className={`w-8 h-8 text-${type.color}-400 mb-3`} />
              <h4 className="text-base font-semibold text-white">{type.label}</h4>
              <p className="text-2xl font-bold text-white mt-2">{type.count}</p>
              <p className="text-xs text-slate-500">pending</p>
            </button>
          );
        })}
      </div>

      {/* Validation Queue */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Validation Queue</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 
            rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            New Validation
          </button>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Asset</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Producer</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Priority</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">ETA</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {validationQueue.map((item) => (
              <tr key={item.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-4 text-sm font-mono text-amber-400">{item.id}</td>
                <td className="py-3 px-4 text-sm text-white">{item.type}</td>
                <td className="py-3 px-4 text-sm text-white">{item.asset}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{item.producer}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium
                    ${item.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      item.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-slate-700/50 text-slate-400'}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      item.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-700/50 text-slate-400'}`}>
                    {item.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> :
                     item.status === 'in_progress' ? <RefreshCw className="w-3 h-3 animate-spin" /> :
                     <Clock className="w-3 h-3" />}
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">{item.eta}</td>
                <td className="py-3 px-4 text-right">
                  <button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// INSURANCE SCREEN
// ============================================
const InsuranceScreen = () => {
  const policies = [
    { id: 'POL-001', type: 'Parametric Crop', asset: 'Cocoa Plantation', coverage: '$500,000', premium: '$15,000/yr', provider: "Lloyd's", status: 'active' },
    { id: 'POL-002', type: 'Maritime Shipping', asset: 'Gold Shipment', coverage: '$2,000,000', premium: '$45,000', provider: "Lloyd's", status: 'active' },
    { id: 'POL-003', type: 'Livestock Mortality', asset: 'Cattle Herd', coverage: '$150,000', premium: '$8,500/yr', provider: "Lloyd's", status: 'pending' },
    { id: 'POL-004', type: 'Carbon Credit', asset: 'Forest Reserve', coverage: '$300,000', premium: '$12,000/yr', provider: "Lloyd's", status: 'active' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Shield} label="Total Coverage" value="$18.5M" change="+$2.1M" changeType="up" color="amber" />
        <StatCard icon={FileText} label="Active Policies" value="247" change="+12" changeType="up" color="emerald" />
        <StatCard icon={AlertTriangle} label="Open Claims" value="8" color="red" />
        <StatCard icon={Landmark} label="Claims Paid (YTD)" value="$1.2M" color="blue" />
      </div>

      {/* Lloyd's Integration Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-blue-600/5 to-transparent rounded-2xl 
        border border-blue-500/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Landmark className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Lloyd's of London Integration</h3>
            <p className="text-sm text-slate-400">Enterprise-grade insurance coverage for all SRGG assets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
            ✓ Connected
          </span>
        </div>
      </div>

      {/* Insurance Types */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Wheat, label: 'Crop Insurance', desc: 'Parametric coverage' },
          { icon: Ship, label: 'Maritime', desc: 'Shipping & cargo' },
          { icon: Factory, label: 'Supply Chain', desc: 'Delay coverage' },
          { icon: TreePine, label: 'Carbon Credits', desc: 'Authenticity protection' },
        ].map((type, i) => {
          const Icon = type.icon;
          return (
            <div key={i} className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 
              p-5 hover:border-blue-500/30 transition-all cursor-pointer group">
              <Icon className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="text-base font-semibold text-white">{type.label}</h4>
              <p className="text-xs text-slate-500 mt-1">{type.desc}</p>
              <button className="mt-4 text-sm text-blue-400 font-medium group-hover:text-blue-300">
                Get Quote →
              </button>
            </div>
          );
        })}
      </div>

      {/* Policies Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Active Policies</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 
            rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            New Policy
          </button>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Policy ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Asset</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Coverage</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Premium</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Provider</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-4 text-sm font-mono text-blue-400">{policy.id}</td>
                <td className="py-3 px-4 text-sm text-white">{policy.type}</td>
                <td className="py-3 px-4 text-sm text-white">{policy.asset}</td>
                <td className="py-3 px-4 text-sm font-medium text-white">{policy.coverage}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{policy.premium}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{policy.provider}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${policy.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {policy.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// HEDGING SCREEN
// ============================================
const HedgingScreen = () => {
  const positions = [
    { id: 'HDG-001', commodity: 'Cocoa Futures', type: 'Long', qty: '100 MT', strike: '$2,400/MT', expiry: 'Mar 2025', pnl: '+$15,200', status: 'open' },
    { id: 'HDG-002', commodity: 'Gold Options', type: 'Put', qty: '50 oz', strike: '$1,900/oz', expiry: 'Feb 2025', pnl: '-$2,100', status: 'open' },
    { id: 'HDG-003', commodity: 'Maize Futures', type: 'Short', qty: '200 MT', strike: '$220/MT', expiry: 'Apr 2025', pnl: '+$8,400', status: 'open' },
    { id: 'HDG-004', commodity: 'Coffee Futures', type: 'Long', qty: '50 MT', strike: '$1,750/MT', expiry: 'Jan 2025', pnl: '+$4,500', status: 'closed' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Positions" value="$6.8M" change="+$890K" changeType="up" color="amber" />
        <StatCard icon={Target} label="Active Hedges" value="124" change="+8" changeType="up" color="emerald" />
        <StatCard icon={Activity} label="Unrealized P&L" value="+$245K" change="+12%" changeType="up" color="blue" />
        <StatCard icon={Scale} label="Hedge Ratio" value="78%" color="purple" />
      </div>

      {/* CME Integration */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent rounded-2xl 
        border border-emerald-500/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">CME Integration</h3>
            <p className="text-sm text-slate-400">Chicago Mercantile Exchange - Live futures & options</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
            ✓ Live Feed
          </span>
          <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm 
            font-medium hover:bg-emerald-500/20 transition-colors">
            Open Terminal
          </button>
        </div>
      </div>

      {/* Quick Trade Panel */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Hedge</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Commodity</label>
              <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white focus:outline-none focus:border-amber-500/50">
                <option>Cocoa Futures</option>
                <option>Gold Options</option>
                <option>Maize Futures</option>
                <option>Coffee Futures</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Position Type</label>
              <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white focus:outline-none focus:border-amber-500/50">
                <option>Long (Buy)</option>
                <option>Short (Sell)</option>
                <option>Put Option</option>
                <option>Call Option</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Quantity</label>
              <input type="text" placeholder="e.g., 100 MT" 
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                  text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Strike Price</label>
              <input type="text" placeholder="e.g., $2,400/MT" 
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                  text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <button className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 
            rounded-xl text-sm font-medium text-white hover:from-amber-400 hover:to-amber-500 
            transition-all shadow-lg shadow-amber-500/20">
            Execute Hedge Position
          </button>
        </div>

        {/* Risk Metrics */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl">
              <p className="text-xs text-slate-500">Value at Risk (VaR)</p>
              <p className="text-xl font-bold text-white mt-1">$125,000</p>
              <p className="text-xs text-slate-500 mt-1">95% confidence, 1-day</p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl">
              <p className="text-xs text-slate-500">Portfolio Beta</p>
              <p className="text-xl font-bold text-white mt-1">0.85</p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl">
              <p className="text-xs text-slate-500">Sharpe Ratio</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">1.42</p>
            </div>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Open Positions</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Position ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Commodity</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Quantity</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Strike</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Expiry</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">P&L</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-4 text-sm font-mono text-amber-400">{pos.id}</td>
                <td className="py-3 px-4 text-sm text-white">{pos.commodity}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium
                    ${pos.type === 'Long' ? 'bg-emerald-500/10 text-emerald-400' :
                      pos.type === 'Short' ? 'bg-red-500/10 text-red-400' :
                      'bg-blue-500/10 text-blue-400'}`}>
                    {pos.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">{pos.qty}</td>
                <td className="py-3 px-4 text-sm text-white">{pos.strike}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{pos.expiry}</td>
                <td className={`py-3 px-4 text-sm font-medium ${pos.pnl.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pos.pnl}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${pos.status === 'open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                    {pos.status === 'open' ? <Activity className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {pos.status.charAt(0).toUpperCase() + pos.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// LOGISTICS SCREEN
// ============================================
const LogisticsScreen = () => {
  const shipments = [
    { id: 'SHP-001', cargo: 'Cocoa Beans', origin: 'Tema Port', dest: 'Rotterdam', vessel: 'MV Atlantic Star', status: 'in_transit', eta: '12 days' },
    { id: 'SHP-002', cargo: 'Gold Bars', origin: 'Accra Airport', dest: 'London', vessel: 'BA Flight 082', status: 'loading', eta: '2 days' },
    { id: 'SHP-003', cargo: 'Coffee Beans', origin: 'Santo Domingo', dest: 'Miami', vessel: 'MV Caribbean Queen', status: 'in_transit', eta: '5 days' },
    { id: 'SHP-004', cargo: 'Cassava Flour', origin: 'Tema Port', dest: 'Hamburg', vessel: 'MSC Diana', status: 'customs', eta: '3 days' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Ship} label="Active Shipments" value="47" change="+5" changeType="up" color="amber" />
        <StatCard icon={Container} label="Containers" value="234" color="emerald" />
        <StatCard icon={Truck} label="Land Transport" value="89" color="blue" />
        <StatCard icon={CheckCircle2} label="Delivered (MTD)" value="156" change="+23%" changeType="up" color="purple" />
      </div>

      {/* Port Gateways */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { name: 'Port of Tema', location: 'Ghana', status: 'operational', containers: 145, congestion: 'low' },
          { name: 'Santo Domingo Port', location: 'Dominican Republic', status: 'operational', containers: 89, congestion: 'medium' },
          { name: 'Takoradi Port', location: 'Ghana', status: 'operational', containers: 62, congestion: 'low' },
        ].map((port, i) => (
          <div key={i} className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Anchor className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">{port.name}</h4>
                  <p className="text-xs text-slate-500">{port.location}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
                {port.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-slate-900/50 rounded-xl">
                <p className="text-xs text-slate-500">Containers</p>
                <p className="text-lg font-bold text-white">{port.containers}</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl">
                <p className="text-xs text-slate-500">Congestion</p>
                <p className={`text-lg font-bold ${port.congestion === 'low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {port.congestion.charAt(0).toUpperCase() + port.congestion.slice(1)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shipments Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Active Shipments</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 
            rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            New Shipment
          </button>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Shipment ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Cargo</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Origin</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Destination</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Vessel</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">ETA</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((ship) => (
              <tr key={ship.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-4 text-sm font-mono text-blue-400">{ship.id}</td>
                <td className="py-3 px-4 text-sm text-white">{ship.cargo}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{ship.origin}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{ship.dest}</td>
                <td className="py-3 px-4 text-sm text-white">{ship.vessel}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${ship.status === 'in_transit' ? 'bg-blue-500/10 text-blue-400' :
                      ship.status === 'loading' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-purple-500/10 text-purple-400'}`}>
                    {ship.status === 'in_transit' ? <Ship className="w-3 h-3" /> :
                     ship.status === 'loading' ? <Boxes className="w-3 h-3" /> :
                     <FileCheck className="w-3 h-3" />}
                    {ship.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">{ship.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// ANALYTICS SCREEN
// ============================================
const AnalyticsScreen = () => {
  return (
    <div className="p-6 space-y-6">
      {/* AI Integration Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-purple-600/5 to-transparent rounded-2xl 
        border border-purple-500/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Quantum AI Analytics</h3>
            <p className="text-sm text-slate-400">AI-powered market predictions and risk analysis</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl text-sm 
          font-medium hover:bg-purple-500/20 transition-colors">
          Run Analysis
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Market Prediction Accuracy" value="94.2%" change="+2.1%" changeType="up" color="purple" />
        <StatCard icon={Activity} label="Processed Data Points" value="2.4M" change="+156K" changeType="up" color="amber" />
        <StatCard icon={Target} label="Risk Alerts Generated" value="47" color="red" />
        <StatCard icon={Award} label="AI Confidence Score" value="98.5%" color="emerald" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Commodity Flow */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Commodity Flow Analysis</h3>
          <div className="h-64 flex items-end justify-around gap-4 px-4">
            {[
              { label: 'Cocoa', value: 85, color: 'amber' },
              { label: 'Gold', value: 72, color: 'yellow' },
              { label: 'Coffee', value: 58, color: 'emerald' },
              { label: 'Maize', value: 45, color: 'blue' },
              { label: 'Carbon', value: 38, color: 'purple' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className={`w-full bg-gradient-to-t from-${item.color}-500/80 to-${item.color}-400/40 
                    rounded-t-lg hover:from-${item.color}-400 transition-all cursor-pointer`}
                  style={{ height: `${item.value}%` }}
                />
                <span className="text-xs text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Heatmap */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Heatmap by Region</h3>
          <div className="grid grid-cols-4 gap-2">
            {([
              { region: 'Ghana', weather: 'low', market: 'medium', supply: 'low', logistics: 'low' },
              { region: 'DR', weather: 'medium', market: 'low', supply: 'low', logistics: 'medium' },
              { region: 'Nigeria', weather: 'high', market: 'medium', supply: 'medium', logistics: 'high' },
              { region: 'Kenya', weather: 'low', market: 'low', supply: 'low', logistics: 'medium' },
            ] as const).map((row, i) => (
              <React.Fragment key={i}>
                <div className="text-sm text-white font-medium py-2">{row.region}</div>
                {(['weather', 'market', 'supply', 'logistics'] as const).map((key) => (
                  <div
                    key={key}
                    className={`p-2 rounded-lg text-center text-xs font-medium
                      ${row[key] === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                        row[key] === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'}`}
                  >
                    {row[key].toUpperCase()}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/50"></span> Low</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/50"></span> Medium</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/50"></span> High</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">AI-Generated Insights</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Cocoa Price Prediction', insight: 'Expected 8% increase in Q1 2025 due to supply constraints in Ivory Coast', confidence: 92, type: 'bullish' },
            { title: 'Weather Alert - Ghana', insight: 'Dry season may affect maize yields in Northern region. Consider hedging positions.', confidence: 87, type: 'warning' },
            { title: 'Carbon Credit Opportunity', insight: 'Mangrove restoration projects showing 2.3x ROI. High demand from EU buyers.', confidence: 95, type: 'opportunity' },
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-xl border
              ${item.type === 'bullish' ? 'bg-emerald-500/5 border-emerald-500/20' :
                item.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-blue-500/5 border-blue-500/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${item.type === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'}`}>
                  {item.confidence}% confidence
                </span>
              </div>
              <p className="text-sm text-slate-400">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SETTINGS SCREEN
// ============================================
const SettingsScreen = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="col-span-2 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 
              flex items-center justify-center text-white font-bold text-2xl">
              SP
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                  <input type="text" defaultValue="Sudipto Paul" 
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                      text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input type="email" defaultValue="sudipto@infinititech.com" 
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                      text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Role</label>
                  <input type="text" defaultValue="Administrator" disabled
                    className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700/30 rounded-xl
                      text-slate-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Hub Assignment</label>
                  <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                    text-white focus:outline-none focus:border-amber-500/50">
                    <option>Ghana Hub</option>
                    <option>Dominican Republic Hub</option>
                    <option>All Hubs</option>
                  </select>
                </div>
              </div>
              <button className="px-6 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-sm 
                font-medium hover:bg-amber-500/20 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 bg-slate-900/50 rounded-xl
              hover:bg-slate-900/70 transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-white">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-slate-900/50 rounded-xl
              hover:bg-slate-900/70 transition-colors">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-white">Biometric Login</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs">Enabled</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-slate-900/50 rounded-xl
              hover:bg-slate-900/70 transition-colors">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-white">Two-Factor Auth</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs">Enabled</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Settings */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">External Integrations</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "Lloyd's of London", status: 'connected', icon: Landmark },
            { name: 'CME Exchange', status: 'connected', icon: BarChart3 },
            { name: 'Blockchain Node', status: 'connected', icon: Database },
            { name: 'IoT Gateway', status: 'connected', icon: Zap },
          ].map((integration, i) => {
            const Icon = integration.icon;
            return (
              <div key={i} className="p-4 bg-slate-900/50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-6 h-6 text-slate-400" />
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs">
                    {integration.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{integration.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMMODITIES SCREEN
// ============================================
const CommoditiesScreen = () => {
  const commodities = [
    { id: 'COM-001', name: 'Cocoa Beans', category: 'Agriculture', hsCode: '1801.00', origin: 'Ghana', totalVolume: '2,450 MT', avgPrice: '$2,485/MT' },
    { id: 'COM-002', name: 'Gold', category: 'Minerals', hsCode: '7108.12', origin: 'Ghana', totalVolume: '1,200 oz', avgPrice: '$1,925/oz' },
    { id: 'COM-003', name: 'Arabica Coffee', category: 'Agriculture', hsCode: '0901.11', origin: 'DR', totalVolume: '890 MT', avgPrice: '$1,820/MT' },
    { id: 'COM-004', name: 'Cassava', category: 'Agriculture', hsCode: '0714.10', origin: 'Ghana', totalVolume: '1,850 MT', avgPrice: '$180/MT' },
    { id: 'COM-005', name: 'Carbon Credits', category: 'Environmental', hsCode: 'N/A', origin: 'Multi', totalVolume: '45,000 tCO2', avgPrice: '$32/tCO2' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Commodities" value="156" change="+12" changeType="up" color="amber" />
        <StatCard icon={Wheat} label="Agriculture" value="89" color="emerald" />
        <StatCard icon={Gem} label="Minerals" value="34" color="blue" />
        <StatCard icon={TreePine} label="Environmental" value="33" color="purple" />
      </div>

      {/* Commodity Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Commodity Registry</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 
            rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-colors">
            <Plus className="w-4 h-4" />
            Add Commodity
          </button>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Category</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">HS Code</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Origin</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Total Volume</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Avg Price</th>
            </tr>
          </thead>
          <tbody>
            {commodities.map((com) => (
              <tr key={com.id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                <td className="py-3 px-4 text-sm font-mono text-amber-400">{com.id}</td>
                <td className="py-3 px-4 text-sm text-white">{com.name}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium
                    ${com.category === 'Agriculture' ? 'bg-emerald-500/10 text-emerald-400' :
                      com.category === 'Minerals' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-purple-500/10 text-purple-400'}`}>
                    {com.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-mono text-slate-400">{com.hsCode}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{com.origin}</td>
                <td className="py-3 px-4 text-sm text-white">{com.totalVolume}</td>
                <td className="py-3 px-4 text-sm font-medium text-white">{com.avgPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function SRGGMarketplace() {
  const router = useRouter();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProducerRegistration, setShowProducerRegistration] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid user data, redirect to login
        router.push('/login');
      }
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Handle opening producer registration
  const handleStartRegistration = () => {
    setShowProducerRegistration(true);
  };

  const screenTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Welcome back' },
    marketplace: { title: 'Marketplace', subtitle: 'Browse and trade tokenized assets' },
    producers: { title: 'Producer Registry', subtitle: 'Manage farmers, miners, and artisans' },
    commodities: { title: 'Commodities', subtitle: 'Commodity master data management' },
    tokenization: { title: 'Tokenization', subtitle: 'Asset tokenization and blockchain registry' },
    validation: { title: 'Validation Center', subtitle: 'Lab tests, inspections, and certifications' },
    insurance: { title: 'Insurance', subtitle: "Lloyd's integrated coverage" },
    hedging: { title: 'Hedging & Futures', subtitle: 'CME integration and risk management' },
    logistics: { title: 'Logistics', subtitle: 'Port operations and shipment tracking' },
    analytics: { title: 'Analytics', subtitle: 'Quantum AI insights and reporting' },
    settings: { title: 'Settings', subtitle: 'Platform configuration' },
  };

  const { title, subtitle } = screenTitles[activeScreen] || screenTitles.dashboard;

  // Render the active screen
  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'marketplace':
        return <MarketplaceScreen />;
      case 'producers':
        return <ProducersScreen onStartRegistration={handleStartRegistration} />;
      case 'commodities':
        return <CommoditiesScreen />;
      case 'tokenization':
        return <TokenizationScreen />;
      case 'validation':
        return <ValidationScreen />;
      case 'insurance':
        return <InsuranceScreen />;
      case 'hedging':
        return <HedgingScreen />;
      case 'logistics':
        return <LogisticsScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(212, 168, 83, 0.03) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(37, 99, 235, 0.03) 0%, transparent 50%)`
        }} />
      </div>

      <Sidebar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={user}
        onLogout={handleLogout}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header
          title={title}
          subtitle={subtitle}
          userName={user?.name?.split(' ')[0]}
          onNewListing={handleStartRegistration}
        />
        {renderScreen()}
      </main>

      {/* Producer Registration Modal */}
      {showProducerRegistration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowProducerRegistration(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-800 text-slate-400
                hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <ProducerRegistrationFlow />
          </div>
        </div>
      )}
    </div>
  );
}
