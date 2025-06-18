import { useEffect, useState } from "react";
import { Mail, Phone, Linkedin, Building2, ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supbase";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your business card...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-700">{error || "Profile not found"}</p>
          <Button className="mt-6" asChild>
            <a href="/">Return Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transition-all hover:shadow-3xl">
        <div className="bg-blue-700 p-6 text-white text-center">
          <div className="mb-3">
            {/* Optional Avatar */}
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-md"
              />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            {profile.full_name}
          </h1>
          <p className="text-blue-200 text-sm mt-1">{profile.designation}</p>
        </div>

        <div className="p-6 space-y-4 text-gray-800">
          <InfoItem
            icon={<Mail className="text-blue-600 h-5 w-5" />}
            text={profile.email}
            link={`mailto:${profile.email}`}
          />
          {profile.phone && (
            <InfoItem
              icon={<Phone className="text-blue-600 h-5 w-5" />}
              text={profile.phone}
              link={`tel:${profile.phone}`}
            />
          )}
          {profile.linkedin_url && (
            <InfoItem
              icon={<Linkedin className="text-blue-600 h-5 w-5" />}
              text="LinkedIn Profile"
              link={profile.linkedin_url}
            />
          )}
          <InfoItem
            icon={<Building2 className="text-blue-600 h-5 w-5" />}
            text={`Infimatrix • ${profile.department}`}
          />

          <div className="pt-6 border-t border-gray-200 text-center">
            <Button variant="outline" className="w-full" asChild>
              <a
                href="https://www.infimatrix.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Company Website
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable InfoItem component
function InfoItem({
  icon,
  text,
  link,
}: {
  icon: React.ReactNode;
  text: string;
  link?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="bg-blue-100 p-2 rounded-full">{icon}</div>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition"
        >
          {text}
        </a>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}
