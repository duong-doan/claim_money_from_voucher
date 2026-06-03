import './global.css';

export default function RootLayout({ children }) {
  return (
    <html lang='vi'>
      <body>{children}</body>
    </html>
  );
}
