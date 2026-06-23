export interface RenderTemplateInput {
  templateKey: string;
  data: Record<string, unknown>;
}

export interface RenderTemplateResult {
  subject?: string;
  text?: string;
  html?: string;
  payload?: Record<string, unknown>;
}

export interface TemplateRenderer {
  render(input: RenderTemplateInput): Promise<RenderTemplateResult>;
}
