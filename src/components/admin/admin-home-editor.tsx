"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  AdminFormGrid,
  adminSelectClass,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HOME_CONTENT_VERSION,
  type HomeContentPayload,
  type HomeSection,
  type HomeSectionType,
} from "@/lib/home-content/types";
import { sortHomeSections } from "@/lib/home-content/defaults";

const SECTION_LABELS: Record<HomeSectionType, string> = {
  "hero.static": "Hero principal",
  "hero.carousel": "Hero carrusel",
  "features.bar": "Barra de beneficios",
  "categories.grid": "Categorías",
  "featured.products": "Productos destacados",
  "promo.banner": "Banner promocional",
  newsletter: "Newsletter",
};

type AdminHomeEditorProps = {
  initialPayload: HomeContentPayload;
  vertical: "apparel" | "vape";
};

function TextField({
  label,
  value,
  onChange,
  id,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {multiline ? (
        <textarea
          id={id}
          className={adminSelectClass}
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}

function SectionFields({
  section,
  onChange,
}: {
  section: HomeSection;
  onChange: (section: HomeSection) => void;
}) {
  switch (section.type) {
    case "hero.static":
      return (
        <AdminFormGrid>
          <div className="sm:col-span-2">
            <TextField
              id={`${section.id}-bg`}
              label="Imagen de fondo (URL)"
              value={section.content.backgroundImageUrl}
              onChange={(backgroundImageUrl) =>
                onChange({
                  ...section,
                  content: { ...section.content, backgroundImageUrl },
                })
              }
            />
          </div>
          <TextField
            id={`${section.id}-eyebrow`}
            label="Badge / eyebrow"
            value={section.content.eyebrow}
            onChange={(eyebrow) =>
              onChange({ ...section, content: { ...section.content, eyebrow } })
            }
          />
          <TextField
            id={`${section.id}-line1`}
            label="Título línea 1"
            value={section.content.titleLine1}
            onChange={(titleLine1) =>
              onChange({ ...section, content: { ...section.content, titleLine1 } })
            }
          />
          <TextField
            id={`${section.id}-line2`}
            label="Título línea 2"
            value={section.content.titleLine2}
            onChange={(titleLine2) =>
              onChange({ ...section, content: { ...section.content, titleLine2 } })
            }
          />
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={section.content.titleLine2Highlight}
                onChange={(event) =>
                  onChange({
                    ...section,
                    content: {
                      ...section.content,
                      titleLine2Highlight: event.target.checked,
                    },
                  })
                }
              />
              Resaltar línea 2
            </label>
          </div>
          <TextField
            id={`${section.id}-line3`}
            label="Título línea 3"
            value={section.content.titleLine3}
            onChange={(titleLine3) =>
              onChange({ ...section, content: { ...section.content, titleLine3 } })
            }
          />
          <div className="sm:col-span-2">
            <TextField
              id={`${section.id}-desc`}
              label="Descripción"
              value={section.content.description}
              multiline
              onChange={(description) =>
                onChange({ ...section, content: { ...section.content, description } })
              }
            />
          </div>
          <TextField
            id={`${section.id}-cta1-label`}
            label="Botón primario — texto"
            value={section.content.primaryCta.label}
            onChange={(label) =>
              onChange({
                ...section,
                content: {
                  ...section.content,
                  primaryCta: { ...section.content.primaryCta, label },
                },
              })
            }
          />
          <TextField
            id={`${section.id}-cta1-href`}
            label="Botón primario — link"
            value={section.content.primaryCta.href}
            onChange={(href) =>
              onChange({
                ...section,
                content: {
                  ...section.content,
                  primaryCta: { ...section.content.primaryCta, href },
                },
              })
            }
          />
          <TextField
            id={`${section.id}-cta2-label`}
            label="Botón secundario — texto"
            value={section.content.secondaryCta.label}
            onChange={(label) =>
              onChange({
                ...section,
                content: {
                  ...section.content,
                  secondaryCta: { ...section.content.secondaryCta, label },
                },
              })
            }
          />
          <TextField
            id={`${section.id}-cta2-href`}
            label="Botón secundario — link"
            value={section.content.secondaryCta.href}
            onChange={(href) =>
              onChange({
                ...section,
                content: {
                  ...section.content,
                  secondaryCta: { ...section.content.secondaryCta, href },
                },
              })
            }
          />
          {section.content.stats.map((stat, index) => (
            <div key={`stat-${index}`} className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
              <TextField
                id={`${section.id}-stat-${index}-value`}
                label={`Stat ${index + 1} — valor`}
                value={stat.value}
                onChange={(value) => {
                  const stats = [...section.content.stats];
                  stats[index] = { ...stats[index], value };
                  onChange({ ...section, content: { ...section.content, stats } });
                }}
              />
              <TextField
                id={`${section.id}-stat-${index}-label`}
                label={`Stat ${index + 1} — etiqueta`}
                value={stat.label}
                onChange={(label) => {
                  const stats = [...section.content.stats];
                  stats[index] = { ...stats[index], label };
                  onChange({ ...section, content: { ...section.content, stats } });
                }}
              />
            </div>
          ))}
        </AdminFormGrid>
      );

    case "hero.carousel":
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor={`${section.id}-autoplay`}>Autoplay (ms)</Label>
            <Input
              id={`${section.id}-autoplay`}
              type="number"
              min={2000}
              max={30000}
              value={section.content.autoplayMs}
              onChange={(event) =>
                onChange({
                  ...section,
                  content: {
                    ...section.content,
                    autoplayMs: Number(event.target.value) || 4000,
                  },
                })
              }
            />
          </div>
          {section.content.slides.map((slide, slideIndex) => (
            <AdminCard key={slide.id} title={`Slide ${slideIndex + 1}: ${slide.label}`}>
              <AdminFormGrid>
                <TextField
                  id={`${slide.id}-image`}
                  label="Imagen (URL)"
                  value={slide.imageUrl}
                  onChange={(imageUrl) => {
                    const slides = [...section.content.slides];
                    slides[slideIndex] = { ...slides[slideIndex], imageUrl };
                    onChange({ ...section, content: { ...section.content, slides } });
                  }}
                />
                <TextField
                  id={`${slide.id}-eyebrow`}
                  label="Eyebrow"
                  value={slide.eyebrow}
                  onChange={(eyebrow) => {
                    const slides = [...section.content.slides];
                    slides[slideIndex] = { ...slides[slideIndex], eyebrow };
                    onChange({ ...section, content: { ...section.content, slides } });
                  }}
                />
                <TextField
                  id={`${slide.id}-title`}
                  label="Título"
                  value={slide.title}
                  onChange={(title) => {
                    const slides = [...section.content.slides];
                    slides[slideIndex] = { ...slides[slideIndex], title };
                    onChange({ ...section, content: { ...section.content, slides } });
                  }}
                />
                <TextField
                  id={`${slide.id}-emphasis`}
                  label="Énfasis (opcional)"
                  value={slide.titleEmphasis ?? ""}
                  onChange={(titleEmphasis) => {
                    const slides = [...section.content.slides];
                    slides[slideIndex] = {
                      ...slides[slideIndex],
                      titleEmphasis: titleEmphasis || undefined,
                    };
                    onChange({ ...section, content: { ...section.content, slides } });
                  }}
                />
                <div className="sm:col-span-2">
                  <TextField
                    id={`${slide.id}-desc`}
                    label="Descripción"
                    value={slide.description}
                    multiline
                    onChange={(description) => {
                      const slides = [...section.content.slides];
                      slides[slideIndex] = { ...slides[slideIndex], description };
                      onChange({ ...section, content: { ...section.content, slides } });
                    }}
                  />
                </div>
                <TextField
                  id={`${slide.id}-cta-label`}
                  label="CTA — texto"
                  value={slide.cta.label}
                  onChange={(label) => {
                    const slides = [...section.content.slides];
                    slides[slideIndex] = {
                      ...slides[slideIndex],
                      cta: { ...slides[slideIndex].cta, label },
                    };
                    onChange({ ...section, content: { ...section.content, slides } });
                  }}
                />
                <TextField
                  id={`${slide.id}-cta-href`}
                  label="CTA — link"
                  value={slide.cta.href}
                  onChange={(href) => {
                    const slides = [...section.content.slides];
                    slides[slideIndex] = {
                      ...slides[slideIndex],
                      cta: { ...slides[slideIndex].cta, href },
                    };
                    onChange({ ...section, content: { ...section.content, slides } });
                  }}
                />
              </AdminFormGrid>
            </AdminCard>
          ))}
        </div>
      );

    case "features.bar":
      return (
        <div className="space-y-4">
          {section.content.items.map((item, index) => (
            <AdminFormGrid key={`${item.title}-${index}`}>
              <TextField
                id={`${section.id}-feature-${index}-title`}
                label={`Beneficio ${index + 1}`}
                value={item.title}
                onChange={(title) => {
                  const items = [...section.content.items];
                  items[index] = { ...items[index], title };
                  onChange({ ...section, content: { ...section.content, items } });
                }}
              />
              <TextField
                id={`${section.id}-feature-${index}-desc`}
                label="Descripción"
                value={item.description}
                onChange={(description) => {
                  const items = [...section.content.items];
                  items[index] = { ...items[index], description };
                  onChange({ ...section, content: { ...section.content, items } });
                }}
              />
            </AdminFormGrid>
          ))}
        </div>
      );

    case "featured.products":
      return (
        <AdminFormGrid>
          <TextField
            id={`${section.id}-title`}
            label="Título"
            value={section.content.title}
            onChange={(title) =>
              onChange({ ...section, content: { ...section.content, title } })
            }
          />
          <TextField
            id={`${section.id}-accent`}
            label="Acento (opcional)"
            value={section.content.titleAccent ?? ""}
            onChange={(titleAccent) =>
              onChange({
                ...section,
                content: {
                  ...section.content,
                  titleAccent: titleAccent || undefined,
                },
              })
            }
          />
          <div className="sm:col-span-2">
            <TextField
              id={`${section.id}-view-all`}
              label="Link ver todos"
              value={section.content.viewAllHref}
              onChange={(viewAllHref) =>
                onChange({ ...section, content: { ...section.content, viewAllHref } })
              }
            />
          </div>
        </AdminFormGrid>
      );

    case "promo.banner":
      return (
        <AdminFormGrid>
          <TextField
            id={`${section.id}-eyebrow`}
            label="Eyebrow"
            value={section.content.eyebrow}
            onChange={(eyebrow) =>
              onChange({ ...section, content: { ...section.content, eyebrow } })
            }
          />
          <TextField
            id={`${section.id}-title`}
            label="Título"
            value={section.content.title}
            onChange={(title) =>
              onChange({ ...section, content: { ...section.content, title } })
            }
          />
          <TextField
            id={`${section.id}-highlight`}
            label="Título destacado"
            value={section.content.titleHighlight}
            onChange={(titleHighlight) =>
              onChange({ ...section, content: { ...section.content, titleHighlight } })
            }
          />
          <TextField
            id={`${section.id}-code`}
            label="Código cupón (opcional)"
            value={section.content.couponCode ?? ""}
            onChange={(couponCode) =>
              onChange({
                ...section,
                content: { ...section.content, couponCode: couponCode || undefined },
              })
            }
          />
          <TextField
            id={`${section.id}-cta-label`}
            label="CTA — texto"
            value={section.content.cta.label}
            onChange={(label) =>
              onChange({
                ...section,
                content: {
                  ...section.content,
                  cta: { ...section.content.cta, label },
                },
              })
            }
          />
          <TextField
            id={`${section.id}-cta-href`}
            label="CTA — link"
            value={section.content.cta.href}
            onChange={(href) =>
              onChange({
                ...section,
                content: {
                  ...section.content,
                  cta: { ...section.content.cta, href },
                },
              })
            }
          />
        </AdminFormGrid>
      );

    case "newsletter":
      return (
        <AdminFormGrid>
          <TextField
            id={`${section.id}-eyebrow`}
            label="Eyebrow"
            value={section.content.eyebrow}
            onChange={(eyebrow) =>
              onChange({ ...section, content: { ...section.content, eyebrow } })
            }
          />
          <TextField
            id={`${section.id}-title`}
            label="Título"
            value={section.content.title}
            onChange={(title) =>
              onChange({ ...section, content: { ...section.content, title } })
            }
          />
          <div className="sm:col-span-2">
            <TextField
              id={`${section.id}-desc`}
              label="Descripción"
              value={section.content.description}
              multiline
              onChange={(description) =>
                onChange({ ...section, content: { ...section.content, description } })
              }
            />
          </div>
          <TextField
            id={`${section.id}-placeholder`}
            label="Placeholder email"
            value={section.content.placeholder}
            onChange={(placeholder) =>
              onChange({ ...section, content: { ...section.content, placeholder } })
            }
          />
          <TextField
            id={`${section.id}-button`}
            label="Texto del botón"
            value={section.content.buttonLabel}
            onChange={(buttonLabel) =>
              onChange({ ...section, content: { ...section.content, buttonLabel } })
            }
          />
        </AdminFormGrid>
      );

    case "categories.grid":
      return (
        <div className="space-y-4">
          <AdminFormGrid>
            <TextField
              id={`${section.id}-eyebrow`}
              label="Eyebrow"
              value={section.content.eyebrow}
              onChange={(eyebrow) =>
                onChange({ ...section, content: { ...section.content, eyebrow } })
              }
            />
            <TextField
              id={`${section.id}-title`}
              label="Título"
              value={section.content.title}
              onChange={(title) =>
                onChange({ ...section, content: { ...section.content, title } })
              }
            />
          </AdminFormGrid>
          {section.content.items.map((item, index) => (
            <AdminCard key={item.slug} title={item.label} padding>
              <AdminFormGrid>
                <TextField
                  id={`${item.slug}-image`}
                  label="Imagen (URL)"
                  value={item.imageUrl}
                  onChange={(imageUrl) => {
                    const items = [...section.content.items];
                    items[index] = { ...items[index], imageUrl };
                    onChange({ ...section, content: { ...section.content, items } });
                  }}
                />
                <TextField
                  id={`${item.slug}-href`}
                  label="Link"
                  value={item.href ?? ""}
                  onChange={(href) => {
                    const items = [...section.content.items];
                    items[index] = { ...items[index], href: href || undefined };
                    onChange({ ...section, content: { ...section.content, items } });
                  }}
                />
              </AdminFormGrid>
            </AdminCard>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export function AdminHomeEditor({ initialPayload, vertical }: AdminHomeEditorProps) {
  const router = useRouter();
  const [payload, setPayload] = useState(initialPayload);
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    initialPayload.sections[0]?.id ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const sections = useMemo(
    () => sortHomeSections(payload.sections),
    [payload.sections],
  );

  const updateSection = (index: number, section: HomeSection) => {
    setPayload((current) => {
      const next = [...current.sections];
      next[index] = section;
      return { ...current, sections: next };
    });
    setSaved(false);
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const reordered = [...sections];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    const withOrder = reordered.map((section, orderIndex) => ({
      ...section,
      order: (orderIndex + 1) * 10,
    }));

    setPayload((current) => ({ ...current, sections: withOrder }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/home-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          version: HOME_CONTENT_VERSION,
          sections: sortHomeSections(payload.sections),
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar la home.");
      }

      setSaved(true);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la home.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-600">
            Editá bloques de la home para la tienda{" "}
            <span className="font-medium text-neutral-900">{vertical}</span>. Los
            productos destacados siguen saliendo del catálogo (`featured` en admin).
          </p>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver tienda <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </AdminCard>

      {sections.map((section, index) => {
        const isOpen = openSectionId === section.id;

        return (
          <AdminCard key={section.id} padding={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="font-semibold text-neutral-900">
                  {SECTION_LABELS[section.type]}
                </p>
                <p className="text-xs text-neutral-500">Orden {section.order}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(event) =>
                      updateSection(index, {
                        ...section,
                        enabled: event.target.checked,
                      })
                    }
                  />
                  Visible
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => moveSection(index, -1)}
                  aria-label="Subir sección"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, 1)}
                  aria-label="Bajar sección"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setOpenSectionId(isOpen ? null : section.id)
                  }
                >
                  {isOpen ? "Cerrar" : "Editar"}
                </Button>
              </div>
            </div>

            {isOpen ? (
              <div className="p-4 sm:p-6">
                <SectionFields
                  section={section}
                  onChange={(next) => updateSection(index, next)}
                />
              </div>
            ) : null}
          </AdminCard>
        );
      })}

      <AdminCard>
        <AdminForm
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
          {saved ? (
            <AdminFormAlert variant="success">
              Home guardada. Los cambios pueden tardar unos segundos en la tienda.
            </AdminFormAlert>
          ) : null}
          <AdminFormActions sticky>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar home"}
            </Button>
          </AdminFormActions>
        </AdminForm>
      </AdminCard>
    </div>
  );
}
