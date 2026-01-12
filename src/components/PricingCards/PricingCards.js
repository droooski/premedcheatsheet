// src/components/PricingCards/PricingCards.js - Simplified without ordering/sorting
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import "./PricingCards.scss";

const PricingCards = ({ onSelectPlan }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Coupon state for showing/hiding the input field
  const [showCouponInputs, setShowCouponInputs] = useState({});

  // Coupon code values
  const [couponCodes, setCouponCodes] = useState({});

  // Coupon application status
  const [appliedCoupons, setAppliedCoupons] = useState({});

  const db = getFirestore();

  // Define discount codes
  const discountCodes = {
    PREMEDVIP: { rate: 10, description: "VIP Discount" },
    STUDENT2025: { rate: 20, description: "Student Discount" },
    PARTNER: { rate: 100, description: "Partnership - 100% Off" },
    COOLMEMBER: { rate: 100, description: "Cool Member - 100% Off" },
  };

  // Default products as fallback
  const getDefaultProducts = () => {
    return [
      {
        id: "cheatsheet",
        name: "The Premed Profiles",
        price: 14.99,
        description: "New full applicant profile added every couple days.",
        features: [
          "Advice and reflections from successful applicants",
          "Which medical schools an applicant was accepted",
          "Extra-curriculars that got them in",
          "MCAT and GPA that got them in",
          "Gap years they took",
        ],
        category: "cheatsheet",
        isActive: true,
      },
      {
        id: "application",
        name: "Application Cheatsheet",
        price: 19.99,
        description: "",
        features: [
          "Personal statement writing guide",
          "Activity section description guide",
          "Insider advice on what admissions committees want",
          "General writing strategy guide",
          "Letter of recommendation email template",
        ],
        category: "application",
        isActive: true,
      },
      {
        id: "cheatsheet-plus",
        name: "The Profiles +",
        price: 29.99,
        description:
          "Get everything in the Premed Profiles + extra resources. New full applicant profile added every couple days.",
        features: [
          "The Premed Profiles",
          "Proven cold emailing templates",
          "Polished CV template",
          "Pre-med summer program database",
          "MCAT-Optimized Course Schedules & Study Plan",
        ],
        category: "cheatsheet",
        isActive: true,
      },
      {
        id: "application-plus",
        name: "Application Cheatsheet +",
        price: 34.99,
        description:
          "Get everything in the Premed Profiles + Application Cheatsheet. New full applicant profile added every couple days.",
        features: ["The Premed Profiles", "The Application Cheatsheet"],
        category: "application",
        isActive: true,
      },
    ];
  };

  // Initialize coupon states for products
  const initializeCouponStates = (productsData) => {
    const initialCouponInputs = {};
    const initialCouponCodes = {};
    const initialAppliedCoupons = {};

    productsData.forEach((product) => {
      const productId = product.id;
      initialCouponInputs[productId] = false;
      initialCouponCodes[productId] = "";
      initialAppliedCoupons[productId] = { applied: false, discount: 0 };
    });

    setShowCouponInputs(initialCouponInputs);
    setCouponCodes(initialCouponCodes);
    setAppliedCoupons(initialAppliedCoupons);
  };

  // Load products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simple query for active products only
        const q = query(
          collection(db, "products"),
          where("isActive", "==", true),
          orderBy("sortOrder", "asc")
        );

        const querySnapshot = await getDocs(q);
        const productsData = [];

        querySnapshot.forEach((doc) => {
          const productData = { id: doc.id, ...doc.data() };
          productsData.push(productData);
        });

        // If no products found, fall back to default products
        if (productsData.length === 0) {
          console.warn(
            "No products found in Firestore, using default products"
          );
          const defaultProducts = getDefaultProducts();
          setProducts(defaultProducts);
          initializeCouponStates(defaultProducts);
        } else {
          setProducts(productsData);
          initializeCouponStates(productsData);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setError(`Failed to load products: ${error.message}`);

        // Fall back to default products on error
        const defaultProducts = getDefaultProducts();
        setProducts(defaultProducts);
        initializeCouponStates(defaultProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [db]);

  // Toggle coupon input visibility
  const toggleCouponInput = (productId) => {
    setShowCouponInputs({
      ...showCouponInputs,
      [productId]: !showCouponInputs[productId],
    });
  };

  // Handle coupon code input change
  const handleCouponChange = (productId, value) => {
    setCouponCodes({
      ...couponCodes,
      [productId]: value,
    });
  };

  // Apply coupon code
  const applyCoupon = (productId) => {
    const code = couponCodes[productId].toUpperCase();

    if (discountCodes[code]) {
      setAppliedCoupons({
        ...appliedCoupons,
        [productId]: {
          applied: true,
          discount: discountCodes[code].rate,
        },
      });
      alert(
        `Coupon applied! ${discountCodes[code].description} (${discountCodes[code].rate}% off)`
      );
    } else {
      alert("Invalid coupon code. Please try again.");
    }
  };

  // Get final price after discount
  const getFinalPrice = (product) => {
    const basePrice = product.price;
    const productId = product.id;

    if (appliedCoupons[productId]?.applied) {
      const discountAmount =
        (basePrice * appliedCoupons[productId].discount) / 100;
      return Math.max(0, basePrice - discountAmount).toFixed(2);
    }
    return basePrice.toFixed(2);
  };

  // Handle plan selection
  const handleSelectPlan = (product) => {
    const productId = product.id;
    onSelectPlan(productId, {
      couponCode: appliedCoupons[productId]?.applied
        ? couponCodes[productId]
        : "",
      discount: appliedCoupons[productId]?.discount || 0,
      finalPrice: getFinalPrice(product),
      productData: product,
    });
  };

  // Coupon prompt component
  const CouponPrompt = ({ product }) => {
    const productId = product.id;

    return (
      <div className="coupon-section">
        {!showCouponInputs[productId] ? (
          <div
            className="coupon-prompt"
            onClick={() => toggleCouponInput(productId)}
          >
            Have a coupon code? Enter it here
          </div>
        ) : (
          <div className="coupon-input-group">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCodes[productId] || ""}
              onChange={(e) => handleCouponChange(productId, e.target.value)}
              disabled={appliedCoupons[productId]?.applied}
            />
            <button
              className="apply-button"
              onClick={() => applyCoupon(productId)}
              disabled={appliedCoupons[productId]?.applied}
            >
              {appliedCoupons[productId]?.applied ? "Applied" : "Apply"}
            </button>
          </div>
        )}

        {appliedCoupons[productId]?.applied && (
          <div className="discount-info">
            <p className="discount-text">
              {appliedCoupons[productId].discount}% discount applied!
            </p>
            <p className="final-price">
              Final price: ${getFinalPrice(product)}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="pricing-cards-container">
        <div className="loading-message">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state - but still show products if we have them
  if (error && products.length === 0) {
    return (
      <div className="pricing-cards-container">
        <div className="error-message">
          <p>Error loading products: {error}</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  // Render products in rows
  const renderProductsInRows = () => {
    const rows = [];
    for (let i = 0; i < products.length; i += 2) {
      const rowProducts = products.slice(i, i + 2);
      rows.push(
        <div key={`row-${i}`} className="pricing-row">
          {rowProducts.map((product) => (
            <div
              key={product.id}
              className={`pricing-card ${
                appliedCoupons[product.id]?.applied ? "has-discount" : ""
              }`}
            >
              <h3>{product.name}</h3>
              <div className="price">
                <span className="amount">${product.price.toFixed(2)}</span>
                <span className="period">One time</span>
              </div>

              <button
                className="sign-up-button"
                onClick={() => handleSelectPlan(product)}
              >
                Sign up
              </button>

              {product.description && (
                <>
                  <p className="description">{product.description}</p>
                  <div className="divider"></div>
                </>
              )}

              {product.features && product.features.length > 0 && (
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}

              <CouponPrompt product={product} />
            </div>
          ))}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="pricing-cards-container">
      {error && (
        <div
          className="warning-message"
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            color: "#856404",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <p>Warning: {error}</p>
          <p>Showing default products as fallback.</p>
        </div>
      )}

      {renderProductsInRows()}
    </div>
  );
};

export default PricingCards;
