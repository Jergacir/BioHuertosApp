interface Props {
  params: Promise<{ id: string }>;
}

export default async function CultivoDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">
        Cultivo #{id}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Historial, monitoreo manual e incidencias.
      </p>
    </section>
  );
}
