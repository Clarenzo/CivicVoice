import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { ArrowRight, ArrowLeft, MapPin, AlertCircle, CheckCircle2 } from "lucide-react"
import { complaintsApi } from "../lib/api"
import { useAuthStore } from "../store/authStore"

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  categoryId: z.string().optional().or(z.literal("")),
  location: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  submitterName: z.string().optional(),
  submitterEmail: z.union([z.string().email("Please enter a valid email"), z.literal("")]).optional(),
  submitterPhone: z.string().optional(),
})

type ComplaintForm = z.infer<typeof complaintSchema>

export default function SubmitComplaintPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<ComplaintForm>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      isAnonymous: false,
      title: "",
      description: "",
      location: "",
      submitterName: user?.name || "",
      submitterEmail: user?.email || "",
      submitterPhone: "",
      categoryId: "",
    },
    mode: "onTouched",
  })

  const isAnonymous = watch("isAnonymous")

  const handleNextToStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate only step 1 fields
    const valid = await trigger(["title", "description", "location", "isAnonymous"])
    if (!valid) {
      toast.error("Please fix the errors before continuing")
      return
    }
    setStep(2)
  }

  const onSubmit = async (data: ComplaintForm) => {
    setIsSubmitting(true)
    try {
      // Build payload: strip empty strings, only include submitter info when not anonymous
      const payload: any = {
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        location: data.location || undefined,
        categoryId: data.categoryId || undefined,
      }

      if (!data.isAnonymous) {
        if (data.submitterName) payload.submitterName = data.submitterName
        if (data.submitterEmail) payload.submitterEmail = data.submitterEmail
        if (data.submitterPhone) payload.submitterPhone = data.submitterPhone?.replace(/[^\d+\-() ]/g, "")
      }

      const response = await complaintsApi.create(payload)

      // Backend wraps in { success: true, data: complaint }
      const complaint = response.data?.data || response.data
      const trackingNum = complaint?.trackingNumber

      if (trackingNum) {
        setTrackingNumber(trackingNum)
        setStep(3)
        toast.success("Complaint submitted successfully!")
      } else {
        throw new Error("Invalid response format: missing tracking number")
      }
    } catch (error: any) {
      console.error("Submit error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to submit complaint"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => {
              if (step === 2) setStep(1)
              else navigate(isAuthenticated ? "/dashboard" : "/")
            }}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Submit a Complaint</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? "text-primary-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                1
              </div>
              <span className="ml-2 font-medium text-sm sm:text-base">Details</span>
            </div>
            <div className={`flex-1 h-1 mx-2 sm:mx-4 ${step >= 2 ? "bg-primary-600" : "bg-gray-200"}`} />
            <div className={`flex items-center ${step >= 2 ? "text-primary-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                2
              </div>
              <span className="ml-2 font-medium text-sm sm:text-base">Contact</span>
            </div>
            <div className={`flex-1 h-1 mx-2 sm:mx-4 ${step >= 3 ? "bg-primary-600" : "bg-gray-200"}`} />
            <div className={`flex items-center ${step >= 3 ? "text-primary-600" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? "bg-primary-600 text-white" : "bg-gray-200"}`}>
                3
              </div>
              <span className="ml-2 font-medium text-sm sm:text-base">Complete</span>
            </div>
          </div>
        </div>

        {/* Step 1: Complaint Details */}
        {step === 1 && (
          <div className="card">
            <form onSubmit={handleNextToStep2}>
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

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...register("isAnonymous")}
                    className="w-4 h-4 mt-0.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    id="isAnonymous"
                  />
                  <label htmlFor="isAnonymous" className="text-sm text-gray-600">
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
          </div>
        )}

        {/* Step 2: Contact Information */}
        {step === 2 && (
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>

              {!isAnonymous ? (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Your contact information helps us follow up on your complaint. Fields are optional, but providing email or phone ensures you receive updates.
                  </p>

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
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800">Anonymous Submission</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Your name and contact information will be hidden. You'll receive a tracking number
                        to check status, but won't receive updates via email/SMS.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-4 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
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
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && trackingNumber && (
          <div className="card text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your complaint has been received and is being processed. Please save your tracking number below to check the status anytime.
            </p>

            <div className="bg-primary-50 rounded-lg p-6 mb-6 max-w-sm mx-auto">
              <p className="text-sm text-primary-600 mb-2">Your Tracking Number</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary-700 break-all">{trackingNumber}</p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Save this number to check your complaint status at any time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/track?tracking=${trackingNumber}`)}
                className="btn-primary"
              >
                Track This Complaint
              </button>
              <button
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
                className="btn-secondary"
              >
                {isAuthenticated ? "Return to Dashboard" : "Return Home"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
