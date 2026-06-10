interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        Producto #{id}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Detalle del producto y contacto directo por WhatsApp.
      </p>
    </main>
  );
}
