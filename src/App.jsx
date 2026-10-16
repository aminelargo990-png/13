import { useEffect, useState } from "react";
import {
  Store,
  Package,
  Settings,
  Globe,
  ShieldCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  LogOut,
  ArrowLeft,
  Save,
  X,
  LoaderCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "./supabase";

const translations = {
  fr: {
    app: "ShopPro DZ",
    welcome: "Bienvenue",
    subtitle: "Gérez votre boutique simplement.",
    login: "Connexion",
    register: "Créer un compte",
    shopName: "Nom de la boutique",
    phone: "Numéro de téléphone",
    password: "Mot de passe",
    products: "Produits",
    settings: "Paramètres",
    admin: "Administration",
    logout: "Déconnexion",
    add: "Ajouter un produit",
    edit: "Modifier",
    delete: "Supprimer",
    name: "Nom du produit",
    price: "Prix (DA)",
    barcode: "Code-barres",
    search: "Rechercher un produit...",
    save: "Enregistrer",
    cancel: "Annuler",
    back: "Retour",
    empty: "Aucun produit pour le moment.",
    loading: "Chargement...",
    error: "Une erreur est survenue.",
    invalid: "Veuillez remplir tous les champs.",
    confirmDelete: "Supprimer ce produit ?",
    dashboard: "Tableau de bord",
    total: "Total des produits",
    noShop: "Boutique introuvable.",
    accountExists: "Ce numéro est peut-être déjà utilisé.",
    image: "Image du produit",
    language: "العربية",
    upload: "Choisir une image",
    saveError: "Impossible d'enregistrer. Vérifiez les permissions Supabase.",
    loginError: "Connexion impossible. Vérifiez vos informations.",
    setupError: "Vérifiez le fichier supabase.js et les tables Supabase.",
    welcomeShop: "Votre espace commerçant",
    newProduct: "Nouveau produit",
    productSaved: "Produit enregistré.",
    deleted: "Produit supprimé.",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
  },
  ar: {
    app: "ShopPro DZ",
    welcome: "مرحبًا بك",
    subtitle: "أدر متجرك بسهولة.",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    shopName: "اسم المتجر",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    products: "المنتجات",
    settings: "الإعدادات",
    admin: "الإدارة",
    logout: "تسجيل الخروج",
    add: "إضافة منتج",
    edit: "تعديل",
    delete: "حذف",
    name: "اسم المنتج",
    price: "السعر (دج)",
    barcode: "الباركود",
    search: "ابحث عن منتج...",
    save: "حفظ",
    cancel: "إلغاء",
    back: "رجوع",
    empty: "لا توجد منتجات حاليًا.",
    loading: "جارٍ التحميل...",
    error: "حدث خطأ.",
    invalid: "يرجى ملء جميع الخانات.",
    confirmDelete: "هل تريد حذف هذا المنتج؟",
    dashboard: "لوحة التحكم",
    total: "عدد المنتجات",
    noShop: "المتجر غير موجود.",
    accountExists: "قد يكون رقم الهاتف مستخدمًا من قبل.",
    image: "صورة المنتج",
    language: "Français",
    upload: "اختر صورة",
    saveError: "تعذر الحفظ. تحقق من صلاحيات Supabase.",
    loginError: "تعذر تسجيل الدخول. تحقق من المعلومات.",
    setupError: "تحقق من ملف supabase.js وجداول Supabase.",
    welcomeShop: "مساحة التاجر",
    newProduct: "منتج جديد",
    productSaved: "تم حفظ المنتج.",
    deleted: "تم حذف المنتج.",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
};

export default function App() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("shoppro_lang") || "fr"
  );
  const [session, setSession] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sortAZ, setSortAZ] = useState(false);
  const [editing, setEditing] = useState(null);

  const [authForm, setAuthForm] = useState({
    shop_name: "",
    phone: "",
    password: "",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    barcode: "",
    image: null,
    oldPhotoPath: "",
  });

  const t = translations[language];
  const isArabic = language === "ar";

  useEffect(() => {
    localStorage.setItem("shoppro_lang", language);
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [language, isArabic]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setMessage(t.setupError);
        return;
      }

      setSession(data.session || null);

      if (data.session?.user) {
        await loadMerchant(data.session.user.id);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

      setSession(newSession);

      if (!newSession) {
        setMerchant(null);
        setProducts([]);
        setPage("home");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // Initial session restoration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMerchant(userId) {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("merchants")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setMerchant(null);
        setMessage(t.noShop);
        return;
      }

      setMerchant(data);
      await loadProducts(userId);
    } catch (error) {
      console.error(error);
      setMessage(t.setupError);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts(merchantId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setProducts(data || []);
  }

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    const phone = authForm.phone.trim();
    const password = authForm.password;

    if (!phone || !password) {
      setMessage(t.invalid);
      return;
    }

    if (authMode === "register" && !authForm.shop_name.trim()) {
      setMessage(t.invalid);
      return;
    }

    setLoading(true);

    try {
      /*
       * Supabase Auth requires a supported identity.
       * This version converts the phone number into a synthetic email.
       * It does not send SMS verification.
       *
       * Use a consistent, valid email domain owned by your project
       * for production, or implement phone OTP through Supabase Auth.
       */
      const normalizedPhone = phone.replace(/\s+/g, "");
      const authEmail = `${normalizedPhone.replace(/[^0-9+]/g, "")}@shoppro-dz.invalid`;

      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              shop_name: authForm.shop_name.trim(),
              phone: normalizedPhone,
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "Compte créé. Vérifiez les paramètres de confirmation Supabase Auth avant de vous connecter."
          );
          return;
        }

        const userId = data.user.id;

        const { error: profileError } = await supabase
          .from("merchants")
          .insert({
            id: userId,
            shop_name: authForm.shop_name.trim(),
            phone: normalizedPhone,
          });

        if (profileError) throw profileError;

        await loadMerchant(userId);
        setPage("dashboard");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

        if (error) throw error;

        if (data.user) {
          await loadMerchant(data.user.id);
          setPage("dashboard");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage(
        authMode === "register" ? t.accountExists : t.loginError
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      setMessage(t.error);
      return;
    }

    setSession(null);
    setMerchant(null);
    setProducts([]);
    setPage("home");
    setMessage("");
    setAuthForm({ shop_name: "", phone: "", password: "" });
  }

  function openNewProduct() {
    setEditing(null);
    setProductForm({
      name: "",
      price: "",
      barcode: "",
      image: null,
      oldPhotoPath: "",
    });
    setMessage("");
    setPage("product-form");
  }

  function openEditProduct(product) {
    setEditing(product);
    setProductForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      barcode: product.barcode || "",
      image: null,
      oldPhotoPath: product.photo_path || "",
    });
    setMessage("");
    setPage("product-form");
  }

  async function handleProductSave(event) {
    event.preventDefault();
    setMessage("");

    if (!merchant) {
      setMessage(t.noShop);
      return;
    }

    const name = productForm.name.trim();
    const price = Number(productForm.price);

    if (!name || productForm.price === "" || !Number.isFinite(price) || price < 0) {
      setMessage(t.invalid);
      return;
    }

    if (!editing && products.length >= 50 && !merchant.unlimited_product) {
      setMessage(
        isArabic
          ? "وصلت إلى الحد المجاني البالغ 50 منتجًا. تواصل مع الإدارة للتفعيل."
          : "Limite gratuite de 50 produits atteinte. Contactez l'administration."
      );
      return;
    }

    setLoading(true);

    try {
      let photoPath = productForm.oldPhotoPath || null;

      if (productForm.image) {
        const file = productForm.image;
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${merchant.id}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        photoPath = path;
      }

      const payload = {
        merchant_id: merchant.id,
        name,
        price,
        barcode: productForm.barcode.trim() || null,
        photo_path: photoPath,
      };

      if (editing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editing.id)
          .eq("merchant_id", merchant.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);

        if (error) throw error;
      }

      // Remove the previous image only after a successful update.
      if (
        editing &&
        productForm.image &&
        editing.photo_path &&
        editing.photo_path !== photoPath
      ) {
        const { error: removeError } = await supabase.storage
          .from("product-images")
          .remove([editing.photo_path]);

        if (removeError) console.warn(removeError);
      }

      await loadProducts(merchant.id);
      setPage("products");
      setMessage(t.productSaved);
    } catch (error) {
      console.error(error);
      setMessage(t.saveError);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(t.confirmDelete)) return;
    if (!merchant) return;

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .eq("merchant_id", merchant.id);

      if (error) throw error;

      if (product.photo_path) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove([product.photo_path]);

        if (storageError) console.warn(storageError);
      }

      await loadProducts(merchant.id);
      setMessage(t.deleted);
    } catch (error) {
      console.error(error);
      setMessage(t.error);
    } finally {
      setLoading(false);
    }
  }

  function productImageUrl(path) {
    if (!path) return "";

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  const visibleProducts = [...products]
    .filter((product) => {
      const term = search.toLowerCase();
      return (
        (product.name || "").toLowerCase().includes(term) ||
        (product.barcode || "").toLowerCase().includes(term)
      );
    })
    .sort((a, b) =>
      sortAZ ? (a.name || "").localeCompare(b.name || "") : 0
    );

  const cardStyle = {
    background: "rgba(15, 31, 57, 0.92)",
    border: "1px solid rgba(148,163,184,.17)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 12px 28px rgba(0,0,0,.12)",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#0b1729",
    color: "#f8fafc",
    outline: "none",
    marginTop: 7,
  };

  const buttonStyle = {
    border: 0,
    borderRadius: 12,
    padding: "12px 16px",
    background: "#10b981",
    color: "#052e25",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  function button(label, onClick, icon = null, secondary = false) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...buttonStyle,
          background: secondary ? "#23334a" : "#10b981",
          color: secondary ? "#e2e8f0" : "#052e25",
        }}
      >
        {icon}
        {label}
      </button>
    );
  }

  function field(label, value, onChange, type = "text", extra = {}) {
    return (
      <label style={{ display: "block", marginBottom: 15, color: "#cbd5e1" }}>
        {label}
        <input
          style={inputStyle}
          value={value}
          type={type}
          onChange={(event) => onChange(event.target.value)}
          {...extra}
        />
      </label>
    );
  }

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #18365a 0%, #081322 48%, #050b14 100%)",
        color: "#f8fafc",
        fontFamily: "system-ui, sans-serif",
        padding: "0 16px 40px",
      }}
    >
      <header
        style={{
          maxWidth: 1050,
          margin: "0 auto",
          minHeight: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1px solid #26364b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "#10b981",
              color: "#052e25",
            }}
          >
            <Store size={23} />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 900 }}>{t.app}</div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>
              Gestion de boutique
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {button(t.language, () => setLanguage(isArabic ? "fr" : "ar"), <Globe size={17} />, true)}
          {session &&
            button(t.logout, handleLogout, <LogOut size={17} />, true)}
        </div>
      </header>

      <main style={{ maxWidth: 1050, margin: "28px auto 0" }}>
        {message && (
          <div
            role="status"
            style={{
              background: "#172c40",
              border: "1px solid #34516b",
              color: "#dbeafe",
              borderRadius: 12,
              padding: 13,
              marginBottom: 18,
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </div>
        )}

        {loading && (
          <div style={{ color: "#94a3b8", marginBottom: 15 }}>
            <LoaderCircle
              size={16}
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            {t.loading}
          </div>
        )}

        {!session && (
          <section
            style={{
              maxWidth: 470,
              margin: "42px auto",
              ...cardStyle,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 25 }}>
              <div
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 66,
                  height: 66,
                  borderRadius: 20,
                  background: "rgba(16,185,129,.14)",
                  color: "#34d399",
                }}
              >
                <ShoppingBagIcon />
              </div>
              <h1 style={{ fontSize: 28, marginBottom: 6 }}>{t.welcome}</h1>
              <p style={{ color: "#94a3b8", marginTop: 0 }}>{t.subtitle}</p>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {button(t.login, () => {
                setAuthMode("login");
                setMessage("");
              }, null, authMode !== "login")}
              {button(t.register, () => {
                setAuthMode("register");
                setMessage("");
              }, null, authMode !== "register")}
            </div>

            <form onSubmit={handleAuth}>
              {authMode === "register" &&
                field(
                  t.shopName,
                  authForm.shop_name,
                  (value) =>
                    setAuthForm((old) => ({ ...old, shop_name: value }))
                )}

              {field(t.phone, authForm.phone, (value) =>
                setAuthForm((old) => ({ ...old, phone: value }))
              )}

              <label style={{ display: "block", color: "#cbd5e1" }}>
                {t.password}
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputStyle, paddingInlineEnd: 48 }}
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      authMode === "register" ? "new-password" : "current-password"
                    }
                    value={authForm.password}
                    onChange={(event) =>
                      setAuthForm((old) => ({
                        ...old,
                        password: event.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? t.hidePassword : t.showPassword
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    style={{
                      position: "absolute",
                      insetInlineEnd: 10,
                      top: 15,
                      background: "transparent",
                      color: "#94a3b8",
                      border: 0,
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>

              <button
                disabled={loading}
                style={{ ...buttonStyle, width: "100%", marginTop: 22 }}
              >
                {authMode === "register" ? t.register : t.login}
              </button>

              <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.7 }}>
                {isArabic
                  ? "ملاحظة: تسجيل الهاتف هنا يستخدم هوية داخلية عبر البريد الاصطناعي ولا يرسل رمز SMS. يجب إعداد مصادقة Supabase وسياسات الأمان قبل الاستخدام الفعلي."
                  : "Note : cette connexion ne vérifie pas le numéro par SMS. Configurez l'authentification et les politiques de sécurité Supabase avant une utilisation réelle."}
              </p>
            </form>
          </section>
        )}

        {session && merchant && (
          <>
            <section style={{ ...cardStyle, marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p style={{ color: "#34d399", margin: "0 0 8px" }}>
                    {t.welcomeShop}
                  </p>
                  <h1 style={{ margin: 0, fontSize: 27 }}>
                    {merchant.shop_name}
                  </h1>
                  <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                    {merchant.phone}
                  </p>
                </div>
                <div
                  style={{
                    padding: "15px 18px",
                    borderRadius: 15,
                    background: "#0a1a2c",
                    minWidth: 115,
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>
                    {t.total}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 900 }}>
                    {products.length}
                  </div>
                </div>
              </div>
            </section>

            <nav
              style={{
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              {button(t.dashboard, () => setPage("dashboard"), <Store size={17} />, page !== "dashboard")}
              {button(t.products, () => setPage("products"), <Package size={17} />, page !== "products")}
              {button(t.settings, () => setPage("settings"), <Settings size={17} />, page !== "settings")}
            </nav>

            {page === "dashboard" && (
              <section style={cardStyle}>
                <h2>{t.dashboard}</h2>
                <p style={{ color: "#94a3b8" }}>{t.subtitle}</p>
                {button(t.products, () => setPage("products"), <Package size={18} />)}
              </section>
            )}

            {page === "products" && (
              <section style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  <h2 style={{ margin: 0 }}>{t.products}</h2>
                  {button(t.add, openNewProduct, <Plus size={18} />)}
                </div>

                <input
                  style={inputStyle}
                  placeholder={t.search}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <div style={{ margin: "12px 0" }}>
                  {button(
                    sortAZ ? "A–Z ✓" : "A–Z",
                    () => setSortAZ((value) => !value),
                    <Search size={16} />,
                    true
                  )}
                </div>

                {visibleProducts.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>{t.empty}</p>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {visibleProducts.map((product) => (
                      <article
                        key={product.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 13,
                          flexWrap: "wrap",
                          background: "#0b1729",
                          padding: 13,
                          borderRadius: 14,
                          border: "1px solid #23334a",
                        }}
                      >
                        {product.photo_path ? (
                          <img
                            src={productImageUrl(product.photo_path)}
                            alt={product.name}
                            style={{
                              width: 68,
                              height: 68,
                              borderRadius: 10,
                              objectFit: "cover",
                              background: "#172c40",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 68,
                              height: 68,
                              borderRadius: 10,
                              background: "#172c40",
                              display: "grid",
                              placeItems: "center",
                              color: "#34d399",
                            }}
                          >
                            <Package size={25} />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 130 }}>
                          <strong>{product.name}</strong>
                          <div
                            style={{
                              color: "#34d399",
                              marginTop: 5,
                              fontWeight: 800,
                            }}
                          >
                            {Number(product.price).toLocaleString()} DA
                          </div>
                          {product.barcode && (
                            <div
                              style={{
                                color: "#94a3b8",
                                fontSize: 12,
                                marginTop: 3,
                              }}
                            >
                              {product.barcode}
                            </div>
                          )}
                        </div>

                        {button(t.edit, () => openEditProduct(product), <Pencil size={16} />, true)}
                        {button(t.delete, () => deleteProduct(product), <Trash2 size={16} />, true)}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {page === "product-form" && (
              <section style={{ ...cardStyle, maxWidth: 600 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2>{editing ? t.edit : t.newProduct}</h2>
                  {button(t.back, () => setPage("products"), <ArrowLeft size={17} />, true)}
                </div>

                <form onSubmit={handleProductSave}>
                  {field(t.name, productForm.name, (value) =>
                    setProductForm((old) => ({ ...old, name: value }))
                  )}

                  {field(t.price, productForm.price, (value) =>
                    setProductForm((old) => ({ ...old, price: value }))
                  , "number", { min: "0", step: "0.01" })}

                  {field(t.barcode, productForm.barcode, (value) =>
                    setProductForm((old) => ({ ...old, barcode: value }))
                  )}

                  <label style={{ display: "block", color: "#cbd5e1" }}>
                    {t.image}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ ...inputStyle, padding: 10 }}
                      onChange={(event) =>
                        setProductForm((old) => ({
                          ...old,
                          image: event.target.files?.[0] || null,
                        }))
                      }
                    />
                  </label>

                  {productForm.image && (
                    <img
                      src={URL.createObjectURL(productForm.image)}
                      alt="Preview"
                      style={{
                        display: "block",
                        width: 140,
                        height: 140,
                        objectFit: "cover",
                        borderRadius: 12,
                        marginTop: 12,
                      }}
                    />
                  )}

                  {button(t.save, () => {}, <Save size={17} />) && null}
                  <button
                    disabled={loading}
                    style={{ ...buttonStyle, width: "100%", marginTop: 20 }}
                  >
                    <Save size={17} /> {t.save}
                  </button>
                </form>
              </section>
            )}

            {page === "settings" && (
              <section style={cardStyle}>
                <h2>{t.settings}</h2>
                <p style={{ color: "#94a3b8" }}>
                  {t.shopName}: {merchant.shop_name}
                </p>
                <p style={{ color: "#94a3b8" }}>
                  {t.phone}: {merchant.phone}
                </p>
                <p style={{ color: "#94a3b8" }}>
                  {isArabic
                    ? "حد المنتجات المجاني: 50 منتجًا."
                    : "Limite gratuite : 50 produits."}
                </p>
                {button(t.back, () => setPage("dashboard"), <ArrowLeft size={17} />, true)}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ShoppingBagIcon() {
  return <Store size={31} />;
}
