type LayoutProps = {
  title?: string;
  children: any;
  stylesheet?: string;
};

export function Layout({
  title = "Tulip Trust",
  children,
  stylesheet,
}: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/public/tokens.css" />
        <link rel="stylesheet" href="/public/global.css" />
        {stylesheet && <link rel="stylesheet" href={stylesheet} />}
        <link rel="icon" href="/public/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
