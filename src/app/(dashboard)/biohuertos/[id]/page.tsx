interface Props {
  params: Promise<{ id: string }>;
}

export default async function BiohuertDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-900">
        Biohuerto #{id}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Detalle, parcelas y cultivos de este biohuerto.
      </p>
    </section>
  );
}
