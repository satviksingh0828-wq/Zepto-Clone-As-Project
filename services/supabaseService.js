// Supabase Service for API calls
// Environment variables required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Headers for Supabase API requests
const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
};

/**
 * Fetch all products from Supabase
 */
export async function fetchProducts() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?select=*`,
            { headers }
        );
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        // Add quantity field for cart management
        return products.map(p => ({ ...p, quantity: 0 }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Save order to Supabase
 */
export async function saveOrder(orderData) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/orders`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify(orderData)
            }
        );
        if (!response.ok) throw new Error('Failed to save order');
        return await response.json();
    } catch (error) {
        console.error('Error saving order:', error);
        return null;
    }
}

/**
 * Fetch order by tracking number
 */
export async function fetchOrderByTracking(trackingNumber) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/orders?tracking_number=eq.${trackingNumber}&select=*`,
            { headers }
        );
        if (!response.ok) throw new Error('Failed to fetch order');
        const orders = await response.json();
        return orders.length > 0 ? orders[0] : null;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ order_status: status })
            }
        );
        if (!response.ok) throw new Error('Failed to update order');
        return await response.json();
    } catch (error) {
        console.error('Error updating order:', error);
        return null;
    }
}

/**
 * Generate unique 10-digit tracking number
 */
export function generateTrackingNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return (timestamp + random).slice(0, 10);
}
