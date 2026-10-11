import { useEffect, useMemo, useState } from "react";
import { api, Invoice, Product } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { AdminDashboard } from "./AdminDashboard";

type View = "pos" | "invoices" | "admin";
const money = (value: string | number) => `${Number(value).toLocaleString("vi-VN")} đ`;

export function POS() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<View>("pos");
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.products(search).then(setProducts).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, [search]);
  useEffect(() => {
    if (view === "invoices") api.myInvoices().then(setInvoices).catch((error) => setMessage(error.message));
  }, [view]);

  const cartLines = Object.entries(cart).map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity })).filter((line): line is { product: Product; quantity: number } => Boolean(line.product));
  const total = useMemo(() => cartLines.reduce((sum, line) => sum + Number(line.product.salePrice) * line.quantity, 0), [cartLines]);
  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  function changeQuantity(product: Product, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[product.id];
      else next[product.id] = Math.min(product.stock, quantity);
      return next;
    });
  }
  async function checkout(paymentMethod: "CASH" | "CARD") {
    if (!itemCount) return;
    try {
      setLoading(true);
      await api.invoice(cartLines.map((line) => ({ productId: line.product.id, quantity: line.quantity })), paymentMethod);
      setCart({});
      setMessage("Thanh toán thành công. Hóa đơn đã được ghi nhận.");
      setProducts(await api.products(search));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Thanh toán thất bại"); }
    finally { setLoading(false); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">S</span><div><strong>Supermart</strong><small>Quản lý cửa hàng</small></div></div>
      <nav className="side-nav">
        <button className={view === "pos" ? "active" : ""} onClick={() => setView("pos")}><span>▦</span> Bán hàng</button>
        <button className={view === "invoices" ? "active" : ""} onClick={() => setView("invoices")}><span>▤</span> Hóa đơn</button>
        {user?.role === "ADMIN" && <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}><span>◈</span> Quản trị</button>}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><strong>Cần hỗ trợ?</strong><span>Kiểm tra tài liệu hướng dẫn</span></div><button className="logout-link" onClick={logout}>↪ <span>Đăng xuất</span></button></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark">S</span><strong>Supermart</strong></div><div className="topbar-actions"><button className="icon-button">◔</button><div className="user-menu"><span className="avatar">{user?.name.slice(0, 1).toUpperCase()}</span><div><strong>{user?.name}</strong><small>{user?.role === "ADMIN" ? "Quản trị viên" : "Nhân viên bán hàng"}</small></div><span className="chevron">⌄</span></div></div></header>
      <main className="content">
        {view === "admin" && user?.role === "ADMIN" ? <AdminDashboard /> : view === "invoices" ? <InvoiceHistory invoices={invoices} /> : <section className="pos-page">
          <div className="page-heading"><div><span className="eyebrow">ĐIỂM BÁN HÀNG</span><h1>Bán hàng</h1><p>Chọn sản phẩm để bắt đầu tạo hóa đơn mới.</p></div><span className="live-status"><i /> Hệ thống đang hoạt động</span></div>
          {message && <div className="toast">{message}<button onClick={() => setMessage("")}>×</button></div>}
          <div className="pos-layout"><section className="catalog-panel"><div className="catalog-toolbar"><div className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên sản phẩm hoặc mã SKU..." /><kbd>⌘ K</kbd></div><button className="filter-button">☷ Bộ lọc</button></div><div className="section-row"><h2>Sản phẩm</h2><span>{products.length} sản phẩm</span></div>{loading ? <div className="empty-state">Đang tải sản phẩm...</div> : products.length === 0 ? <div className="empty-state"><strong>Không tìm thấy sản phẩm</strong><span>Thử tìm kiếm bằng từ khóa khác.</span></div> : <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} quantity={cart[product.id] ?? 0} onAdd={() => changeQuantity(product, (cart[product.id] ?? 0) + 1)} />)}</div>}</section><CartPanel lines={cartLines} total={total} onChange={changeQuantity} onCheckout={checkout} loading={loading} /></div>
        </section>}
      </main>
    </div>
  </div>;
}

function ProductCard({ product, quantity, onAdd }: { product: Product; quantity: number; onAdd: () => void }) {
  const low = product.stock <= 10;
  return <article className="product-card"><div className="product-image">{product.name.slice(0, 1).toUpperCase()}</div><div className="product-card-body"><div className="product-meta"><span className="sku">{product.sku}</span>{low && <span className="stock-warning">Sắp hết</span>}</div><h3>{product.name}</h3><p className="unit-label">Đơn vị: {product.unit} · Còn {product.stock}</p><div className="product-footer"><strong>{Number(product.salePrice).toLocaleString("vi-VN")} đ</strong><button disabled={!product.stock} className={quantity ? "added" : ""} onClick={onAdd}>{quantity ? `Đã thêm ${quantity}` : "Thêm vào giỏ"}</button></div></div></article>;
}

function CartPanel({ lines, total, onChange, onCheckout, loading }: { lines: { product: Product; quantity: number }[]; total: number; onChange: (product: Product, quantity: number) => void; onCheckout: (method: "CASH" | "CARD") => void; loading: boolean }) {
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  return <aside className="cart-panel"><div className="cart-heading"><div><h2>Hóa đơn mới</h2><span>{count} sản phẩm</span></div><span className="receipt-icon">▤</span></div>{lines.length === 0 ? <div className="cart-empty"><div>🛒</div><strong>Giỏ hàng đang trống</strong><span>Chọn sản phẩm bên trái<br />để thêm vào hóa đơn</span></div> : <div className="cart-lines">{lines.map((line) => <div className="cart-line" key={line.product.id}><div className="line-info"><strong>{line.product.name}</strong><span>{money(line.product.salePrice)}</span></div><div className="quantity-control"><button onClick={() => onChange(line.product, line.quantity - 1)}>−</button><span>{line.quantity}</span><button onClick={() => onChange(line.product, line.quantity + 1)}>+</button></div><strong>{money(Number(line.product.salePrice) * line.quantity)}</strong></div>)}</div>}<div className="cart-summary"><div><span>Tạm tính</span><strong>{money(total)}</strong></div><div><span>Giảm giá</span><strong>0 đ</strong></div><div className="total-row"><span>Tổng thanh toán</span><strong>{money(total)}</strong></div></div><div className="payment-actions"><button disabled={!lines.length || loading} onClick={() => onCheckout("CASH")}><span>▣</span> Tiền mặt</button><button disabled={!lines.length || loading} onClick={() => onCheckout("CARD")}><span>▤</span> Thẻ ngân hàng</button></div></aside>;
}

function InvoiceHistory({ invoices }: { invoices: Invoice[] }) {
  return <section className="page-section"><div className="page-heading"><div><span className="eyebrow">GIAO DỊCH</span><h1>Hóa đơn của tôi</h1><p>Lịch sử các giao dịch do bạn thực hiện.</p></div></div><div className="data-card"><div className="table-header"><h2>Danh sách hóa đơn</h2><span>{invoices.length} hóa đơn</span></div><div className="table-wrap"><table><thead><tr><th>Mã hóa đơn</th><th>Thời gian</th><th>Thanh toán</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>{invoices.length ? invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.code}</strong></td><td>{new Date(invoice.createdAt).toLocaleString("vi-VN")}</td><td>{invoice.paymentMethod === "CASH" ? "Tiền mặt" : "Thẻ ngân hàng"}</td><td><strong>{money(invoice.total)}</strong></td><td><span className={`status ${invoice.status === "COMPLETED" ? "success" : "danger"}`}>{invoice.status === "COMPLETED" ? "Hoàn tất" : "Đã hủy"}</span></td></tr>) : <tr><td colSpan={5} className="table-empty">Chưa có hóa đơn nào.</td></tr>}</tbody></table></div></div></section>;
}
