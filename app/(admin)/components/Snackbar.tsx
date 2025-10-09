"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

type SnackbarProps = {
  success?: boolean;
  message?: string;
};

export default function Snackbar({ success: propSuccess, message: propMessage }: SnackbarProps) {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [success, setSuccess] = useState(propSuccess ?? false);
  const [message, setMessage] = useState(propMessage ?? "");

  useEffect(() => {
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (successParam) {
      setSuccess(true);
      setMessage(successParam);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (errorParam) {
      setSuccess(false);
      setMessage(errorParam);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const bgColor = success ? "bg-green-300" : "bg-red-500";
  const iconSrc = success ? "/check.svg" : "/cross.svg";

  return (
    <div
      className={`fixed right-4 z-50 py-3 px-4 rounded-lg shadow-lg ${bgColor} text-white transition-all duration-500 ease-in-out ${isVisible ? "top-4" : "-top-24"
        }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Image
          src={iconSrc}
          alt=""
          width={20}
          height={20}
        />
        <span className="text-green-900">{message}</span>
      </div>
    </div>
  );
}
