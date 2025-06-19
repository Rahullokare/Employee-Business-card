import { useEffect, useState } from "react";
import { Mail, Phone, Linkedin, Building2, ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supbase";
import { Button } from "@/components/ui/button";

import CompanyLogo from "@/assets/Infimatrix-Logo-2.png";

export function BusinessCardPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Profile not found");

        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={CompanyLogo} alt="Infimatrix" className="h-10 mb-6" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading digital business card...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <img src={CompanyLogo} alt="Infimatrix" className="h-10" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-700">{error || "Profile not found"}</p>
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700" asChild>
            <a href="/">Return Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Business Card Container */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        {/* Card Header with Branding */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-200 p-6 relative">
          {/* Company Logo Watermark */}
          <div className="absolute top-4 right-4 opacity-20">
            <img src={CompanyLogo} alt="Infimatrix" className="h-16" />
          </div>

          {/* Profile Information */}
          <div className="flex flex-col items-center relative z-10">
            {/* Profile Picture (if available) */}
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-lg mb-4 object-cover"
              />
            )}

            <h1 className="text-2xl font-bold text-white tracking-tight">
              {profile.full_name}
            </h1>
            <p className="text-blue-100 mt-1">{profile.designation}</p>

            {/* Department Badge */}
            <div className="mt-3 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
              {profile.department}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 space-y-5">
          {/* Contact Information */}
          <div className="space-y-4">
            <InfoItem
              icon={<Mail className="text-blue-600 h-5 w-5" />}
              label="Email"
              text={profile.email}
              link={`mailto:${profile.email}`}
            />

            {profile.phone && (
              <InfoItem
                icon={<Phone className="text-blue-600 h-5 w-5" />}
                label="Phone"
                text={profile.phone}
                link={`tel:${profile.phone}`}
              />
            )}

            {profile.linkedin_url && (
              <InfoItem
                icon={<Linkedin className="text-blue-600 h-5 w-5" />}
                label="LinkedIn"
                text={profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")}
                link={profile.linkedin_url}
              />
            )}

            <InfoItem
              icon={<Building2 className="text-blue-600 h-5 w-5" />}
              label="Company"
              text="Infimatrix Technologies"
            />
          </div>

          {/* QR Code Scan Prompt */}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              asChild
            >
              <a
                href="https://www.infimatrix.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Our Website
              </a>
            </Button>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
          <div className="flex justify-center items-center gap-2">
            <img src={CompanyLogo} alt="Infimatrix" className="h-6" />
            <span className="text-sm text-gray-600">Digital Business Card</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced InfoItem component
function InfoItem({
  icon,
  label,
  text,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  link?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-blue-100 p-2 rounded-lg mt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-800 hover:text-blue-600 transition-colors break-all"
          >
            {text}
          </a>
        ) : (
          <p className="text-sm text-gray-800">{text}</p>
        )}
      </div>
    </div>
  );
}
