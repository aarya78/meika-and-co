import SEO from '@/components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist. Explore Meika & Co for handmade dolls and personalized gifts."
        pathname="/404"
        robots="noindex"
      />

      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <p className="mt-4 text-xl">Page not found</p>
        </div>
      </div>
    </>
  );
}
