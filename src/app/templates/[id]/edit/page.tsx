import TemplateBuilder from "@/components/templates/TemplateBuilder";

interface EditTemplatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;
  return <TemplateBuilder templateId={id} />;
} 