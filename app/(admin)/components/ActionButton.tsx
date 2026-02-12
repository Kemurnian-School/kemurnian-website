import Link from 'next/link';

interface ActionButtonProps {
  href: string;
  label: string;
}

export default function ActionButton({ href, label }: ActionButtonProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-block px-4 py-2 bg-btn-primary text-white rounded-full hover:bg-red-primary active:bg-red-900 transition-colors"
    >
      {label}
    </Link>
  );
}
