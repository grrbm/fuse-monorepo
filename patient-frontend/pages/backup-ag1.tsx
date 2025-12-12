export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f3ef", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #e5e5e5", backgroundColor: "white" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.875rem", fontWeight: 400 }}>AG1</h1>
            <nav style={{ display: "flex", alignItems: "center", gap: "2rem", fontSize: "0.875rem" }}>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                AG1 for Daily Health
              </a>
              <a
                href="#"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                AG2 for Rest
                <span
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  NEW
                </span>
              </a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Learn More
              </a>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              style={{
                backgroundColor: "#004d4d",
                color: "white",
                padding: "0.5rem 1.5rem",
                border: "none",
                borderRadius: "0.125rem",
                cursor: "pointer",
              }}
            >
              Shop All
            </button>
            <button style={{ padding: "0.5rem", border: "none", background: "none", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
            <button style={{ padding: "0.5rem", border: "none", background: "none", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Title Section */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.875rem", color: "#737373", marginBottom: "0.5rem" }}>SHOP</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "3rem", marginBottom: "0.75rem", fontWeight: 400 }}>
            All Products
          </h2>
          <p style={{ color: "#404040" }}>AG1 is so much more than greens. Discover our member favorites here.</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "3rem" }}>
          <button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#8b7355",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            All
          </button>
          <button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "white",
              color: "inherit",
              border: "1px solid #d4d4d4",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Bundles
          </button>
          <button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "white",
              color: "inherit",
              border: "1px solid #d4d4d4",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Daily Health
          </button>
          <button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "white",
              color: "inherit",
              border: "1px solid #d4d4d4",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Rest & Restore
          </button>
        </div>

        {/* Products Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "4rem",
          }}
        >
          {/* AG1 Pouch */}
          <div style={{ cursor: "pointer" }}>
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1/1",
              }}
            >
              <div
                style={{
                  width: "8rem",
                  height: "12rem",
                  backgroundColor: "#004d4d",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontFamily: "Georgia, serif", color: "white", fontSize: "1.875rem" }}>AG1</span>
              </div>
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 400 }}>
              AG1 Pouch
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "0.75rem" }}>
              All-in-one gut and health support in one Daily Health Drink.*
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>From $79/mo</span>
              <span style={{ fontSize: "0.875rem", color: "#737373", textDecoration: "line-through" }}>$99*</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#737373", marginBottom: "0.75rem" }}>Original Flavor</p>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#004d4d" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#facc15" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#f9a8d4" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#d8b4fe" }}></div>
            </div>
          </div>

          {/* AG1 Travel Packs */}
          <div style={{ cursor: "pointer" }}>
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1/1",
              }}
            >
              <div
                style={{
                  width: "8rem",
                  height: "12rem",
                  backgroundColor: "#004d4d",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontFamily: "Georgia, serif", color: "white", fontSize: "1.875rem" }}>AG1</span>
              </div>
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 400 }}>
              AG1 Travel Packs
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "0.75rem" }}>
              Plan your Daily Health Dose on-the-go with 30 individual Travel Packs.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>From $89/mo</span>
              <span style={{ fontSize: "0.875rem", color: "#737373", textDecoration: "line-through" }}>$109*</span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#737373", marginBottom: "0.75rem" }}>Original Flavor</p>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#004d4d" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#facc15" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#f9a8d4" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#d8b4fe" }}></div>
            </div>
          </div>

          {/* AGZ */}
          <div style={{ cursor: "pointer" }}>
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1/1",
              }}
            >
              <div
                style={{
                  width: "8rem",
                  height: "12rem",
                  backgroundColor: "#8b7355",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontFamily: "Georgia, serif", color: "white", fontSize: "1.875rem" }}>AGZ</span>
              </div>
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 400 }}>
              AGZ
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "0.75rem" }}>
              Individual Travel Packs, 30 servings. Ease your mind & body into restful sleep without feeling groggy,
              magnesium & adaptogens.*
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>From $79/mo</span>
              <span style={{ fontSize: "0.875rem", color: "#737373", textDecoration: "line-through" }}>$99*</span>
            </div>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#8b7355" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#d97706" }}></div>
              <div style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: "#ca8a04" }}></div>
            </div>
          </div>

          {/* AG2 Variety Pack */}
          <div style={{ cursor: "pointer" }}>
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1/1",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div
                  style={{ width: "2.5rem", height: "10rem", backgroundColor: "#7c3aed", borderRadius: "0.25rem" }}
                ></div>
                <div
                  style={{ width: "2.5rem", height: "10rem", backgroundColor: "#f9a8d4", borderRadius: "0.25rem" }}
                ></div>
                <div
                  style={{ width: "2.5rem", height: "10rem", backgroundColor: "#6ee7b7", borderRadius: "0.25rem" }}
                ></div>
              </div>
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 400 }}>
              AG2 Variety Pack (3Pk)
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "0.75rem" }}>
              Ease your mind and body into restful sleep with calming tones, magnesium & adaptogens. Try 10 individual
              packs in Berry, Chocolate, Chocolate Mint.*
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>$39.99</span>
            </div>
          </div>

          {/* AG Omega3 */}
          <div style={{ cursor: "pointer" }}>
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1/1",
              }}
            >
              <div
                style={{
                  width: "8rem",
                  height: "8rem",
                  backgroundColor: "#004d4d",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontFamily: "Georgia, serif", color: "white", fontSize: "1.5rem" }}>AG</span>
              </div>
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 400 }}>
              AG Omega3
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "0.75rem" }}>
              Complements AG1 for added brain support with high quality fish oil.*
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>From $35/mo</span>
              <span style={{ fontSize: "0.875rem", color: "#737373", textDecoration: "line-through" }}>$59*</span>
            </div>
          </div>

          {/* AG Vitamin D3+K2 */}
          <div style={{ cursor: "pointer" }}>
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "1/1",
              }}
            >
              <div style={{ width: "6rem", height: "10rem", backgroundColor: "#004d4d", borderRadius: "0.5rem" }}></div>
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.5rem", fontWeight: 400 }}>
              AG Vitamin D3+K2
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#525252", marginBottom: "0.75rem" }}>
              Complements AG1 for added immune support with liquid drops.*
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontWeight: 600 }}>$29</span>
            </div>
          </div>
        </div>

        {/* Bundle & Save Section */}
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2.25rem", marginBottom: "0.5rem", fontWeight: 400 }}>
            Bundle & Save
          </h2>
          <p style={{ color: "#404040", marginBottom: "2rem" }}>
            Our best offerings and all include Welcome Kit and Shaker
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Customize Your Own Bundle */}
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                position: "relative",
                minHeight: "600px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ width: "6rem", height: "8rem", backgroundColor: "#004d4d", borderRadius: "0.25rem" }}
                ></div>
                <div style={{ fontSize: "3rem", color: "#a3a3a3" }}>+</div>
                <div style={{ width: "4rem", height: "6rem", backgroundColor: "#404040", borderRadius: "50%" }}></div>
                <div style={{ fontSize: "3rem", color: "#a3a3a3" }}>+</div>
                <div
                  style={{ width: "3rem", height: "8rem", backgroundColor: "#f97316", borderRadius: "0.25rem" }}
                ></div>
                <div style={{ fontSize: "3rem", color: "#a3a3a3" }}>+</div>
                <div style={{ width: "4rem", height: "6rem", backgroundColor: "#004d4d", borderRadius: "50%" }}></div>
              </div>
              <button
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  right: "2rem",
                  backgroundColor: "#004d4d",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Add to Cart →
              </button>
              <div style={{ marginTop: "5rem" }}>
                <h3
                  style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", marginBottom: "0.5rem", fontWeight: 400 }}
                >
                  Customize Your Own Bundle
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontWeight: 600 }}>Starting at $79/mo</span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#737373",
                      textDecoration: "line-through",
                      marginLeft: "0.5rem",
                    }}
                  >
                    $99*
                  </span>
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>WHAT'S INCLUDED</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>AG1 Pouch</p>
                      <p style={{ color: "#525252" }}>
                        All-in-one gut health support in one Daily Health Drink.* — 30 servings shipped monthly
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>Free Welcome Kit**</p>
                      <p style={{ color: "#525252" }}>Includes: AG1 canister, scoop, shaker bottle</p>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#737373", marginTop: "1rem" }}>*Price at one-time purchase</p>
              </div>
            </div>

            {/* Full Foundation Stack */}
            <div
              style={{
                backgroundColor: "#e8e6e1",
                borderRadius: "0.5rem",
                padding: "2rem",
                position: "relative",
                minHeight: "600px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ width: "6rem", height: "8rem", backgroundColor: "#004d4d", borderRadius: "0.25rem" }}
                ></div>
                <div style={{ fontSize: "3rem", color: "#a3a3a3" }}>+</div>
                <div style={{ width: "4rem", height: "6rem", backgroundColor: "#404040", borderRadius: "50%" }}></div>
                <div style={{ fontSize: "3rem", color: "#a3a3a3" }}>+</div>
                <div
                  style={{ width: "3rem", height: "8rem", backgroundColor: "#f97316", borderRadius: "0.25rem" }}
                ></div>
                <div style={{ fontSize: "3rem", color: "#a3a3a3" }}>+</div>
                <div style={{ width: "4rem", height: "6rem", backgroundColor: "#004d4d", borderRadius: "50%" }}></div>
                <div style={{ fontSize: "3rem", color: "#a3a3a3" }}>+</div>
                <div
                  style={{ width: "2rem", height: "6rem", backgroundColor: "#004d4d", borderRadius: "0.25rem" }}
                ></div>
              </div>
              <button
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  right: "2rem",
                  backgroundColor: "#004d4d",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Add to Cart →
              </button>
              <div style={{ marginTop: "5rem" }}>
                <h3
                  style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", marginBottom: "0.5rem", fontWeight: 400 }}
                >
                  Full Foundation Stack
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <span style={{ fontWeight: 600 }}>$108/mo</span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#737373",
                      textDecoration: "line-through",
                      marginLeft: "0.5rem",
                    }}
                  >
                    $138*
                  </span>
                </div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>WHAT'S INCLUDED</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>AG1 Pouch</p>
                      <p style={{ color: "#525252" }}>All-in-one gut health support in one Daily Health Drink.*</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>AG Omega3</p>
                      <p style={{ color: "#525252" }}>
                        Complements AG1 for added brain support with high quality fish oil.*
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>Free Bottle of AG Vitamin D3+K2</p>
                      <p style={{ color: "#525252" }}>Complements AG1 for added immune support with liquid drops.*</p>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#737373", marginTop: "1rem" }}>*Price at one-time purchase</p>
              </div>
            </div>
          </div>

          {/* Home & Away Pack */}
          <div style={{ backgroundColor: "#e8e6e1", borderRadius: "0.5rem", padding: "2rem", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  flex: 1,
                  minWidth: "300px",
                }}
              >
                <div
                  style={{ width: "6rem", height: "8rem", backgroundColor: "#004d4d", borderRadius: "0.25rem" }}
                ></div>
                <div
                  style={{ width: "5rem", height: "8rem", backgroundColor: "#004d4d", borderRadius: "0.25rem" }}
                ></div>
                <div style={{ width: "4rem", height: "6rem", backgroundColor: "#404040", borderRadius: "50%" }}></div>
                <div
                  style={{ width: "3rem", height: "8rem", backgroundColor: "#f97316", borderRadius: "0.25rem" }}
                ></div>
                <div style={{ width: "4rem", height: "6rem", backgroundColor: "#004d4d", borderRadius: "50%" }}></div>
              </div>
              <button
                style={{
                  position: "absolute",
                  bottom: "2rem",
                  right: "2rem",
                  backgroundColor: "#004d4d",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Add to Cart →
              </button>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", marginBottom: "0.5rem", fontWeight: 400 }}>
                Home & Away Pack
              </h3>
              <div style={{ marginBottom: "1rem" }}>
                <span style={{ fontWeight: 600 }}>$168/ships every 60 days</span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#737373",
                    textDecoration: "line-through",
                    marginLeft: "0.5rem",
                  }}
                >
                  $218*
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>WHAT'S INCLUDED</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "2rem",
                  fontSize: "0.875rem",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>AG1 Pouch</p>
                      <p style={{ color: "#525252" }}>
                        All-in-one gut health support in one Daily Health Drink.* — 30 servings shipped monthly
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>Free Bottle of AG Vitamin D3+K2</p>
                      <p style={{ color: "#525252" }}>Complements AG1 for added immune support with liquid drops.*</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#004d4d",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>AG1 Travel Packs</p>
                      <p style={{ color: "#525252" }}>
                        Plan your Daily Health Dose on-the-go with 30 individual Travel Packs.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        backgroundColor: "#8b7355",
                        borderRadius: "0.25rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <div>
                      <p style={{ fontWeight: 600 }}>More Included!</p>
                      <p style={{ color: "#525252" }}>Learn more by tapping the bundle.</p>
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#737373", marginTop: "1rem" }}>*Price at one-time purchase</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#004d4d", color: "white", padding: "3rem 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "2rem" }}>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>SHOP</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a href="#" style={{ color: "white", textDecoration: "none" }}>
                    All Products
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>DAILY HEALTH</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a href="#" style={{ color: "white", textDecoration: "none" }}>
                    What is AG1?
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>REST & RESTORE</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a href="#" style={{ color: "white", textDecoration: "none" }}>
                    What is AG2?
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>LEARN MORE</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a href="#" style={{ color: "white", textDecoration: "none" }}>
                    About us
                  </a>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a href="#" style={{ color: "white", textDecoration: "none" }}>
                    Leadership
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>CONTACT & SUPPORT</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a href="#" style={{ color: "white", textDecoration: "none" }}>
                    My Account
                  </a>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <a href="#" style={{ color: "white", textDecoration: "none" }}>
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
