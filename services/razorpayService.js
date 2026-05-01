// Razorpay Payment Service
// Environment variables required: VITE_RAZORPAY_KEY_ID

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * Initialize Razorpay script
 */
export function initRazorpay() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * Open Razorpay payment modal
 */
export function openRazorpayCheckout(options) {
    return new Promise((resolve, reject) => {
        if (!window.Razorpay) {
            reject(new Error('Razorpay script not loaded'));
            return;
        }

        const rzp = new window.Razorpay({
            key: RAZORPAY_KEY_ID,
            amount: options.amount * 100, // Convert to paise
            currency: 'INR',
            name: 'CARTIFY',
            description: options.description || 'Grocery Order',
            order_id: options.orderId,
            customer_notification: 1,
            handler: function(response) {
                resolve({
                    success: true,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature
                });
            },
            prefill: {
                name: options.customerName || '',
                email: options.email || '',
                contact: options.phone || ''
            },
            theme: {
                color: '#10b981'
            },
            modal: {
                ondismiss: function() {
                    reject(new Error('Payment cancelled by user'));
                }
            }
        });

        rzp.open();
    });
}

/**
 * Create order on backend (Razorpay)
 */
export async function createRazorpayOrder(amount, receipt) {
    try {
        // This should be called from your backend
        // For now, we'll assume the backend handles this
        // You'll need to implement this endpoint
        const response = await fetch('/api/razorpay/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, receipt })
        });
        if (!response.ok) throw new Error('Failed to create order');
        return await response.json();
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return null;
    }
}

/**
 * Verify payment signature
 */
export async function verifyPaymentSignature(paymentData) {
    try {
        const response = await fetch('/api/razorpay/verify-signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        if (!response.ok) throw new Error('Failed to verify signature');
        return await response.json();
    } catch (error) {
        console.error('Error verifying signature:', error);
        return null;
    }
}
