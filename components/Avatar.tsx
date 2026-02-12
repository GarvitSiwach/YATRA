type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl'
};

function getInitials(name: string): string {
  const segments = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (segments.length === 0) {
    return 'Y';
  }

  return segments.map((segment) => segment.charAt(0).toUpperCase()).join('');
}

export default function Avatar({
  name,
  imageUrl,
  size = 'md',
  className
}: AvatarProps): JSX.Element {
  const normalizedImage = imageUrl?.trim();
  const sharedClasses = `${sizeClasses[size]} ${className ?? ''}`.trim();

  if (normalizedImage) {
    return (
      <div
        className={`overflow-hidden rounded-full border border-[#1B1B1F]/10 bg-[#FAF9F5] ${sharedClasses}`}
      >
        {/* Using a native img keeps arbitrary user-hosted avatar URLs working without next/image domain config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={normalizedImage}
          alt={`${name} profile`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full border border-[#1B1B1F]/10 bg-[#1B1B1F] text-white ${sharedClasses}`}
      aria-label={`${name} avatar`}
    >
      {getInitials(name)}
    </div>
  );
}
