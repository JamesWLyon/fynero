export type TimeFilter =
  | "all"
  | `day${"" | `:${string}`}`
  | `month${"" | `:${string}`}`
  | `year${"" | `:${string}`}`
  | {
      month?: number;
      year?: number;
    };