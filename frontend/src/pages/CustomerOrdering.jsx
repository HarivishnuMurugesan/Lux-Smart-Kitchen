
import { useMemo, useState } from "react";
import api from "../services/api";
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Clock,
  CheckCircle2,
  ArrowRight,
  X
} from "lucide-react";
import "../App.css";
const menuItems = [
  {
    id: 1,
    name: "Chicken Fried Rice",
    category: "Rice",
    price: 180,
    time: 20,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700",
    description: "Wok tossed rice with tender chicken and fresh vegetables",
    popular: true
  },
{
  id: 2,
  name: "Chicken Biryani",
  category: "Rice",
  price: 220,
  time: 25,
  image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=80",  
},
  {
    id: 3,
    name: "Chicken 65",
    category: "Starters",
    price: 150,
    time: 15,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=700",
    description: "Crispy spicy chicken with South Indian flavours"
  },
  {
    id: 4,
    name: "Paneer Butter Masala",
    category: "Main Course",
    price: 190,
    time: 20,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700",
    description: "Creamy tomato gravy with soft paneer cubes"
  },
  {
    id: 5,
    name: "Veg Fried Rice",
    category: "Rice",
    price: 140,
    time: 15,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=700",
    description: "Fresh vegetables tossed with seasoned rice"
  },
  {
    id: 6,
    name: "Butter Naan",
    category: "Breads",
    price: 45,
    time: 10,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700",
    description: "Soft Indian bread finished with butter"
  }
];

const categories = [
  "All",
  "Starters",
  "Rice",
  "Main Course",
  "Breads"
];

function App() {

  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [error, setError] = useState("");

  const filteredItems = menuItems.filter(item => {
    const matchesCategory =
      category === "All" || item.category === category;

    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  function addToCart(product) {
    setCart(previous => {
      const existing = previous.find(
        item => item.id === product.id
      );

      if (existing) {
        return previous.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart(previous =>
      previous
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  const estimatedTime = useMemo(() => {
    if (!cart.length) return 0;
    return Math.max(...cart.map(item => item.time));
  }, [cart]);

  async function placeOrder(event) {
    event.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Please add food items to your cart.");
      return;
    }

    setLoading(true);

    const orderNumber =
      "ORD" + Date.now().toString().slice(-8);

    const payload = {
      order_number: orderNumber,
      customer_name: customerName.trim(),
      table_number: Number(tableNumber),
      priority: "normal",
      status: "pending",
      estimated_preparation_time: estimatedTime,
      items: cart.map(item => ({
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price.toFixed(2)
      }))
    };

    try {
      const response = await api.post("orders/", payload);

      setSuccessOrder(response.data);
      setCart([]);
      setShowCheckout(false);
      setCustomerName("");
      setTableNumber("");

    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to place order. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">

      <header className="navbar">
        <a className="brand" href="#">
          <div className="brand-icon">
            <Utensils size={23} />
          </div>
          <div>
            <h2>Lux Smart Kitchen<span>Kitchen</span></h2>
            <small>FRESH FOOD. GOOD MOOD.</small>
          </div>
        </a>

        <div className="nav-right">
          <span className="open-status">
            <span className="status-dot"></span>
            Open for orders
          </span>

          <button
            className="cart-button"
            onClick={() => setShowCheckout(true)}
          >
            <ShoppingBag size={19} />
            My Cart
            <span className="cart-count">{totalItems}</span>
          </button>
        </div>
      </header>

      <main className="main-content">

        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">GOOD FOOD, GREAT MOMENTS</span>
            <h1>Made fresh.<br />
              Served with <span>love.</span>
            </h1>
            <p>
              Discover delicious food made with fresh ingredients
              and delivered straight to your table.
            </p>
            <a href="#menu" className="hero-link">
              Explore our menu <ArrowRight size={18} />
            </a>
          </div>
          <div className="hero-image"></div>
        </section>

        <section className="menu-section" id="menu">

          <div className="section-heading">
            <div>
              <span className="eyebrow">OUR MENU</span>
              <h2>Explore our dishes</h2>
              <p>Freshly prepared favourites, made just for you.</p>
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="category-list">
            {categories.map(item => (
              <button
                key={item}
                className={category === item ? "category active" : "category"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="food-grid">
            {filteredItems.map(item => (
              <article className="food-card" key={item.id}>
                <div className="food-image">
                  <img src={item.image} alt={item.name} />
                  {item.popular && (
                    <span className="popular-tag">POPULAR</span>
                  )}
                  <button
                    className="add-button"
                    onClick={() => addToCart(item)}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="food-info">
                  <span className="food-category">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>

                  <div className="food-footer">
                    <strong>₹{item.price}</strong>
                    <span><Clock size={14} /> {item.time} min</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <p className="empty-message">No dishes found.</p>
          )}

        </section>

        <section className="cart-summary">
          <div>
            <span className="eyebrow">YOUR SELECTION</span>
            <h2>{totalItems} items in your cart</h2>
            <p>Estimated preparation time: {estimatedTime} minutes</p>
          </div>

          <div className="summary-right">
            <strong>₹{totalAmount}</strong>
            <button
              disabled={!cart.length}
              onClick={() => setShowCheckout(true)}
            >
              Review order <ArrowRight size={17} />
            </button>
          </div>
        </section>

      </main>

      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <div>
                <span className="eyebrow">CHECKOUT</span>
                <h2>Your order</h2>
              </div>
              <button className="close-button" onClick={() => setShowCheckout(false)}>
                <X />
              </button>
            </div>

            {cart.map(item => (
              <div className="checkout-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>₹{item.price} each</span>
                </div>

                <div className="quantity-control">
                  <button onClick={() => changeQuantity(item.id, -1)}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.id, 1)}>
                    <Plus size={14} />
                  </button>
                </div>

                <strong>₹{item.price * item.quantity}</strong>
              </div>
            ))}

            <form onSubmit={placeOrder} className="checkout-form">

              <label>Customer name</label>
              <input
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Enter your name"
              />

              <label>Table number</label>
              <input
                required
                type="number"
                min="1"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                placeholder="Enter your table number"
              />

              <div className="total-row">
                <span>Total amount</span>
                <strong>₹{totalAmount}</strong>
              </div>

              {error && <p className="error-message">{error}</p>}

              <button
                className="place-order-button"
                type="submit"
                disabled={loading || !cart.length}
              >
                {loading ? "Placing order..." : "Place order · ₹" + totalAmount}
              </button>

              <p className="checkout-note">
                Your order will be saved to the restaurant system.
              </p>

            </form>
          </div>
        </div>
      )}

      {successOrder && (
        <div className="success-overlay">
          <div className="success-card">
            <CheckCircle2 size={55} color="#24976a" />
            <span className="eyebrow">ORDER CONFIRMED</span>
            <h2>Thank you, {successOrder.customer_name}!</h2>
            <p>Your order has been successfully placed.</p>
            <div className="order-number">
              {successOrder.order_number}
            </div>
            <p>Table number: {successOrder.table_number}</p>
            <button onClick={() => setSuccessOrder(null)}>
              Continue ordering
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <strong>Lux Smart Kitchen</strong>
        <span>Fresh food. Good mood.</span>
      </footer>

    </div>
  );
}

export default App;
