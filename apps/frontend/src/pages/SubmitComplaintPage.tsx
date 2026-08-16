import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { ArrowRight, Upload, MapPin, AlertCircle } from "lucide-react"
import { complaintsApi, categoriesApi } from "../lib/api"

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  categoryId: z.string().optional(),
  location: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  submitterName: z.string().optional(),
  submitterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  submitterPhone: z.string().optional(),
})

type ComplaintForm = z.infer<typeof complaintSchema>

export default function SubmitComplaintPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ComplaintForm>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      isAnonymous: false,
    },
  })

  const isAnonymous = watch("isAnonymous")

  const onSubmit = async (data: ComplaintForm) => {
    setIsSubmitting(true)
    try {
      const response = await complaintsApi.create(data)
      setTrackingNumber(response.data.trackingNumber)
      setStep(3)
      toast.success("Complaint submitted successfully!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit complaint")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Submit a Complaint</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? "text-primary-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                1
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? "bg-primary-600" : "bg-gray-200"}`} />
            <div className={`flex items-center ${step >= 2 ? "text-primary-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                2
              </div>
              <span className="ml-2 font-medium">Contact</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? "bg-primary-600" : "bg-gray-200"}`} />
            <div className={`flex items-center ${step >= 3 ? "text-primary-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                3
              </div>
              <span className="ml-2 font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Form Steps */}
        <div className="card">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <h2 className="text-xl font-semibold mb-6">Complaint Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("title")}
                    className="input-field"
                    placeholder="Brief description of your complaint"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("description")}
                    rows={6}
                    className="input-field"
                    placeholder="Please provide detailed information about your complaint..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register("location")}
                      className="input-field pl-10"
                      placeholder="e.g., Kenyatta Avenue, Nairobi"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("isAnonymous")}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    Submit anonymously (your identity will be hidden)
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  Next: Contact Info <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              
              {!isAnonymous && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      {...register("submitterName")}
                      className="input-field"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      {...register("submitterEmail")}
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                    />
                    {errors.submitterEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.submitterEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register("submitterPhone")}
                      className="input-field"
                      placeholder="+254..."
                    />
                  </div>
                </div>
              )}

              {isAnonymous && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Anonymous Submission</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Your name and contact information will be hidden. You"ll receive a tracking number 
                        to check status, but won"t receive updates via email/SMS.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-4 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && trackingNumber && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your complaint has been received and is being processed.
              </p>
              
              <div className="bg-primary-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-primary-600 mb-2">Your Tracking Number</p>
                <p className="text-3xl font-bold text-primary-700">{trackingNumber}</p>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Save this number to check your complaint status at any time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate(`/track?tracking=${trackingNumber}`)}
                  className="btn-primary"
                >
                  Track This Complaint
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="btn-secondary"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
