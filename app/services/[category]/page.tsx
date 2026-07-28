export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold">
        Category: {category}
      </h1>
    </main>
  );
}