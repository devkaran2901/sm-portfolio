/**
 * Renders JSON-LD structured data.
 *
 * `<` is escaped so a value containing `</script>` cannot break out of the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // Content is generated server-side from typed builders, never from user input.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
