import type { NextConfig } from "next";

const CDN_URL = process.env.STORAGE_CDN!;
const CDN_HOSTNAME = new URL(CDN_URL).hostname;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lvkydivstceibnjyndgo.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: CDN_HOSTNAME,
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  async redirects() {
    return [
      {
        source: "/sekolah-kemurnian-1.html",
        destination: "/sekolah-kemurnian-1",
        permanent: false,
      },
      {
        source: "/sekolah-kemurnian-2.html",
        destination: "/sekolah-kemurnian-2",
        permanent: false,
      },
      {
        source: "/sekolah-kemurnian-3.html",
        destination: "/sekolah-kemurnian-3",
        permanent: false,
      },
      { source: "/about.html", destination: "/about", permanent: false },
      {
        source: "/kurikulum-tk.html",
        destination: "/kurikulum/2",
        permanent: false,
      },
      {
        source: "/kurikulum-tkbil.html",
        destination: "/kurikulum/3",
        permanent: false,
      },
      {
        source: "/kurikulum-sd.html",
        destination: "/kurikulum/4",
        permanent: false,
      },
      {
        source: "/kurikulum-smp.html",
        destination: "/kurikulum/5",
        permanent: false,
      },
      {
        source: "/kurikulum-sma.html",
        destination: "/kurikulum/6",
        permanent: false,
      },
      {
        source: "/kurikulum-english.html",
        destination: "/kurikulum/7",
        permanent: false,
      },
      {
        source: "/news/2025/9_maulid.html",
        destination: "/news-detail/59",
        permanent: false,
      },
      {
        source: "/news/2025/8_pameran_ite.html",
        destination: "/news-detail/58",
        permanent: false,
      },
      {
        source: "/pelatihan2.html",
        destination: "/news-detail/57",
        permanent: false,
      },
      {
        source: "/ajaranbaru.html",
        destination: "/news-detail/56",
        permanent: false,
      },
      {
        source: "/open25.html",
        destination: "/news-detail/60",
        permanent: false,
      },
      {
        source: "/O2sn1.html",
        destination: "/news-detail/61",
        permanent: false,
      },
      {
        source: "/o2sn.html",
        destination: "/news-detail/62",
        permanent: false,
      },
      {
        source: "/pelatihan1.html",
        destination: "/news-detail/55",
        permanent: false,
      },
      {
        source: "/pelatihan.html",
        destination: "/news-detail/54",
        permanent: false,
      },
      { source: "/news.html", destination: "/news", permanent: false },
      {
        source: "/promo-open-24.html",
        destination: "/enrollment",
        permanent: false,
      },
      { source: "/index.php", destination: "/", permanent: false },
      {
        source: "/tk-kemurnian-1.html",
        destination: "/unit/tk-kemurnian-i",
        permanent: false,
      },
      {
        source: "/sd-kemurnian-1.html",
        destination: "/unit/sd-kemurnian-i",
        permanent: false,
      },
      {
        source: "/smp-kemurnian-1.html",
        destination: "/unit/smp-kemurnian-i",
        permanent: false,
      },
      {
        source: "/tk-kemurnian-2.html",
        destination: "/unit/tk-kemurnian-ii",
        permanent: false,
      },
      {
        source: "/sd-kemurnian-2.html",
        destination: "/unit/sd-kemurnian-ii",
        permanent: false,
      },
      {
        source: "/smp-kemurnian-2.html",
        destination: "/unit/smp-kemurnian-ii",
        permanent: false,
      },
      {
        source: "/sma-kemurnian-2.html",
        destination: "/unit/sma-kemurnian-ii",
        permanent: false,
      },
      {
        source: "/tk-kemurnian-3.html",
        destination: "/unit/tk-kemurnian-iii",
        permanent: false,
      },
      {
        source: "/sd-kemurnian-3.html",
        destination: "/unit/sd-kemurnian-iii",
        permanent: false,
      },
      {
        source: "/Award_Qmur.html",
        destination: "/news-detail/30",
        permanent: false,
      },
      {
        source: "/P5smp24.html",
        destination: "/news-detail/29",
        permanent: false,
      },
      {
        source: "/Fieldtriptk24.html",
        destination: "/news-detail/63",
        permanent: false,
      },
      {
        source: "/openqmur1.html",
        destination: "/news-detail/53",
        permanent: false,
      },
      {
        source: "/openqmur.html",
        destination: "/news-detail/52",
        permanent: false,
      },
      {
        source: "/kmnnew.html",
        destination: "/news-detail/51",
        permanent: false,
      },
      {
        source: "/gradu.html",
        destination: "/news-detail/50",
        permanent: false,
      },
      {
        source: "/binus.html",
        destination: "/news-detail/49",
        permanent: false,
      },
      {
        source: "/sma_negeri2.html",
        destination: "/news-detail/64",
        permanent: false,
      },
      {
        source: "/sma_negeri1.html",
        destination: "/news-detail/48",
        permanent: false,
      },
      {
        source: "/29mei.html",
        destination: "/news-detail/47",
        permanent: false,
      },
      {
        source: "/sma_nia.html",
        destination: "/news-detail/46",
        permanent: false,
      },
      {
        source: "/grad_sma.html",
        destination: "/news-detail/45",
        permanent: false,
      },
      {
        source: "/pidato_sd.html",
        destination: "/news-detail/43",
        permanent: false,
      },
      {
        source: "/pidato_sd1.html",
        destination: "/news-detail/42",
        permanent: false,
      },
      {
        source: "/smap_1.html",
        destination: "/news-detail/41",
        permanent: false,
      },
      {
        source: "/smaptn1.html",
        destination: "/news-detail/40",
        permanent: false,
      },
      {
        source: "/smaptn.html",
        destination: "/news-detail/39",
        permanent: false,
      },
      {
        source: "/padus.html",
        destination: "/news-detail/38",
        permanent: false,
      },
      {
        source: "/TK_baksos.html",
        destination: "/news-detail/36",
        permanent: false,
      },
      {
        source: "/sma_dance.html",
        destination: "/news-detail/37",
        permanent: false,
      },
      {
        source: "/sma_rrc2.html",
        destination: "/news-detail/35",
        permanent: false,
      },
      {
        source: "/sma_rrc.html",
        destination: "/news-detail/34",
        permanent: false,
      },
      {
        source: "/smap1.html",
        destination: "/news-detail/33",
        permanent: false,
      },
      {
        source: "/smp2.html",
        destination: "/news-detail/32",
        permanent: false,
      },
      {
        source: "/sdp1.html",
        destination: "/news-detail/31",
        permanent: false,
      },
      {
        source: "/seminar-bahasa-kasih-sd.html",
        destination: "/news-detail/28",
        permanent: false,
      },
      {
        source: "/promo-open-house.html",
        destination: "/news-detail/65",
        permanent: false,
      },
      {
        source: "/graduation-day-sd-kmn3-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-sd-kmn2-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-sd-kmn1-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-smp-kmn2-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-smp-kmn1-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/pengumuman-kelulusan-sd-kmn2-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/pesta-akhir-tahun-tk-kmn2-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/supermi-gpp-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-tk-kmn3-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-tk-kmn2-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-tk-kmn1-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/seminar-jajanan-sehat.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/ibadah_waisak_tk_sd_kmn2_2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/graduation-day-sma-kmn2-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/ibadah_paskah-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/buka_bersama-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/pesantren_kilat-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/fieldtrip-smp-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/fieldtrip-sd-2023.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/pendalamaniman.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/valentine-sma.html", destination: "/news", permanent: false },
      { source: "/bahasakasih.html", destination: "/news", permanent: false },
      { source: "/qlive-2023.html", destination: "/news", permanent: false },
      { source: "/osis-sma-2023.html", destination: "/news", permanent: false },
      {
        source: "/seminar-mykids-mylegacy.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/osis-smp-2023.html", destination: "/news", permanent: false },
      { source: "/q-lead-2023.html", destination: "/news", permanent: false },
      { source: "/my&amp;mybody.html", destination: "/news", permanent: false },
      {
        source: "/q-love-sma-2023.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/imlek2023.html", destination: "/news", permanent: false },
      {
        source: "/be-kind-be-smart.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/newyeartk.html", destination: "/news", permanent: false },
      { source: "/seminarguru23.html", destination: "/news", permanent: false },
      {
        source: "/motherday-tkkmn1.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/natal-2022-tkkmn2.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/natal-2022-tkkmn13.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/fieldtripsd2022.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/baksos-cianjur2.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/baksos-cianjur.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/fieldtrip9-22.html", destination: "/news", permanent: false },
      { source: "/rumah-keramik.html", destination: "/news", permanent: false },
      { source: "/here-i-am.html", destination: "/news", permanent: false },
      { source: "/bye-bye-faver.html", destination: "/news", permanent: false },
      {
        source: "/harikathina-2566-BE.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/bbdansp-sma.html", destination: "/news", permanent: false },
      {
        source: "/art-day-tk-kemurnian-1-2.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/p5-smp.html", destination: "/news", permanent: false },
      { source: "/batikday.html", destination: "/news", permanent: false },
      { source: "/openhouse22.html", destination: "/news", permanent: false },
      {
        source: "/art-day-tk-kemurnian-3-september-2022.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/vaksinasi-sd-kemurnian-2-september-2022.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/marketday2.html", destination: "/news", permanent: false },
      {
        source: "/upcycling-workshop.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/5tips.html", destination: "/news", permanent: false },
      {
        source: "/perayaan-hutri-77.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/upacara-hutti22.html",
        destination: "/news",
        permanent: false,
      },
      { source: "/mpls22.html", destination: "/news", permanent: false },
      { source: "/imlek2022.html", destination: "/news", permanent: false },
      {
        source: "/misa-natal-sma-kemurnian-2.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/vaksinasi-sd-kemurnian-2.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/protokol-kesehatan.html",
        destination: "/news",
        permanent: false,
      },
      {
        source: "/ptm-sma-kemurnian-2.html",
        destination: "/news",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
