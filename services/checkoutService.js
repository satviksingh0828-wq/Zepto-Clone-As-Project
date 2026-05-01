// Checkout Service - Handles address collection, payment, and order creation
import { saveOrder, generateTrackingNumber } from './supabaseService.js';
import { openRazorpayCheckout, initRazorpay } from './razorpayService.js';

const DELIVERY_CHARGE = 100;

/**
 * Show address collection modal
 */
export function showAddressModal() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 25px rgba(0,0,0,0.15);
        `;

        modal.innerHTML = `
            <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Delivery Address</h2>
            <form id="addressForm" style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Name</label>
                    <input type="text" id="customerName" placeholder="Full Name" required style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Phone</label>
                    <input type="tel" id="customerPhone" placeholder="10-digit phone number" required style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Address</label>
                    <textarea id="customerAddress" placeholder="Street address, city, state, PIN code" required style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; min-height: 100px; font-family: inherit;"></textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button type="button" id="cancelBtn" style="flex: 1; padding: 12px; background: #e5e7eb; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Cancel</button>
                    <button type="submit" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Continue</button>
                </div>
            </form>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const form = modal.querySelector('#addressForm');
        const cancelBtn = modal.querySelector('#cancelBtn');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const address = {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                address: document.getElementById('customerAddress').value
            };
            document.body.removeChild(overlay);
            resolve(address);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(null);
            }
        });
    });
}

/**
 * Process checkout - collect address, create order, process payment
 */
export async function processCheckout(cartItems, subtotal, tax) {
    try {
        // Step 1: Collect address
        const address = await showAddressModal();
        if (!address) {
            console.log('Checkout cancelled by user');
            return null;
        }

        // Step 2: Calculate total with delivery charge
        const total = subtotal + tax + DELIVERY_CHARGE;

        // Step 3: Initialize Razorpay
        const razorpayReady = await initRazorpay();
        if (!razorpayReady) {
            alert('Payment gateway not available. Please try again.');
            return null;
        }

        // Step 4: Generate tracking number
        const trackingNumber = generateTrackingNumber();

        // Step 5: Prepare order data
        const orderData = {
            tracking_number: trackingNumber,
            customer_name: address.name,
            customer_address: address.address,
            total_amount: total,
            delivery_charge: DELIVERY_CHARGE,
            payment_status: 'pending',
            order_status: 'placed',
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.discount_price,
                unit: item.unit
            }))
        };

        // Step 6: Open Razorpay checkout
        const paymentResult = await openRazorpayCheckout({
            amount: total,
            orderId: trackingNumber,
            description: `Order #${trackingNumber}`,
            customerName: address.name,
            phone: address.phone
        });

        if (paymentResult.success) {
            // Step 7: Update order with payment details
            orderData.payment_status = 'paid';
            orderData.payment_id = paymentResult.paymentId;

            // Step 8: Save order to Supabase
            const savedOrder = await saveOrder(orderData);
            if (savedOrder) {
                return {
                    success: true,
                    trackingNumber,
                    total,
                    orderData
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Checkout error:', error);
        alert('An error occurred during checkout. Please try again.');
        return null;
    }
}

/**
 * Show order confirmation modal
 */
export function showOrderConfirmation(trackingNumber, total) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 32px;
        max-width: 500px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 25px rgba(0,0,0,0.15);
    `;

    modal.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2 style="margin-bottom: 16px; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">Your order has been placed successfully.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 8px 0; color: #6b7280;">Tracking Number</p>
            <p style="font-size: 20px; font-weight: 600; color: #10b981; margin: 8px 0;">${trackingNumber}</p>
            <p style="margin: 8px 0; color: #6b7280;">Total Amount: ₹${total.toFixed(2)}</p>
        </div>
        <p style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">Save your tracking number to track your order. You'll be redirected to the tracking page.</p>
        <button id="trackOrderBtn" style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 16px;">Track Order</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return new Promise((resolve) => {
        const trackBtn = modal.querySelector('#trackOrderBtn');
        trackBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
    });
}
