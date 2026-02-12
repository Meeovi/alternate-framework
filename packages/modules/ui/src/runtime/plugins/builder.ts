import {
  defineNuxtPlugin
} from 'nuxt/app'
import 'grapesjs/dist/css/grapes.min.css'
import grapesjs from 'grapesjs'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) return

  const mount = () => {
    const el = document.querySelector('#gjs')
    if (!el) return null

    const editor = grapesjs.init({
      container: `${el}`,
      fromElement: true,
      height: '100%',
      width: 'auto',
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
        stepsBeforeSave: 1,
        options: {
          local: {
            key: 'gjsProject'
          }
        }
      },

      // Avoid any default panel
      layerManager: {
        appendTo: '.layers-container',
      },

      mediaCondition: 'min-width', // default is `max-width`
      deviceManager: {
        devices: [{
            name: 'Desktop',
            width: '', // default size
            widthMedia: '1024px', // this value will be used in CSS @media
          },
          {
            name: 'Mobile',
            width: '320px', // this value will be used on canvas width
            widthMedia: '480px', // this value will be used in CSS @media
          },
        ],
      },

      blockManager: {
        appendTo: '#blocks',
        blocks: [{
            id: 'section', // id is mandatory
            label: '<b>Section</b>', // You can use HTML/SVG inside labels
            category: 'Basic',
            attributes: {
              class: 'gjs-block-section'
            },
            content: {
              tagName: 'div',
              draggable: false,
              attributes: {
                'some-attribute': 'some-value'
              },
              components: [{
                  tagName: 'span',
                  content: '<b>Some static content</b>',
                },
                {
                  tagName: 'div',
                  // use `content` for static strings, `components` string will be parsed
                  // and transformed in Components
                  components: '<span>HTML at some point</span>',
                },
              ],
            },
          },
          {
            id: 'text',
            label: 'Text',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          },
          {
            id: 'image',
            label: 'Image',
            // Select the component once it's dropped
            select: true,
            // You can pass components as a JSON instead of a simple HTML string,
            // in this case we also use a defined component type `image`
            content: {
              type: 'image'
            },
            // This triggers `active` event on dropped components and the `image`
            // reacts by opening the AssetManager
            activate: true,
          },
        ],
      },
      panels: {
        defaults: [{
            id: 'layers',
            el: '.panel__right',
            // Make the panel resizable
            resizable: {
              maxDim: 350,
              minDim: 200,
              tc: false, // Top handler
              cl: true, // Left handler
              cr: false, // Right handler
              bc: false, // Bottom handler
              // Being a flex child we need to change `flex-basis` property
              // instead of the `width` (default)
              keyWidth: 'flex-basis',
            },
          },
          {
            id: 'panel-switcher',
            el: '.panel__switcher',
            buttons: [{
                id: 'show-layers',
                active: true,
                label: 'Layers',
                command: 'show-layers',
                // Once activated disable the possibility to turn it off
                togglable: false,
              },
              {
                id: 'show-style',
                active: true,
                label: 'Styles',
                command: 'show-styles',
                togglable: false,
              },
              {
                id: 'show-traits',
                active: true,
                label: 'Traits',
                command: 'show-traits',
                togglable: false,
              },
            ],
          },
          {
            id: 'panel-devices',
            el: '.panel__devices',
            buttons: [{
                id: 'device-desktop',
                label: 'D',
                command: 'set-device-desktop',
                active: true,
                togglable: false,
              },
              {
                id: 'device-mobile',
                label: 'M',
                command: 'set-device-mobile',
                togglable: false,
              },
            ],
          },
        ],
      },
      // The Selector Manager allows to assign classes and
      // different states (eg. :hover) on components.
      // Generally, it's used in conjunction with Style Manager
      // but it's not mandatory
      selectorManager: {
        appendTo: '.styles-container',
      },
      styleManager: {
        appendTo: '.styles-container',
        sectors: [{
            name: 'Dimension',
            open: false,
            // Use built-in properties
            buildProps: ['width', 'min-height', 'padding'],
            // Use `properties` to define/override single property
            properties: [{
              // Type of the input,
              // options: integer | radio | select | color | slider | file | composite | stack
              type: 'integer',
              name: 'The width', // Label for the property
              property: 'width', // CSS property (if buildProps contains it will be extended)
              units: ['px', '%'], // Units, available only for 'integer' types
              defaults: 'auto', // Default value
              min: 0, // Min value, available only for 'integer' types
            }, ],
          },
          {
            name: 'Extra',
            open: false,
            buildProps: ['background-color', 'box-shadow', 'custom-prop'],
            properties: [{
              id: 'custom-prop',
              name: 'Custom Label',
              property: 'font-size',
              type: 'select',
              defaults: '32px',
              // List of options, available only for 'select' and 'radio'  types
              options: [{
                  id: 'tiny',
                  value: '12px',
                  name: 'Tiny'
                },
                {
                  id: 'medium',
                  value: '18px',
                  name: 'Medium'
                },
                {
                  id: 'big',
                  value: '32px',
                  name: 'Big'
                },
              ],
            }, ],
          },
        ],
      },
    });

    // Define commands
    editor.Commands.add('show-layers', {
      getRowEl(editor: any) {
        return editor.getContainer().closest('.editor-row');
      },
      getLayersEl(row: any) {
        return row.querySelector('.layers-container');
      },

      run(editor: any, sender: any) {
        const lmEl = this.getLayersEl(this.getRowEl(editor));
        lmEl.style.display = '';
      },
      stop(editor: any, sender: any) {
        const lmEl = this.getLayersEl(this.getRowEl(editor));
        lmEl.style.display = 'none';
      },
    });
    editor.Commands.add('show-styles', {
      getRowEl(editor: any) {
        return editor.getContainer().closest('.editor-row');
      },
      getStyleEl(row: any) {
        return row.querySelector('.styles-container');
      },

      run(editor: any, sender: any) {
        const smEl = this.getStyleEl(this.getRowEl(editor));
        smEl.style.display = '';
      },
      stop(editor: any, sender: any) {
        const smEl = this.getStyleEl(this.getRowEl(editor));
        smEl.style.display = 'none';
      },
    });

    editor.Commands.add('show-traits', {
      getTraitsEl(editor: any) {
        const row = editor.getContainer().closest('.editor-row');
        return row.querySelector('.traits-container');
      },
      run(editor: any, sender: any) {
        this.getTraitsEl(editor).style.display = '';
      },
      stop(editor: any, sender: any) {
        this.getTraitsEl(editor).style.display = 'none';
      },
    });

    editor.Panels.addPanel({
      id: 'panel-top',
      el: '.panel__top',
    });
    editor.Panels.addPanel({
      id: 'basic-actions',
      el: '.panel__basic-actions',
      buttons: [{
          id: 'visibility',
          active: true, // active by default
          className: 'btn-toggle-borders',
          label: '<u>B</u>',
          command: 'sw-visibility', // Built-in command
        },
        {
          id: 'export',
          className: 'btn-open-export',
          label: 'Exp',
          command: 'export-template',
          context: 'export-template', // For grouping context of buttons from the same panel
        },
        {
          id: 'show-json',
          className: 'btn-show-json',
          label: 'JSON',
          context: 'show-json',
          command(editor: any) {
            editor.Modal.setTitle('Components JSON')
              .setContent(
                `<textarea style="width:100%; height: 250px;">
            ${JSON.stringify(editor.getComponents())}
          </textarea>`,
              )
              .open();
          },
        },
      ],
    });
    editor.Commands.add('set-device-desktop', {
      run: (editor) => editor.setDevice('Desktop'),
    });
    editor.Commands.add('set-device-mobile', {
      run: (editor) => editor.setDevice('Mobile'),
    });
    editor.on('change:device', () => console.log('Current device: ', editor.getDevice()));
    // Set initial device as Mobile
    editor.setDevice('Mobile');

    nuxtApp.provide('grapesStudio', editor)
    return editor
  }

  // Auto‑mount when page loads
  window.addEventListener('DOMContentLoaded', mount)
})