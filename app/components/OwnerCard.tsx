import { Avatar } from "./Avatar";
import { Card } from "./Card";

export function OwnerCard({
  profile,
}: {
  profile: {
    displayName: string;
    handle: string;
    avatar?: string;
    description?: string;
  };
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <Avatar src={profile.avatar} name={profile.displayName} size="lg" />
        <div>
          <h1 className="text-lg font-bold text-text">{profile.displayName}</h1>
          <p className="text-sm text-text-muted">@{profile.handle}</p>
        </div>
      </div>
      {profile.description && (
        <p className="mt-3 text-sm text-text-muted">{profile.description}</p>
      )}
    </Card>
  );
}
