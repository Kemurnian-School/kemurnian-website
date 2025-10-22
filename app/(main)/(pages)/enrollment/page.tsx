export const revalidate = 604800;

import { getEnrollmentData } from "@fetch/enrollment";
import Image from "next/image";
import QuillRenderer from "@component/QuillRenderer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penerimaan Peserta Didik Baru",
  description:
    "Informasi pendaftaran dan penerimaan peserta didik baru di Sekolah Kemurnian.",
};

export default async function EnrollmentPage() {
  const fromEnrollment = await getEnrollmentData();

  return (
    <main className="flex flex-col items-center justify-center mt-10 mx-5 md:mx-0">
      <h1 className="text-center tracking-widest font-raleway font-extrabold tracking-wide text-lg md:text-2xl text-[#252525]">
        {fromEnrollment.title}
      </h1>
      <hr className="mx-auto my-5 w-[240px] border-t-[4px] border-solid border-[#8b0000]" />
      <Image
        src={fromEnrollment.image_url}
        alt="image"
        width={450}
        height={450}
        className="mb-6"
      />
      <h2 className="font-raleway font-bold text-md md:text-lg mb-10">
        {new Date(fromEnrollment.date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h2>
      <QuillRenderer
        content={fromEnrollment.body}
        className="max-w-2xl font-merriweather font-light text-xs md:text-lg leading-loose"
      />
    </main>
  );
}
