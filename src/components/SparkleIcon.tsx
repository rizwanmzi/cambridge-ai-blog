export default function SparkleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
      <path d="M20 0L20.94 2.06L23 3L20.94 3.94L20 6L19.06 3.94L17 3L19.06 2.06L20 0Z" opacity="0.6" />
      <path d="M4 18L4.94 20.06L7 21L4.94 21.94L4 24L3.06 21.94L1 21L3.06 20.06L4 18Z" opacity="0.6" />
    </svg>
  );
}
