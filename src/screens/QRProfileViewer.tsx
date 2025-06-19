import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Building2,
  ExternalLink,
  Share2,
} from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="text-center space-y-4 w-full max-w-xs">
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

  const shareBusinessCard = async () => {
    try {
      const cardUrl = `${window.location.origin}/card/${profile.id}`;
      if (navigator.share) {
        await navigator.share({
          title: `${profile.full_name}'s Digital Business Card`,
          text: `Connect with ${profile.full_name}, ${profile.designation} at Infimatrix Technologies`,
          url: cardUrl,
        });
      } else {
        await navigator.clipboard.writeText(cardUrl);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
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
      {/* Business Card Container - Adjusted for mobile */}
      <div className="w-full max-w-md bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Card Header with Branding - Mobile optimized */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-200 p-4 md:p-6 relative">
          {/* Company Logo Watermark - Adjusted size for mobile */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-20">
            <img src={CompanyLogo} alt="Infimatrix" className="h-12 md:h-16" />
          </div>

          {/* Profile Information - Stacked on mobile */}
          <div className="flex flex-col items-center relative z-10">
            {/* Profile Picture - Smaller on mobile */}
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-16 h-16 md:w-24 md:h-24 mx-auto rounded-full border-4 border-white shadow-md md:shadow-lg mb-3 md:mb-4 object-cover"
              />
            )}

            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight text-center">
              {profile.full_name}
            </h1>
            <p className="text-blue-100 mt-1 text-sm md:text-base text-center">
              {profile.designation}
            </p>

            {/* Department Badge - Smaller text on mobile */}
            <div className="mt-2 md:mt-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm text-white">
              {profile.department}
            </div>
          </div>
        </div>

        {/* Card Body - Adjusted padding for mobile */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Contact Information - Better spacing on mobile */}
          <div className="space-y-3">
            <InfoItem
              icon={<Mail className="text-blue-600 h-4 w-4 md:h-5 md:w-5" />}
              label="Email"
              text={profile.email}
              link={`mailto:${profile.email}`}
            />

            {profile.phone && (
              <InfoItem
                icon={<Phone className="text-blue-600 h-4 w-4 md:h-5 md:w-5" />}
                label="Phone"
                text={profile.phone}
                link={`tel:${profile.phone}`}
              />
            )}

            {profile.linkedin_url && (
              <InfoItem
                icon={
                  <Linkedin className="text-blue-600 h-4 w-4 md:h-5 md:w-5" />
                }
                label="LinkedIn"
                text={profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")}
                link={profile.linkedin_url}
              />
            )}

            <InfoItem
              icon={
                <Building2 className="text-blue-600 h-4 w-4 md:h-5 md:w-5" />
              }
              label="Company"
              text="Infimatrix Technologies"
            />
          </div>

          {/* Action Buttons - Stacked on mobile, side-by-side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 pt-3 md:pt-4">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 text-sm md:text-base"
              asChild
            >
              <a
                href="https://www.infimatrix.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Our Website
              </a>
            </Button>
            <Button
              onClick={shareBusinessCard}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 text-sm md:text-base"
            >
              <Share2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Share Card
            </Button>
          </div>
        </div>

        {/* Card Footer - Smaller padding on mobile */}
        <div className="bg-gray-50 px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 text-center">
          <div className="flex justify-center items-center gap-2">
            <img src={CompanyLogo} alt="Infimatrix" className="h-5 md:h-6" />
            <span className="text-xs md:text-sm text-gray-600">
              Digital Business Card
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced InfoItem component with mobile responsiveness
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
    <div className="flex items-start gap-3">
      <div className="bg-blue-100 p-1.5 md:p-2 rounded-lg mt-0.5 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-gray-800 hover:text-blue-600 transition-colors break-words block"
          >
            {text}
          </a>
        ) : (
          <p className="text-xs md:text-sm text-gray-800 break-words">{text}</p>
        )}
      </div>
    </div>
  );
}
