/**
 * Variable replacement engine for Versaly Core documents and templates.
 * Replaces {{variable_name}} tokens with provided parameters.
 */
export function renderTemplate(
  templateContent: string,
  variables: Record<string, string | number | undefined>
): string {
  let rendered = templateContent;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    rendered = rendered.replace(regex, value !== undefined ? String(value) : "");
  }

  return rendered;
}

/**
 * Extracts all unique {{variable}} placeholders from a template string.
 */
export function extractTemplateVariables(templateContent: string): string[] {
  const matches = templateContent.matchAll(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g);
  const vars = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      vars.add(match[1]);
    }
  }

  return Array.from(vars);
}
