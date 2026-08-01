export function getErrorMessage(error: string | null | undefined, t: (path: string) => string) {
  if (!error) {
    return t("errors.UNKNOWN_ERROR");
  }

  const translated = t(`errors.${error}`);
  return translated === `errors.${error}` ? error : translated;
}
