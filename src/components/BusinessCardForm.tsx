import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Building2,
  Download,
  ExternalLink,
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

export function BusinessCardForm() {
  const [qrValue, setQrValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<BusinessCardFormData | null>(null);

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
      // 1. Save profile to Supabase
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

      // 2. Generate card URL
      const cardUrl = `${window.location.origin}/card/${profile.id}`;
      setQrValue(cardUrl);
      setCardData(data);

      // 3. Save QR code to Supabase storage
      const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
      const qrCodeDataUrl = canvas?.toDataURL("image/png");

      if (qrCodeDataUrl) {
        const qrCodeBlob = await fetch(qrCodeDataUrl).then((res) => res.blob());
        const qrCodeFileName = `qr-${profile.id}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("qrcodes")
          .upload(qrCodeFileName, qrCodeBlob, {
            contentType: "image/png",
            upsert: true,
          });

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
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement;
    const pngUrl = canvas?.toDataURL("image/png");
    if (pngUrl) {
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "infimatrix-business-card.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
        E-Business Card Generator
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              placeholder="Software Engineer"
              {...register("designation")}
            />
            {errors.designation && (
              <p className="text-sm text-red-500">
                {errors.designation.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@infimatrix.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={department}
              onValueChange={(value) => setValue("department", value)}
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/username"
              {...register("linkedin")}
            />
            {errors.linkedin && (
              <p className="text-sm text-red-500">{errors.linkedin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input
              id="phone"
              placeholder="+91 9876543210"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate E-Business Card"}
        </Button>
      </form>

      {qrValue && cardData && (
        <div className="mt-8 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Your E-Business Card
          </h2>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <QRCodeSVG
                id="qr-code"
                value={qrValue}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#2563eb"
                bgColor="#ffffff"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code to view your digital business card
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadQRCode}>
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <Button variant="outline" asChild>
                <a href={qrValue} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Card
                </a>
              </Button>
            </div>
          </div>

          {/* Card Preview */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">Card Preview</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <a
                  href={`mailto:${cardData.email}`}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {cardData.email}
                </a>
              </div>

              {cardData.phone && (
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <a
                    href={`tel:${cardData.phone}`}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {cardData.phone}
                  </a>
                </div>
              )}

              {cardData.linkedin && (
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                  </div>
                  <a
                    href={cardData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-gray-700">
                  Infimatrix • {cardData.department}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
