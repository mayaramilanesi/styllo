declare module "qrcode-terminal" {
  function generate(text: string, options?: { small?: boolean }): void;
  const qrcode: {
    generate: typeof generate;
  };
  export = qrcode;
}
