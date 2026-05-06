type MatterLike = {
  type?: string | null;
};

export function useMatterType(matter?: MatterLike) {
  return matter?.type ?? "CASE";
}