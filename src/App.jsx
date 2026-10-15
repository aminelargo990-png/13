import { useState } from 'react';
import {
  Store,
  Package,
  Settings,
  Globe,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState('fr');
  const isArabic = language === 'ar';

  const text = isArabic
    ? {
        title: 'ShopPro DZ',
        subtitle: 'إدارة متجرك بسهولة',
        products: 'المنتجات',
        settings: 'الإعدادات',
        admin: 'الإدارة',
        status: 'التطبيق يعمل بنجاح',
        welcome: 'مرحبًا بك في ShopPro DZ',
        description: 'منصة إدارة المتاجر الجزائرية'
      }
    : {
        title: 'ShopPro DZ',
        subtitle: 'Gérez votre boutique facilement',
        products: 'Produits',
        settings: 'Paramètres',
        admin: 'Administration',
        status: "L’application fonctionne correctement",
        welcome: 'Bienvenue sur ShopPro DZ',
        description: 'Gestion des boutiques en Algérie'
      };

  return (
    <main
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        padding: '24px',
        boxSizing: 'border-box'
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          maxWidth: '900px',
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: '#10b981',
              padding: '12px',
              borderRadius: '14px',
              display: 'flex'
            }}
          >
            <ShoppingBag size={28} color="#052e2b" />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{text.title}</h1>
            <p style={{ margin: '5px 0 0', color: '#94a3b8' }}>
              {text.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setLanguage(isArabic ? 'fr' : 'ar')}
          style={{
            padding: '10px 14px',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Globe size={18} />
          {isArabic ? 'Français' : 'العربية'}
        </button>
      </header>

      <section
        style={{
          maxWidth: '900px',
          margin: '48px auto 0',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '24px',
          padding: '32px 24px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ color: '#34d399', marginBottom: '18px' }}>
          <Store size={54} style={{ margin: '0 auto' }} />
        </div>

        <h2 style={{ fontSize: '28px', margin: '0 0 12px' }}>
          {text.welcome}
        </h2>

        <p style={{ color: '#cbd5e1', fontSize: '16px' }}>
          {text.description}
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#064e3b',
            color: '#a7f3d0',
            padding: '10px 16px',
            borderRadius: '12px',
            marginTop: '18px'
          }}
        >
          <ShieldCheck size={20} />
          {text.status}
        </div>
      </section>

      <section
        style={{
          maxWidth: '900px',
          margin: '24px auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}
      >
        {[
          { label: text.products, icon: Package },
          { label: text.settings, icon: Settings },
          { label: text.admin, icon: ShieldCheck }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '24px 16px',
                textAlign: 'center'
              }}
            >
              <Icon
                size={30}
                color="#34d399"
                style={{ marginBottom: '12px' }}
              />
              <div style={{ fontWeight: 'bold' }}>{item.label}</div>
            </div>
          );
        })}
      </section>

      <footer
        style={{
          maxWidth: '900px',
          margin: '40px auto 0',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '13px'
        }}
      >
        ShopPro DZ © 2026
      </footer>
    </main>
  );
            }
