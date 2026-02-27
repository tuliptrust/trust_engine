type LayoutProps = {
  title?: string;
  children: any;
};

export function Layout({ title = "Tulip Trust", children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/tokens.css" />
        <link rel="stylesheet" href="/global.css" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
