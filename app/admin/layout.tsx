export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      {/* Any sidebar or nav you have for the admin section */}
      {children}
    </section>
  );
}