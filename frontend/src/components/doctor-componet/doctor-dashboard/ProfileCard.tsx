// src/components/doctor-dashboard/ProfileCard.tsx
import Card from "./Card";
import { absoluteApiUrl } from "../../../utils/url";

export default function ProfileCard({
  name,
  specialty,
  avatarUrl,
}: {
  name: string;
  specialty?: string;
  avatarUrl?: string;
}) {
  const src = avatarUrl ? absoluteApiUrl(avatarUrl) : "/avatar-doctor.svg";

  return (
    <Card className="flex items-center gap-3">
      <img
        src={src}
        className="h-12 w-12 rounded-full bg-white/10 object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/avatar-doctor.svg"; }}
        alt=""
      />
      <div>
        <div className="font-semibold">{name || "—"}</div>
        <div className="text-xs opacity-70">{specialty || "—"}</div>
      </div>
    </Card>
  );
}
