const WEB_PAGE = process.env.SITE_DOMAIN!

export default function AdminHome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-3 text-gray-600">Website Preview</p>
      <iframe
        src={WEB_PAGE}
        className="w-full h-[calc(100vh-100px)] border rounded-lg shadow-sm"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
