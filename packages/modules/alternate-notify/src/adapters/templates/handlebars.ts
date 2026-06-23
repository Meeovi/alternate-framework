import Handlebars from 'handlebars';
import {
  RenderTemplateInput,
  RenderTemplateResult,
  TemplateRenderer
} from '../../ports/templates.js';

export interface HandlebarsTemplateMap {
  [templateKey: string]: {
    subject?: string;
    text?: string;
    html?: string;
  };
}

export class HandlebarsTemplateRenderer implements TemplateRenderer {
  private compiled: {
    [templateKey: string]: {
      subject?: Handlebars.TemplateDelegate;
      text?: Handlebars.TemplateDelegate;
      html?: Handlebars.TemplateDelegate;
    };
  } = {};

  constructor(templates: HandlebarsTemplateMap) {
    for (const [key, tpl] of Object.entries(templates)) {
      this.compiled[key] = {
        subject: tpl.subject
          ? Handlebars.compile(tpl.subject)
          : undefined,
        text: tpl.text ? Handlebars.compile(tpl.text) : undefined,
        html: tpl.html ? Handlebars.compile(tpl.html) : undefined
      };
    }
  }

  async render(input: RenderTemplateInput): Promise<RenderTemplateResult> {
    const tpl = this.compiled[input.templateKey];
    if (!tpl) {
      throw new Error(`Template not found: ${input.templateKey}`);
    }

    return {
      subject: tpl.subject?.(input.data),
      text: tpl.text?.(input.data),
      html: tpl.html?.(input.data)
    };
  }
}
