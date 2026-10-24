import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isCompact?: boolean;
  theme?: 'default' | 'invert';
}

type InlineTheme = 'default' | 'invert';

/**
 * Transforma texto inline (**negrita**, *cursiva*, `código`, __negrita__, _cursiva_)
 * en elementos React estilizados acordes a la identidad visual Class-Edtech
 * sin dejar asteriscos o caracteres de formato crudos visibles.
 */
export function renderInline(text: string, theme: InlineTheme = 'default'): React.ReactNode {
  if (!text) return null;

  // Regex para capturar ***bold italic***, **bold**, *italic*, `code`, __bold__, _italic_
  const tokenRegex = /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*|___[^_]+?___|__[^_]+?__|_[^_]+?_|`[^`]+?`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Negrita + Cursiva triple ***texto***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      const inner = part.slice(3, -3);
      return (
        <strong
          key={index}
          className={`font-extrabold italic ${
            theme === 'invert' ? 'text-white underline decoration-[#EB0202]' : 'text-[#071D3F]'
          }`}
        >
          {inner}
        </strong>
      );
    }

    // Negrita **texto** o __texto__
    if (
      (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
      (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          className={`font-extrabold ${
            theme === 'invert' ? 'text-white underline decoration-[#EB0202]' : 'text-[#071D3F]'
          }`}
        >
          {inner}
        </strong>
      );
    }

    // Cursiva *texto* o _texto_
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em
          key={index}
          className={`italic font-medium ${
            theme === 'invert'
              ? 'text-red-200'
              : 'text-slate-900 bg-red-50/70 px-1 py-0.5 rounded text-[95%]'
          }`}
        >
          {inner}
        </em>
      );
    }

    // Código en línea `código`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${
            theme === 'invert'
              ? 'bg-white/20 text-white border-white/30'
              : 'bg-slate-100 text-[#EB0202] border-slate-200'
          }`}
        >
          {inner}
        </code>
      );
    }

    // Texto plano
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

interface BlockItem {
  text: string;
  isNested: boolean;
  number?: string;
}

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'callout' | 'list' | 'paragraph';
  content?: string;
  items?: BlockItem[];
}

/**
 * Parsea el contenido markdown línea por línea en bloques estructurados.
 * Soporta headers (#, ##, ###), listas normales y anidadas (- y *), listas numeradas,
 * destacados/alertas (⚠️, >, "Regla clave") y párrafos fluidos.
 */
function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n');
  const blocks: Block[] = [];
  let currentList: { type: 'list'; items: BlockItem[] } | null = null;
  let currentPara: string[] = [];

  const flushPara = () => {
    if (currentPara.length > 0) {
      blocks.push({ type: 'paragraph', content: currentPara.join('\n') });
      currentPara = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  const flushAll = () => {
    flushPara();
    flushList();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Línea vacía actúa como separador
    if (!trimmed) {
      flushAll();
      continue;
    }

    // Encabezado nivel 1 (# Título)
    if (trimmed.startsWith('# ')) {
      flushAll();
      blocks.push({ type: 'h1', content: trimmed.replace(/^#\s+/, '') });
      continue;
    }

    // Encabezado nivel 2 (## Subtítulo)
    if (trimmed.startsWith('## ')) {
      flushAll();
      blocks.push({ type: 'h2', content: trimmed.replace(/^##\s+/, '') });
      continue;
    }

    // Encabezado nivel 3 (### Sección)
    if (trimmed.startsWith('### ')) {
      flushAll();
      blocks.push({ type: 'h3', content: trimmed.replace(/^###\s+/, '') });
      continue;
    }

    // Destacado / Alerta o Cita (> o ⚠️ o "Regla clave")
    if (
      trimmed.startsWith('> ') ||
      trimmed.startsWith('⚠️') ||
      trimmed.includes('Regla clave') ||
      trimmed.includes('Regla de Oro')
    ) {
      flushAll();
      blocks.push({ type: 'callout', content: trimmed.replace(/^>\s*/, '') });
      continue;
    }

    // Elemento de lista (- o * o 1.)
    const listMatch = rawLine.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      flushPara();
      const indentSpaces = listMatch[1].length;
      const marker = listMatch[2];
      const itemText = listMatch[3];

      if (!currentList) {
        currentList = { type: 'list', items: [] };
      }

      currentList.items.push({
        text: itemText,
        isNested: indentSpaces >= 2,
        number: /^\d+\./.test(marker) ? marker : undefined,
      });
      continue;
    }

    // Texto de párrafo continuo
    flushList();
    currentPara.push(trimmed);
  }

  flushAll();
  return blocks;
}

/**
 * Componente de renderizado de Markdown rico, limpio y estructurado con la paleta Class-Edtech
 */
export default function MarkdownRenderer({
  content,
  className = '',
  isCompact = false,
  theme = 'default',
}: MarkdownRendererProps) {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div
      className={`space-y-3 ${
        theme === 'invert' ? 'text-white' : 'text-[#071D3F]'
      } ${className}`}
    >
      {blocks.map((block, blockIndex) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2
                key={blockIndex}
                className={`${
                  isCompact ? 'text-lg font-bold pt-2' : 'text-2xl sm:text-3xl font-extrabold pt-3 pb-2 border-b border-slate-100'
                } tracking-tight ${theme === 'invert' ? 'text-white' : 'text-[#071D3F]'}`}
              >
                {renderInline(block.content || '', theme)}
              </h2>
            );

          case 'h2':
            return (
              <h3
                key={blockIndex}
                className={`${
                  isCompact
                    ? 'text-sm sm:text-base font-bold pt-2 pb-0.5 border-l-3 border-[#EB0202] pl-2.5 mt-3'
                    : 'text-lg sm:text-xl font-bold pt-3 pb-1 border-l-4 border-[#EB0202] pl-3.5 tracking-tight mt-5 mb-2'
                } ${theme === 'invert' ? 'text-white' : 'text-[#071D3F]'}`}
              >
                {renderInline(block.content || '', theme)}
              </h3>
            );

          case 'h3':
            return (
              <h4
                key={blockIndex}
                className={`${
                  isCompact ? 'text-xs sm:text-sm font-bold pt-1.5' : 'text-base font-bold pt-2 pb-1'
                } tracking-tight ${theme === 'invert' ? 'text-white' : 'text-[#071D3F]'}`}
              >
                {renderInline(block.content || '', theme)}
              </h4>
            );

          case 'callout':
            return (
              <div
                key={blockIndex}
                className={`p-3.5 rounded-xl border-l-4 my-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  theme === 'invert'
                    ? 'bg-white/10 border-[#EB0202] text-white'
                    : 'bg-red-50/70 border-[#EB0202] text-slate-800'
                }`}
              >
                {renderInline(block.content || '', theme)}
              </div>
            );

          case 'list':
            return (
              <ul key={blockIndex} className={`space-y-2 my-2.5 ${isCompact ? 'pl-0.5' : 'pl-1'}`}>
                {block.items?.map((item, itemIdx) => {
                  if (item.number) {
                    return (
                      <li
                        key={itemIdx}
                        className={`flex items-start gap-2.5 ${
                          item.isNested ? 'ml-5' : ''
                        } text-xs sm:text-[14px] leading-relaxed`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            theme === 'invert'
                              ? 'bg-white text-[#071D3F]'
                              : 'bg-[#071D3F] text-white'
                          }`}
                        >
                          {item.number.replace('.', '')}
                        </span>
                        <span className="flex-1">{renderInline(item.text, theme)}</span>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={itemIdx}
                      className={`flex items-start gap-2.5 ${
                        item.isNested ? 'ml-5 text-slate-600' : 'text-slate-800'
                      } text-xs sm:text-[14px] leading-relaxed`}
                    >
                      {item.isNested ? (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                            theme === 'invert' ? 'bg-white/70' : 'bg-[#071D3F]'
                          }`}
                        ></span>
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            theme === 'invert' ? 'bg-white' : 'bg-[#EB0202]'
                          }`}
                        ></span>
                      )}
                      <span className="flex-1">{renderInline(item.text, theme)}</span>
                    </li>
                  );
                })}
              </ul>
            );

          case 'paragraph':
          default:
            return (
              <div
                key={blockIndex}
                className={`space-y-1.5 text-xs sm:text-[14px] leading-relaxed ${
                  theme === 'invert' ? 'text-white' : 'text-slate-700'
                }`}
              >
                {block.content?.split('\n').map((line, lineIdx) => (
                  <p key={lineIdx} className="leading-relaxed">
                    {renderInline(line, theme)}
                  </p>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}
