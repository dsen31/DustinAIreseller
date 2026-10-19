import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Layers,
  FileText,
  Folder,
  Search,
  Check,
  X,
  Laptop,
  Shield,
  Wifi,
  ChevronRight,
  Download,
  Trash2,
} from "lucide-react";
import "./style.css";
type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: number;
  margin: number;
  retail: number;
  tag: string;
};
type Quote = {
  id: string;
  product: Product;
  quantity: number;
  project: string;
};
const products: Product[] = [
  {
    id: "thinkpad",
    name: "ThinkPad T14 Gen 5",
    category: "Devices",
    description:
      "A dependable daily driver. Intel Core Ultra 5 · 16 GB RAM · 512 GB SSD",
    cost: 980,
    margin: 98,
    retail: 1299,
    tag: "Best for everyday work",
  },
  {
    id: "elitebook",
    name: "HP EliteBook 840",
    category: "Devices",
    description:
      "Made for your mobile team. Intel Core Ultra 7 · 16 GB RAM · 512 GB SSD",
    cost: 1150,
    margin: 115,
    retail: 1499,
    tag: "Our balanced pick",
  },
  {
    id: "macbook",
    name: "MacBook Pro 14-inch",
    category: "Devices",
    description:
      "Extra headroom for creative work. M4 · 16 GB RAM · 512 GB SSD",
    cost: 1390,
    margin: 139,
    retail: 1599,
    tag: "For demanding workflows",
  },
  {
    id: "security",
    name: "Endpoint protection",
    category: "Security",
    description:
      "Device protection, threat detection, and centralized policies. Per user / year.",
    cost: 48,
    margin: 4.8,
    retail: 72,
    tag: "Protect every endpoint",
  },
  {
    id: "network",
    name: "Cloud-managed Wi-Fi",
    category: "Networking",
    description:
      "A business access point with simple management and reliable coverage.",
    cost: 210,
    margin: 21,
    retail: 299,
    tag: "Keep your team connected",
  },
];
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const [tab, setTab] = useState("Overview");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>(() => read("nxt.quotes", []));
  const [projects, setProjects] = useState<string[]>(() =>
    read("nxt.projects", []),
  );
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState(10);
  const [project, setProject] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectModal, setProjectModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!selected && !projectModal) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>("[role=dialog]");
    const controls = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, [tabindex="0"]',
        ) ?? [],
      );
    controls()
      .find((el) => el.tagName === "INPUT")
      ?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setProjectModal(false);
      }
      if (e.key === "Tab") {
        const items = controls();
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [selected, projectModal]);
  const notify = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 3500);
  };
  const saveQuotes = (v: Quote[]) => {
    setQuotes(v);
    localStorage.setItem("nxt.quotes", JSON.stringify(v));
  };
  function ask(text = prompt) {
    if (!text.trim()) return;
    setTab("Advisor");
    setMessages((m) => [
      ...m,
      { role: "you", text },
      {
        role: "advisor",
        text: /secur|protect/i.test(text)
          ? "Start with endpoint protection for every device. Our example plan shows the supplier cost and a 10% service margin. Compare the Security category, then adjust the quantity to your team size."
          : /network|wifi|wi-fi/i.test(text)
            ? "Start with your office size and number of connected devices. The example cloud-managed Wi-Fi option is a starting point; a site survey would confirm coverage. Compare Networking to explore its price."
            : "For a team refresh, balance everyday performance, portability, and support. Compare the ThinkPad for value, EliteBook for mobility, and MacBook Pro for creative workloads. What is your team size and budget per person?",
      },
    ]);
    setPrompt("");
  }
  function exportQuotes() {
    const rows = [
      [
        "Quote",
        "Product",
        "Quantity",
        "Project",
        "Supplier cost",
        "Service margin",
        "Total",
      ],
      ...quotes.map((q) => [
        q.id,
        q.product.name,
        q.quantity,
        q.project,
        q.product.cost * q.quantity,
        q.product.margin * q.quantity,
        (q.product.cost + q.product.margin) * q.quantity,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "nxt-quotes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  const total = quotes.reduce(
    (n, q) => n + (q.product.cost + q.product.margin) * q.quantity,
    0,
  );
  const nav = [
    ["Overview", LayoutDashboard],
    ["Advisor", MessageSquare],
    ["Compare", Layers],
    ["Quotes", FileText],
    ["Projects", Folder],
  ] as const;
  const catalog = (
    <>
      <div className="filters">
        <div>
          {["All", "Devices", "Security", "Networking"].map((f) => (
            <button
              className={filter === f ? "chip active" : "chip"}
              onClick={() => setFilter(f)}
              key={f}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Search products"
            placeholder="Find a product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="products">
        {products
          .filter(
            (p) =>
              (filter === "All" || p.category === filter) &&
              `${p.name} ${p.description}`
                .toLowerCase()
                .includes(search.toLowerCase()),
          )
          .map((p, i) => (
            <article className="product" key={p.id}>
              <div className={"product-art art-" + i}>
                {p.category === "Devices" ? (
                  <Laptop />
                ) : p.category === "Security" ? (
                  <Shield />
                ) : (
                  <Wifi />
                )}
                <span>{p.category}</span>
              </div>
              <div className="product-body">
                <span className="eyebrow">{p.tag}</span>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="price-line">
                  <span>Supplier cost</span>
                  <b>{money(p.cost)}</b>
                </div>
                <div className="price-line">
                  <span>Our service · 10%</span>
                  <b>{money(p.margin)}</b>
                </div>
                <div className="price-line final">
                  <span>Your price</span>
                  <strong>{money(p.cost + p.margin)}</strong>
                </div>
                <button
                  className="outline full"
                  onClick={() => {
                    setSelected(p);
                    setQty(10);
                  }}
                >
                  Build a quote <ArrowUpRight size={16} />
                </button>
              </div>
            </article>
          ))}
      </div>
      {!products.some(
        (p) =>
          (filter === "All" || p.category === filter) &&
          `${p.name} ${p.description}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ) && (
        <div className="empty">No products found. Try a different search.</div>
      )}
    </>
  );
  return (
    <div className="shell">
      <aside>
        <a className="brand" href="#" onClick={() => setTab("Overview")}>
          <span>
            <strong>NXT</strong>
            <span className="brand-divider">/</span>Technology procurement
          </span>
        </a>
        <nav>
          {nav.map(([name, Icon]) => (
            <button
              key={name}
              aria-current={tab === name ? "page" : undefined}
              className={tab === name ? "nav-item current" : "nav-item"}
              onClick={() => setTab(name)}
            >
              <Icon size={18} />
              {name}
              {name === "Quotes" && (
                <span className="count">{quotes.length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>
      <main className={tab === "Overview" ? "view-overview" : "view-inner"}>
        <header>
          <span>
            Workspace <ChevronRight size={13} /> <b>{tab}</b>
          </span>
          <span className="demo">
            <i />
            Interactive demo
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">NXT / TECHNOLOGY ADVISORY</span>
              <h1>
                {tab === "Overview"
                  ? "Technology for your business."
                  : tab === "Advisor"
                    ? "Tell us what you need."
                    : tab === "Compare"
                      ? "Compare technology."
                      : tab === "Quotes"
                        ? "Your quotes."
                        : "Your projects."}
              </h1>
              <p>
                {tab === "Overview"
                  ? "Compare products, understand the cost, and plan your next purchase."
                  : tab === "Advisor"
                    ? "Describe your requirements. BoBo can help you consider the options."
                    : tab === "Compare"
                      ? "Explore example products and see exactly how the price adds up."
                      : tab === "Quotes"
                        ? "Build, organize, and export your technology estimates."
                        : "Bring your technology plans and quotes together."}
              </p>
            </div>
            {tab === "Projects" ? (
              <button className="primary" onClick={() => setProjectModal(true)}>
                <Plus size={16} />
                New project
              </button>
            ) : (
              <button
                className="outline"
                onClick={() => {
                  setTab("Compare");
                  setFilter("All");
                }}
              >
                Explore products <ArrowUpRight size={16} />
              </button>
            )}
          </div>
          {tab === "Overview" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <p className="eyebrow">TECHNOLOGY ADVISORY & PROCUREMENT</p>
                  <h1>
                    Technology buying.
                    <br className="desktop-break" /> Transparent pricing.
                  </h1>
                  <p className="hero-intro">
                    Compare technology for your team. See supplier costs and our
                    margin before you build a quote.
                  </p>
                  <div className="hero-links">
                    <button onClick={() => setTab("Compare")}>
                      Explore products <ArrowUpRight size={16} />
                    </button>
                    <button onClick={() => setTab("Advisor")}>
                      Talk to BoBo <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </section>
              <section className="stats">
                <div>
                  <span>
                    YOUR QUOTES <FileText size={17} />
                  </span>
                  <strong>{quotes.length.toString().padStart(2, "0")}</strong>
                  <small>Saved in this browser</small>
                </div>
                <div>
                  <span>
                    PLANNED INVESTMENT <Layers size={17} />
                  </span>
                  <strong>{money(total)}</strong>
                  <small>Across your saved estimates</small>
                </div>
                <div>
                  <span>
                    ACTIVE PROJECTS <Folder size={17} />
                  </span>
                  <strong>{projects.length.toString().padStart(2, "0")}</strong>
                  <small>Plans in progress</small>
                </div>
              </section>
              <div className="section-heading">
                <div>
                  <h2>What does your business need?</h2>
                  <p>Choose a starting point for your next purchase.</p>
                </div>
                <span>01 — EXPLORE</span>
              </div>
              <div className="starters">
                {[
                  [
                    "Refresh our laptops",
                    "Compare devices for your team.",
                    Laptop,
                  ],
                  ["Protect our team", "Explore endpoint protection.", Shield],
                  ["Connect our office", "Plan your office network.", Wifi],
                ].map(([title, desc, Icon]) => (
                  <button
                    key={String(title)}
                    onClick={() => ask(String(title))}
                  >
                    <span className="starter-image" aria-hidden="true" />
                    <h3>{String(title)}</h3>
                    <p>{String(desc)}</p>
                    <ArrowUpRight className="corner" size={18} />
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === "Compare" && catalog}
          {tab === "Advisor" && (
            <div className="advisor">
              <div className="advisor-intro">
                <span className="bobo">BoBo / Technology advisor</span>
                <h2>What are you looking for?</h2>
                <p>What are you planning for your team?</p>
                <small>
                  Demo advisor · rule-based guidance, not a live AI connection.
                </small>
              </div>
              <div className="messages" aria-live="polite">
                {messages.map((m, i) => (
                  <div className={"message " + m.role} key={i}>
                    <b>{m.role === "you" ? "You" : "BoBo"}</b>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              {!messages.length && (
                <div className="suggestions">
                  {[
                    "I need laptops for 20 people",
                    "Help me improve our security",
                    "We’re opening a new office",
                  ].map((s) => (
                    <button className="outline" onClick={() => ask(s)} key={s}>
                      {s}
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
              )}
              <form
                className="composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  ask();
                }}
              >
                <input
                  aria-label="Message BoBo"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell BoBo what you have in mind…"
                />
                <button
                  className="primary"
                  disabled={!prompt.trim()}
                  aria-label="Send message"
                >
                  <ArrowRight size={20} />
                </button>
              </form>
              <button className="text-button" onClick={() => setTab("Compare")}>
                Compare example recommendations <ArrowRight size={15} />
              </button>
            </div>
          )}
          {tab === "Quotes" && (
            <>
              <div className="section-heading">
                <h2>
                  Saved estimates <span className="count">{quotes.length}</span>
                </h2>
                <button
                  className="outline"
                  onClick={exportQuotes}
                  disabled={!quotes.length}
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
              {!quotes.length ? (
                <div className="empty">
                  <FileText size={36} />
                  <h2>No quotes saved yet.</h2>
                  <p>
                    Choose a product, set your quantity, and save your first
                    estimate.
                  </p>
                  <button className="primary" onClick={() => setTab("Compare")}>
                    Build your first quote <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="quote-list">
                  {quotes.map((q) => (
                    <article className="quote-row" key={q.id}>
                      <span className="starter-icon">
                        <FileText />
                      </span>
                      <div>
                        <h3>{q.product.name}</h3>
                        <p>
                          {q.quantity} units ·{" "}
                          {q.project || "No project assigned"} · {q.id}
                        </p>
                        <small>
                          Supplier {money(q.product.cost * q.quantity)} +
                          service {money(q.product.margin * q.quantity)}
                        </small>
                      </div>
                      <strong>
                        {money(
                          (q.product.cost + q.product.margin) * q.quantity,
                        )}
                      </strong>
                      <button
                        className="icon-button"
                        aria-label={"Delete quote " + q.id}
                        onClick={() =>
                          saveQuotes(quotes.filter((x) => x.id !== q.id))
                        }
                      >
                        <Trash2 size={18} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === "Projects" &&
            (!projects.length ? (
              <div className="empty">
                <Folder size={36} />
                <h2>Create your first project.</h2>
                <p>Create a project and keep related quotes together.</p>
                <button
                  className="primary"
                  onClick={() => setProjectModal(true)}
                >
                  <Plus size={16} />
                  Create a project
                </button>
              </div>
            ) : (
              <div className="projects">
                {projects.map((p) => (
                  <article className="project" key={p}>
                    <Folder size={28} />
                    <h2>{p}</h2>
                    <p>
                      {quotes.filter((q) => q.project === p).length} quotes ·{" "}
                      {money(
                        quotes
                          .filter((q) => q.project === p)
                          .reduce(
                            (n, q) =>
                              n +
                              (q.product.cost + q.product.margin) * q.quantity,
                            0,
                          ),
                      )}
                    </p>
                    <button
                      className="outline"
                      onClick={() => {
                        setProject(p);
                        setTab("Compare");
                      }}
                    >
                      Add a quote <Plus size={16} />
                    </button>
                  </article>
                ))}
              </div>
            ))}
          <footer>
            <span>
              nxt
              <span className="green">
                <ArrowUpRight size={12} />
              </span>{" "}
              <span className="footer-tag">
                Technology advisory & procurement
              </span>
            </span>
            <span>Sample catalog & pricing · Not a purchase offer</span>
          </footer>
        </div>
      </main>
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Build a quote"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close icon-button"
              aria-label="Close"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <span className="eyebrow">LET’S PUT A NUMBER ON IT</span>
            <h2>{selected.name}</h2>
            <p>Transparent pricing. No hidden extras.</p>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                max="10000"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </label>
            <label htmlFor="quote-project">Project</label>
            <select
              id="quote-project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <div className="price-line">
              <span>Supplier cost</span>
              <b>{money(selected.cost * qty)}</b>
            </div>
            <div className="price-line">
              <span>Our service · 10%</span>
              <b>{money(selected.margin * qty)}</b>
            </div>
            <div className="price-line final">
              <span>Estimated total</span>
              <strong>{money((selected.cost + selected.margin) * qty)}</strong>
            </div>
            <small>Example estimate. Taxes and shipping excluded.</small>
            <button
              className="primary full"
              disabled={!Number.isInteger(qty) || qty < 1 || qty > 10000}
              onClick={() => {
                saveQuotes([
                  ...quotes,
                  {
                    id: "Q-" + Date.now().toString(36).toUpperCase(),
                    product: selected,
                    quantity: qty,
                    project,
                  },
                ]);
                setSelected(null);
                setTab("Quotes");
                notify("Quote saved to your workspace");
              }}
            >
              Save quote <Check size={16} />
            </button>
          </section>
        </div>
      )}
      {projectModal && (
        <div className="overlay">
          <form
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create project"
            onSubmit={(e) => {
              e.preventDefault();
              const name = projectName.trim();
              if (!name || projects.includes(name)) return;
              const next = [...projects, name];
              setProjects(next);
              localStorage.setItem("nxt.projects", JSON.stringify(next));
              setProjectModal(false);
              setProjectName("");
              notify("Project created");
            }}
          >
            <button
              type="button"
              className="close icon-button"
              aria-label="Close"
              onClick={() => setProjectModal(false)}
            >
              <X />
            </button>
            <h2>New project</h2>
            <label>
              Project name
              <input
                autoFocus
                required
                maxLength={80}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Our 2026 laptop refresh"
              />
            </label>
            {projects.includes(projectName.trim()) && (
              <p>A project with this name already exists.</p>
            )}
            <button
              className="primary full"
              disabled={
                !projectName.trim() || projects.includes(projectName.trim())
              }
            >
              Create project <Plus size={16} />
            </button>
          </form>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
