declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}


declare module 'recharts' {
  export const Pie: any;
  export const PieChart: any;
  export const Cell: any;
  export const Tooltip: any;
  export const Legend: any;
  export const ResponsiveContainer: any;
  export const Line: any;
  export const LineChart: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
}

declare module '@vitejs/plugin-react' {
  const plugin: any;
  export default plugin;
}
