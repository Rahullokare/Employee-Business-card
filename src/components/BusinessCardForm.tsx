import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Building2,
  Download,
  ExternalLink,
  User,
  Briefcase,
  Smartphone,
  Share2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  businessCardSchema,
  type BusinessCardFormData,
} from "@/lib/validation";
import { supabase } from "@/lib/supbase";

// Import your company logo

export function BusinessCardForm() {
  const [qrValue, setQrValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<BusinessCardFormData | null>(null);
  const [activeStep, setActiveStep] = useState<"form" | "preview">("form");
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BusinessCardFormData>({
    resolver: zodResolver(businessCardSchema),
    defaultValues: {
      department: "Engineering",
    },
  });

  const department = watch("department");

  const onSubmit = async (data: BusinessCardFormData) => {
    setIsLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          full_name: data.fullName,
          designation: data.designation,
          email: data.email,
          linkedin_url: data.linkedin,
          phone: data.phone,
          department: data.department,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      const cardUrl = `${window.location.origin}/card/${profile.id}`;
      setQrValue(cardUrl);
      setCardData(data);
      setActiveStep("preview");

      const svgElement = qrCodeRef.current?.querySelector("svg");
      if (!svgElement) throw new Error("QR code SVG not found");

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL("image/png");

        const qrCodeBlob = await fetch(pngDataUrl).then((res) => res.blob());
        const qrCodeFileName = `qr-${profile.id}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("qrcodes")
          .upload(qrCodeFileName, qrCodeBlob, {
            contentType: "image/png",
            upsert: true,
          });
        console.log(uploadData);

        if (uploadError) throw uploadError;

        // 4. Save card record
        const { data: urlData } = supabase.storage
          .from("qrcodes")
          .getPublicUrl(qrCodeFileName);

        await supabase.from("business_cards").insert({
          profile_id: profile.id,
          qr_code_url: urlData.publicUrl,
          card_url: cardUrl,
        });
      };

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const shareBusinessCard = async () => {
    try {
      if (navigator.share) {
        // Use the Web Share API if available
        await navigator.share({
          title: `${cardData?.fullName}'s Digital Business Card`,
          text: `Connect with ${cardData?.fullName}, ${cardData?.designation} at Infimatrix Technologies`,
          url: qrValue,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        await navigator.clipboard.writeText(qrValue);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const downloadQRCode = () => {
    const svgElement = qrCodeRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngDataUrl = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = pngDataUrl;
      downloadLink.download = "infimatrix-business-card.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
          {/* <div className="flex justify-center mb-4">
            <img src={CompanyLogo} alt="Infimatrix" className="h-10" />
          </div> */}
          <h1 className="text-3xl font-bold text-white">
            Employee Digital Business Card Generator
          </h1>
          <p className="text-white/80 mt-2">
            Create your professional digital identity in seconds
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mt-6 pb-6">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                activeStep === "form"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white"
              } font-semibold`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 ${
                activeStep === "form" ? "bg-white/30" : "bg-white"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                activeStep === "preview"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white"
              } font-semibold`}
            >
              2
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 md:p-8 bg-white">
          {activeStep === "form" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    className="bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <Label
                    htmlFor="designation"
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <Briefcase className="h-4 w-4" />
                    Designation
                  </Label>
                  <Input
                    id="designation"
                    placeholder="Software Engineer"
                    className="bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    {...register("designation")}
                  />
                  {errors.designation && (
                    <p className="text-sm text-red-500">
                      {errors.designation.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@infimatrix.com"
                    className="bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label
                    htmlFor="department"
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <Building2 className="h-4 w-4" />
                    Department
                  </Label>
                  <Select
                    value={department}
                    onValueChange={(value) => setValue("department", value)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200 w-full focus:ring-blue-500">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-red-500">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label
                    htmlFor="linkedin"
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    className="bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    {...register("linkedin")}
                  />
                  {errors.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.linkedin.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <Smartphone className="h-4 w-4" />
                    Phone Number (optional)
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+91 9876543210"
                    className="bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate Digital Card"
                )}
              </Button>
            </form>
          ) : (
            /* Preview Section */
            qrValue &&
            cardData && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Your Digital Business Card
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Scan the QR code or share the link below
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                  {/* QR Code */}
                  <div
                    ref={qrCodeRef}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center"
                  >
                    <QRCodeSVG
                      id="qr-code"
                      value={qrValue}
                      size={200}
                      level="H"
                      includeMargin={true}
                      fgColor="#2563eb"
                      bgColor="#ffffff"
                    />
                    <p className="mt-4 text-sm text-gray-500">
                      Scan the QR code with your mobile device
                    </p>
                  </div>

                  {/* Card Preview */}
                  <div className="relative bg-white p-8 rounded-xl border border-gray-200 shadow-sm w-full max-w-md">
                    {/* Company Logo Watermark */}

                    {/* Employee Info */}
                    <div className="relative z-10">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {cardData.fullName}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {cardData.designation}
                        </p>
                        <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {cardData.department}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </p>
                            <a
                              href={`mailto:${cardData.email}`}
                              className="text-sm text-gray-800 hover:text-blue-600"
                            >
                              {cardData.email}
                            </a>
                          </div>
                        </div>

                        {cardData.phone && (
                          <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                              <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                              </p>
                              <a
                                href={`tel:${cardData.phone}`}
                                className="text-sm text-gray-800 hover:text-blue-600"
                              >
                                {cardData.phone}
                              </a>
                            </div>
                          </div>
                        )}

                        {cardData.linkedin && (
                          <div className="flex items-start gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                              <Linkedin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                LinkedIn
                              </p>
                              <a
                                href={cardData.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-800 hover:text-blue-600 break-all"
                              >
                                {cardData.linkedin.replace(
                                  /^https?:\/\/(www\.)?/,
                                  ""
                                )}
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Company
                            </p>
                            <p className="text-sm text-gray-800">
                              Infimatrix Technologies
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    className="border-blue-500 cursor-pointer text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="border-blue-500 cursor-pointer text-blue-600 hover:bg-blue-50"
                  >
                    <a href={qrValue} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Digital Card
                    </a>
                  </Button>
                  <Button
                    onClick={shareBusinessCard}
                    variant="outline"
                    className="border-blue-500 cursor-pointer text-blue-600 hover:bg-blue-50"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Card
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>Your card is automatically saved to your profile.</p>
                  <p>Share the QR code or link with your contacts.</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
