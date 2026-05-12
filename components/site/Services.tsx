const SERVICES = [
  {
    icon: '🏭',
    title: 'Storage & Receiving',
    items: ['Pallet & shelving storage', 'GRN with condition reports', 'Barcode labelling on receipt', 'Climate-controlled zones available'],
  },
  {
    icon: '⚡',
    title: 'Pick & Pack Fulfillment',
    items: ['Same-day dispatch (2pm cutoff)', 'Multi-item & multi-SKU orders', 'Fragile & oversized items', 'Tracked dispatch on every order'],
  },
  {
    icon: '🎁',
    title: 'Custom Unboxing',
    items: ['Branded tissue & ribbon', 'Thank-you inserts & flyers', 'Custom outer & inner boxes', 'Bubble wrap & premium protection'],
  },
  {
    icon: '🔄',
    title: 'Returns Processing',
    items: ['Inspection & condition grading', 'Restock or quarantine routing', 'Photo documentation', 'Seller portal visibility'],
  },
  {
    icon: '🚛',
    title: 'B2B & Bulk Dispatch',
    items: ['Pallet dispatch to wholesalers', 'Amazon FBA prep & labelling', 'Retail compliance packing', 'Freight booking support'],
  },
  {
    icon: '📈',
    title: 'Reporting & Analytics',
    items: ['Real-time seller dashboard', 'Monthly statements & invoices', 'Stock forecasting alerts', 'Carrier performance reports'],
  },
]

export default function Services() {
  return (
    <section id="services" className="bg-white">
      <div className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: '#F0F4FA', color: '#2A4F8A', border: '1px solid #D0D8E8' }}
          >
            Our Services
          </div>
          <h2
            className="text-4xl font-black mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: '#0A1628' }}
          >
            Everything you need, nothing you don't
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: '#7A8BA0' }}>
            From receiving your stock to putting it in your customer's hands — we handle the entire fulfillment lifecycle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map(s => (
            <div
              key={s.title}
              className="rounded-2xl p-6 group transition-all hover:-translate-y-1 cursor-default"
              style={{ background: '#F8F9FC', border: '1px solid #E8ECF2' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-all"
                style={{ background: 'linear-gradient(135deg,#0A1628,#142D56)', boxShadow: '0 4px 12px rgba(10,22,40,.15)' }}
              >
                {s.icon}
              </div>
              <h3 className="font-bold text-base mb-3" style={{ color: '#0E2040' }}>{s.title}</h3>
              <ul className="space-y-1.5">
                {s.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#6A7D9A' }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: '#C8971A' }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
