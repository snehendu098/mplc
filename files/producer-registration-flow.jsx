import React, { useState } from 'react';
import { 
  User, MapPin, FileText, Fingerprint, CheckCircle2, ChevronRight,
  Upload, Camera, Globe, Phone, Mail, Building, Calendar, ArrowLeft,
  Shield, Award, Leaf, Wheat, Gem, Music, TreePine, X, Check
} from 'lucide-react';

// ============================================
// PRODUCER REGISTRATION FLOW
// Multi-step registration for Farmers, Miners, Artisans
// ============================================

const ProducerRegistrationFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [producerType, setProducerType] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    
    // Address
    country: '',
    region: '',
    city: '',
    address: '',
    postalCode: '',
    gpsCoordinates: '',
    
    // Identity
    idType: '',
    idNumber: '',
    idDocument: null,
    
    // Producer Specific
    producerType: '',
    businessName: '',
    yearsExperience: '',
    commodities: [],
    
    // Land/Asset Registration
    parcels: [],
    
    // Biometric
    biometricConsent: false,
    faceImage: null,
    fingerprint: null,
  });

  const steps = [
    { id: 1, label: 'Producer Type', icon: User },
    { id: 2, label: 'Personal Info', icon: FileText },
    { id: 3, label: 'Location', icon: MapPin },
    { id: 4, label: 'Identity', icon: Shield },
    { id: 5, label: 'Commodities', icon: Wheat },
    { id: 6, label: 'Assets', icon: Building },
    { id: 7, label: 'Biometrics', icon: Fingerprint },
    { id: 8, label: 'Review', icon: CheckCircle2 },
  ];

  const producerTypes = [
    { id: 'farmer', label: 'Farmer', icon: Wheat, desc: 'Individual or cooperative farmer', color: 'emerald' },
    { id: 'miner', label: 'Miner', icon: Gem, desc: 'Mining operator or artisan', color: 'blue' },
    { id: 'artisan', label: 'Artisan', icon: Music, desc: 'Cultural IP creator', color: 'purple' },
    { id: 'cooperative', label: 'Cooperative', icon: Building, desc: 'Registered cooperative', color: 'amber' },
    { id: 'environmental', label: 'Environmental', icon: TreePine, desc: 'Carbon/forestry projects', color: 'green' },
  ];

  const commodityOptions = {
    farmer: ['Cocoa', 'Coffee', 'Maize', 'Cassava', 'Rice', 'Plantain', 'Yam', 'Vegetables', 'Fruits', 'Palm Oil'],
    miner: ['Gold', 'Diamond', 'Bauxite', 'Manganese', 'Iron Ore', 'Limestone', 'Salt'],
    artisan: ['Kente', 'Adinkra', 'Pottery', 'Wood Carving', 'Music', 'Dance', 'Traditional Medicine'],
    cooperative: ['Mixed Agriculture', 'Processing', 'Export', 'Storage'],
    environmental: ['Carbon Credits', 'Mangrove Restoration', 'Reforestation', 'Agroforestry'],
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Step 1: Producer Type Selection
  const ProducerTypeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Select Producer Type</h2>
        <p className="text-slate-400">Choose the category that best describes your activities</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {producerTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = producerType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => {
                setProducerType(type.id);
                setFormData(prev => ({ ...prev, producerType: type.id }));
              }}
              className={`p-6 rounded-2xl border-2 text-left transition-all
                ${isSelected 
                  ? `bg-${type.color}-500/10 border-${type.color}-500/50 ring-2 ring-${type.color}-500/20` 
                  : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'}`}
            >
              <div className={`w-14 h-14 rounded-xl bg-${type.color}-500/20 flex items-center 
                justify-center mb-4`}>
                <Icon className={`w-7 h-7 text-${type.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{type.label}</h3>
              <p className="text-sm text-slate-400">{type.desc}</p>
              {isSelected && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step 2: Personal Information
  const PersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-slate-400">Provide your basic contact details</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-slate-400 mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter your full legal name"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50
              focus:ring-1 focus:ring-amber-500/20"
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-400 mb-2">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+233 XX XXX XXXX"
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-slate-400 mb-2">Nationality</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              value={formData.nationality}
              onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="">Select nationality</option>
              <option value="GH">Ghana</option>
              <option value="DR">Dominican Republic</option>
              <option value="NG">Nigeria</option>
              <option value="KE">Kenya</option>
              <option value="CO">Colombia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Location
  const LocationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Location Details</h2>
        <p className="text-slate-400">Provide your address and geographic information</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Country *</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select country</option>
            <option value="GH">Ghana</option>
            <option value="DR">Dominican Republic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Region / State *</label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
            placeholder="e.g., Ashanti Region"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">City / Town *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            placeholder="e.g., Kumasi"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Postal Code</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
            placeholder="Enter postal code"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-slate-400 mb-2">Street Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Enter full street address"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-slate-400 mb-2">GPS Coordinates</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={formData.gpsCoordinates}
                onChange={(e) => setFormData(prev => ({ ...prev, gpsCoordinates: e.target.value }))}
                placeholder="e.g., 6.6885° N, 1.6244° W"
                className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                  text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <button className="px-4 py-3 bg-amber-500/10 text-amber-400 rounded-xl text-sm 
              font-medium hover:bg-amber-500/20 transition-colors whitespace-nowrap">
              📍 Get Current Location
            </button>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="h-48 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center 
        justify-center text-slate-500">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Interactive map will load here</p>
          <p className="text-xs">Click to pin exact location</p>
        </div>
      </div>
    </div>
  );

  // Step 4: Identity Verification
  const IdentityStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Identity Verification</h2>
        <p className="text-slate-400">Provide official identification documents</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">ID Document Type *</label>
          <select
            value={formData.idType}
            onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select ID type</option>
            <option value="national_id">National ID Card</option>
            <option value="passport">Passport</option>
            <option value="voters_id">Voter's ID</option>
            <option value="drivers_license">Driver's License</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">ID Number *</label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
            placeholder="Enter ID number"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-2">Upload ID Document *</label>
        <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-8 text-center
          hover:border-amber-500/50 transition-colors cursor-pointer">
          <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">Drop file here or click to upload</p>
          <p className="text-sm text-slate-500">PNG, JPG or PDF up to 10MB</p>
        </div>
      </div>

      {/* Additional Docs for Cooperatives */}
      {producerType === 'cooperative' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-white">Business Documents</h3>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Business Registration Certificate</label>
            <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-6 text-center
              hover:border-amber-500/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Upload registration certificate</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Tax Identification Number (TIN)</label>
            <input
              type="text"
              placeholder="Enter TIN"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-white">Secure & Encrypted</h4>
          <p className="text-xs text-slate-400 mt-1">
            Your documents are encrypted and stored securely on the SRGG blockchain. 
            Only authorized validators can access verification data.
          </p>
        </div>
      </div>
    </div>
  );

  // Step 5: Commodities Selection
  const CommoditiesStep = () => {
    const availableCommodities = commodityOptions[producerType] || [];
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Select Commodities</h2>
          <p className="text-slate-400">Choose the commodities you produce or trade</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {availableCommodities.map((commodity) => {
            const isSelected = formData.commodities.includes(commodity);
            return (
              <button
                key={commodity}
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    commodities: isSelected
                      ? prev.commodities.filter(c => c !== commodity)
                      : [...prev.commodities, commodity]
                  }));
                }}
                className={`p-4 rounded-xl border text-left transition-all
                  ${isSelected 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' 
                    : 'bg-slate-800/30 border-slate-700/30 text-slate-300 hover:border-slate-600'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{commodity}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>

        {formData.commodities.length > 0 && (
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Selected Commodities:</h4>
            <div className="flex flex-wrap gap-2">
              {formData.commodities.map((commodity) => (
                <span key={commodity} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 
                  rounded-lg text-sm font-medium flex items-center gap-2">
                  {commodity}
                  <button 
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      commodities: prev.commodities.filter(c => c !== commodity)
                    }))}
                    className="hover:text-amber-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-400 mb-2">Years of Experience</label>
          <select
            value={formData.yearsExperience}
            onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
              text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="">Select experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
      </div>
    );
  };

  // Step 6: Asset Registration (Parcels/Land)
  const AssetsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {producerType === 'farmer' ? 'Land Parcel Registration' : 
           producerType === 'miner' ? 'Mining Site Registration' :
           'Asset Registration'}
        </h2>
        <p className="text-slate-400">Register your productive assets for tokenization</p>
      </div>

      {/* Existing Parcels */}
      {formData.parcels.length > 0 && (
        <div className="space-y-3">
          {formData.parcels.map((parcel, index) => (
            <div key={index} className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Parcel #{index + 1}</p>
                  <p className="text-sm text-slate-400">{parcel.size} hectares • {parcel.location}</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Parcel Form */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
        <h3 className="text-base font-semibold text-white mb-4">
          Add {producerType === 'miner' ? 'Mining Site' : 'Land Parcel'}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              {producerType === 'miner' ? 'Site Name' : 'Parcel Name'}
            </label>
            <input
              type="text"
              placeholder="e.g., Main Farm"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Size ({producerType === 'miner' ? 'sq meters' : 'hectares'})
            </label>
            <input
              type="number"
              placeholder="Enter size"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
                text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm text-slate-400 mb-2">GPS Boundary</label>
            <div className="h-40 bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center 
              justify-center text-slate-500">
              <div className="text-center">
                <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Draw boundary on map</p>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm text-slate-400 mb-2">Land/Site Documents</label>
            <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-4 text-center
              hover:border-amber-500/50 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Upload ownership documents</p>
            </div>
          </div>
        </div>

        <button className="mt-4 w-full py-3 bg-emerald-500/10 text-emerald-400 rounded-xl 
          font-medium hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2">
          <Check className="w-5 h-5" />
          Add Parcel
        </button>
      </div>
    </div>
  );

  // Step 7: Biometrics
  const BiometricsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Biometric Registration</h2>
        <p className="text-slate-400">Optional but recommended for high-value transactions</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <Award className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-white">Why Biometrics?</h4>
          <p className="text-xs text-slate-400 mt-1">
            Biometric verification enables faster approvals, higher transaction limits, 
            and priority access to insurance and hedging products.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Face Capture */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 text-center">
          <div className="w-32 h-32 rounded-full bg-slate-900/50 mx-auto mb-4 flex items-center 
            justify-center overflow-hidden">
            <Camera className="w-12 h-12 text-slate-500" />
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Face Capture</h4>
          <p className="text-sm text-slate-400 mb-4">Take a clear photo of your face</p>
          <button className="px-6 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-sm 
            font-medium hover:bg-amber-500/20 transition-colors">
            📷 Capture Photo
          </button>
        </div>

        {/* Fingerprint */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 text-center">
          <div className="w-32 h-32 rounded-full bg-slate-900/50 mx-auto mb-4 flex items-center 
            justify-center">
            <Fingerprint className="w-12 h-12 text-slate-500" />
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Fingerprint Scan</h4>
          <p className="text-sm text-slate-400 mb-4">Scan your fingerprint</p>
          <button className="px-6 py-2 bg-amber-500/10 text-amber-400 rounded-xl text-sm 
            font-medium hover:bg-amber-500/20 transition-colors">
            👆 Start Scan
          </button>
        </div>
      </div>

      {/* Consent */}
      <div className="bg-slate-900/50 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.biometricConsent}
            onChange={(e) => setFormData(prev => ({ ...prev, biometricConsent: e.target.checked }))}
            className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-800 text-amber-500 
              focus:ring-amber-500/20"
          />
          <div>
            <p className="text-sm text-white font-medium">I consent to biometric data collection</p>
            <p className="text-xs text-slate-400 mt-1">
              I understand that my biometric data will be securely stored and used only for 
              identity verification on the SRGG platform.
            </p>
          </div>
        </label>
      </div>

      <button className="w-full py-3 bg-slate-700/50 text-slate-400 rounded-xl font-medium
        hover:bg-slate-700/70 transition-colors">
        Skip Biometrics (Complete Later)
      </button>
    </div>
  );

  // Step 8: Review & Submit
  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Review & Submit</h2>
        <p className="text-slate-400">Verify your information before submitting</p>
      </div>

      <div className="space-y-4">
        {/* Producer Type */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-400">Producer Type</h4>
            <button className="text-xs text-amber-400 hover:text-amber-300">Edit</button>
          </div>
          <p className="text-white font-medium capitalize">{producerType || 'Not selected'}</p>
        </div>

        {/* Personal Info */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-400">Personal Information</h4>
            <button className="text-xs text-amber-400 hover:text-amber-300">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-slate-500">Name:</span> <span className="text-white">{formData.fullName || '-'}</span></p>
            <p><span className="text-slate-500">Email:</span> <span className="text-white">{formData.email || '-'}</span></p>
            <p><span className="text-slate-500">Phone:</span> <span className="text-white">{formData.phone || '-'}</span></p>
            <p><span className="text-slate-500">Nationality:</span> <span className="text-white">{formData.nationality || '-'}</span></p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-400">Location</h4>
            <button className="text-xs text-amber-400 hover:text-amber-300">Edit</button>
          </div>
          <p className="text-white text-sm">
            {[formData.city, formData.region, formData.country].filter(Boolean).join(', ') || '-'}
          </p>
        </div>

        {/* Commodities */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-400">Commodities</h4>
            <button className="text-xs text-amber-400 hover:text-amber-300">Edit</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.commodities.length > 0 ? formData.commodities.map((c) => (
              <span key={c} className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded text-xs">
                {c}
              </span>
            )) : <span className="text-slate-500 text-sm">None selected</span>}
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-slate-400 mb-3">Verification Status</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              {formData.idNumber ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <X className="w-4 h-4 text-slate-500" />
              )}
              <span className={`text-sm ${formData.idNumber ? 'text-white' : 'text-slate-500'}`}>
                ID Verified
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.biometricConsent ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <X className="w-4 h-4 text-slate-500" />
              )}
              <span className={`text-sm ${formData.biometricConsent ? 'text-white' : 'text-slate-500'}`}>
                Biometrics
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.parcels.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <X className="w-4 h-4 text-slate-500" />
              )}
              <span className={`text-sm ${formData.parcels.length > 0 ? 'text-white' : 'text-slate-500'}`}>
                Assets Registered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-slate-900/50 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5 rounded border-slate-700 bg-slate-800 text-amber-500 
              focus:ring-amber-500/20"
          />
          <div>
            <p className="text-sm text-white font-medium">I agree to the Terms & Conditions</p>
            <p className="text-xs text-slate-400 mt-1">
              By registering, I confirm that all provided information is accurate and I agree to 
              SRGG's terms of service and privacy policy.
            </p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <ProducerTypeStep />;
      case 2: return <PersonalInfoStep />;
      case 3: return <LocationStep />;
      case 4: return <IdentityStep />;
      case 5: return <CommoditiesStep />;
      case 6: return <AssetsStep />;
      case 7: return <BiometricsStep />;
      case 8: return <ReviewStep />;
      default: return <ProducerTypeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 
              flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SRGG Producer Registration</h1>
              <p className="text-sm text-slate-500">Join the global commodity marketplace</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isCompleted ? 'bg-amber-500 text-white' :
                      isCurrent ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500' :
                      'bg-slate-800 text-slate-500'}`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden md:block
                    ${isCurrent ? 'text-amber-400' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${currentStep === 1 
                ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed' 
                : 'bg-slate-800 text-white hover:bg-slate-700'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 8 ? (
            <button
              onClick={nextStep}
              disabled={currentStep === 1 && !producerType}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                ${currentStep === 1 && !producerType
                  ? 'bg-amber-500/50 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20'}`}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 
              to-emerald-600 rounded-xl font-medium text-white hover:from-emerald-400 
              hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
              Submit Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProducerRegistrationFlow;
