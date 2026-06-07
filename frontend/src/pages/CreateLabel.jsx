import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { generateTrackingNumber } from '../utils/helpers';
import LabelPreview from '../components/LabelPreview';
import defaultLogo from '../utils/logo/PNG_LOGO.png';
import { 
  FileText, 
  User, 
  Phone, 
  MapPin, 
  Scale, 
  Hash, 
  DollarSign, 
  FileSignature, 
  Image, 
  Layers, 
  Maximize2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const CreateLabel = () => {
  const { refetchStats } = useOutletContext();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [logoPreview, setLogoPreview] = useState(defaultLogo);
  const [generatedData, setGeneratedData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize tracking number on mount
  useEffect(() => {
    setTrackingNumber(generateTrackingNumber());
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      templateId: '1',
      labelSize: '4x6',
      weight: '0.5',
      weightUnit: 'kg',
      orderId: '',
      codAmount: '0',
      notes: ''
    }
  });

  // Watch fields for live preview
  const watchedFields = watch();

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setValue('logo', null);
  };

  const handleUseDefaultLogo = () => {
    setLogoPreview(defaultLogo);
  };

  const onSubmit = async (data) => {
    setError('');
    setIsSaved(false);
    setLoading(true);

    try {
      // 1. Generate full label data object for the preview component
      const labelPayload = {
        ...data,
        trackingNumber: trackingNumber
      };

      // 2. Call backend API to record minimal history and update stats
      await api.post('/api/labels/generate', {
        receiverName: data.receiverName,
        phoneNumber: data.phoneNumber
      });

      // 3. Set generated data & states
      setGeneratedData(labelPayload);
      setIsSaved(true);
      
      // Update global header stats
      if (refetchStats) {
        refetchStats();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate label on the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSilentSave = async () => {
    if (isSaved) return true;

    const receiverName = watchedFields.receiverName;
    const phoneNumber = watchedFields.phoneNumber;
    const address = watchedFields.address;

    if (!receiverName || !phoneNumber || !address) {
      setError('Please fill in Receiver Name, Phone Number, and Street Address first.');
      alert('Please fill in Receiver Name, Phone Number, and Street Address first.');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const labelPayload = {
        ...watchedFields,
        trackingNumber: trackingNumber
      };

      await api.post('/api/labels/generate', {
        receiverName: receiverName,
        phoneNumber: phoneNumber
      });

      setGeneratedData(labelPayload);
      setIsSaved(true);

      if (refetchStats) {
        refetchStats();
      }
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to auto-save label before print/export.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedData(null);
    setIsSaved(false);
    setTrackingNumber(generateTrackingNumber());
  };

  // Compile live preview data (combines current form state and tracking number)
  const previewData = {
    ...watchedFields,
    trackingNumber: trackingNumber
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Shipping Label</h1>
          <p className="text-sm text-slate-500 mt-1">Provide parcel details to generate and print courier-style labels.</p>
        </div>
        {isSaved && (
          <button
            onClick={handleReset}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Create New Label
          </button>
        )}
      </div>

      {/* Grid: Form vs Preview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        
        {/* Left Side: Input Form */}
        <div className={`lg:col-span-6 space-y-6 no-print ${isSaved ? 'opacity-60 pointer-events-none' : ''}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 rounded-lg space-y-6">
            
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Parcel Details
            </h2>

            {/* Receiver Name & Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Receiver Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    {...register('receiverName', { required: 'Receiver name is required' })}
                    className="block w-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                    placeholder="John Doe"
                  />
                </div>
                {errors.receiverName && (
                  <p className="mt-1 text-[10px] text-red-500 font-mono">{errors.receiverName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                    className="block w-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                    placeholder="+1 555-0199"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-[10px] text-red-500 font-mono">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Street Address *
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <textarea
                  rows="2"
                  {...register('address', { required: 'Address is required' })}
                  className="block w-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                  placeholder="123 Logistics Way, Suite 4B"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-[10px] text-red-500 font-mono">{errors.address.message}</p>
              )}
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="block w-full border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  State
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="block w-full border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  {...register('pincode')}
                  className="block w-full border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                  placeholder="10001"
                />
              </div>
            </div>

            {/* Weight, Order ID */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Weight
                </label>
                <div className="relative flex rounded-md">
                  <div className="relative flex-grow focus-within:z-10">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Scale className="h-4 w-4" />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      {...register('weight')}
                      className="block w-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-l-md"
                      placeholder="0.5"
                    />
                  </div>
                  <select
                    {...register('weightUnit')}
                    className="relative -ml-px block border border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-r-md"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Hash className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    {...register('orderId')}
                    className="block w-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                    placeholder="ORD-9982"
                  />
                </div>
              </div>

              {/* COD Amount (₹) Commented Out
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  COD Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    {...register('codAmount')}
                    className="block w-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>
              */}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Notes / Special Instructions
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-slate-400">
                  <FileSignature className="h-4 w-4" />
                </span>
                <textarea
                  rows="2"
                  {...register('notes')}
                  className="block w-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                  placeholder="Leave at front door if not home."
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Logo Configuration (Optional)
              </label>
              <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 rounded-md">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Image className="h-4 w-4" />
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700 pl-9 focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  {logoPreview !== defaultLogo && (
                    <button
                      type="button"
                      onClick={handleUseDefaultLogo}
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Default Logo
                    </button>
                  )}
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration: Template & Size */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 dark:border-slate-800 pt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Template Selection
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Layers className="h-4 w-4" />
                  </span>
                  <select
                    {...register('templateId')}
                    className="block w-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                  >
                    <option value="1">Template 1: Simple Courier</option>
                    <option value="2">Template 2: Professional Shipping</option>
                    <option value="3">Template 3: Compact Label</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Label Size
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                  <select
                    {...register('labelSize')}
                    className="block w-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
                  >
                    <option value="4x6">4 x 6 inches</option>
                    <option value="A6">A6 (105x148 mm)</option>
                    <option value="A5">A5 (148x210 mm)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center rounded-md bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
              >
                {loading ? 'Recording in database...' : 'Generate & Save Label'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: Preview Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 rounded-lg">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-6 no-print">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {isSaved ? 'Generated Shipping Label' : 'Live Preview Draft'}
              </h2>
              {isSaved ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              ) : (
                <span className="text-xs font-mono font-medium text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">
                  Drafting
                </span>
              )}
            </div>

            {/* Label Rendering Area */}
            <LabelPreview
              data={isSaved ? generatedData : previewData}
              labelSize={watchedFields.labelSize}
              templateId={watchedFields.templateId}
              logoPreview={logoPreview}
              isSaved={isSaved}
              onSave={handleSilentSave}
            />

            {!isSaved && (
              <p className="mt-4 text-center text-[10px] text-slate-400 font-mono no-print">
                * Complete the details form above, or click print/download to automatically save and unlock files.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateLabel;
