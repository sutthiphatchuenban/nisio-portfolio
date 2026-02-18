declare module 'react-syntax-highlighter' {
  import * as React from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: React.CSSProperties;
    codeTagProps?: React.HTMLAttributes<HTMLElement>;
    useInlineStyles?: boolean;
    showLineNumbers?: boolean;
    showInlineLineNumbers?: boolean;
    startingLineNumber?: number;
    lineNumberContainerStyle?: React.CSSProperties;
    lineNumberStyle?: React.CSSProperties;
    wrapLines?: boolean;
    wrapLongLines?: boolean;
    lineProps?: LineTagPropsFunction | React.HTMLAttributes<HTMLElement>;
    renderer?: (props: RendererProps) => React.ReactNode;
    PreTag?: React.ElementType;
    CodeTag?: React.ElementType;
    children: string;
    className?: string;
  }
  
  export interface LineTagPropsFunction {
    (lineNumber: number): React.HTMLAttributes<HTMLElement>;
  }
  
  export interface RendererProps {
    rows: any[];
    stylesheet: any;
    useInlineStyles: boolean;
  }
  
  export const Prism: React.FC<SyntaxHighlighterProps>;
  export const Light: React.FC<SyntaxHighlighterProps>;
  export default Prism;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneDark: any;
  export const oneLight: any;
  export const vs: any;
  export const vscDarkPlus: any;
  export const materialDark: any;
  export const materialLight: any;
  export const dracula: any;
  export const atomDark: any;
  export const duotoneDark: any;
  export const duotoneLight: any;
  export const ghcolors: any;
  export const gruvboxDark: any;
  export const gruvboxLight: any;
  export const hopscotch: any;
  export const okaidia: any;
  export const pojoaque: any;
  export const prism: any;
  export const solarizedDark: any;
  export const solarizedLight: any;
  export const tomorrow: any;
  export const twilight: any;
  export const xonokai: any;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism' {
  export * from 'react-syntax-highlighter/dist/esm/styles/prism';
}

declare module 'rehype-raw' {
  import { Plugin } from 'unified';
  const rehypeRaw: Plugin<[], import('hast').Root>;
  export default rehypeRaw;
}

declare module 'rehype-sanitize' {
  import { Plugin } from 'unified';
  
  export interface Schema {
    tagNames?: string[];
    attributes?: { [tag: string]: string[] };
    clobber?: string[];
    clobberPrefix?: string;
    protocols?: { [protocol: string]: string[] };
    strip?: string[];
    allowComments?: boolean;
    allowDoctypes?: boolean;
  }
  
  export const defaultSchema: Schema;
  
  const rehypeSanitize: Plugin<[Schema?], import('hast').Root>;
  export default rehypeSanitize;
}
