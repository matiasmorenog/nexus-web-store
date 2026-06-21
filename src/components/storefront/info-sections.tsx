import type { InfoSection } from "@/lib/info-pages";

type InfoSectionsProps = {
  sections: InfoSection[];
};

export function InfoSections({ sections }: InfoSectionsProps) {
  return (
    <div className="space-y-4 text-neutral-700">
      {sections.map((section, index) => {
        if (section.type === "heading") {
          return (
            <h2
              key={index}
              className="pt-2 text-lg font-semibold text-neutral-900 first:pt-0"
            >
              {section.text}
            </h2>
          );
        }

        if (section.type === "list") {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5 leading-relaxed">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="leading-relaxed">
            {section.text}
          </p>
        );
      })}
    </div>
  );
}
