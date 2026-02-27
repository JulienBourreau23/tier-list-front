export default function Footer() {
  const year = new Date().getFullYear();
  return <footer className="text-center">©️ Copyright Bordack {year}</footer>;
}
