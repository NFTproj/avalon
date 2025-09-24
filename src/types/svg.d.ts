declare module "*.svg" {
  import React from "react";
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}

// Extensão para os tipos JSX intrínsecos
declare global {
  namespace JSX {
    interface IntrinsicElements {
      svg: React.DetailedHTMLProps<React.SVGProps<SVGSVGElement>, SVGSVGElement>;
    }
  }
}

export {};