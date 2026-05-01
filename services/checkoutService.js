// Checkout Service - Handles address collection, payment, and order creation
import { saveOrder, generateTrackingNumber } from './supabaseService.js';
import { openRazorpayCheckout, initRazorpay } from './razorpayService.js';

const DELIVERY_CHARGE = 100;

/**
 * Show payment method selection modal
 */
export function showPaymentMethodModal() {
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
            <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600; text-align: center;">Select Payment Method</h2>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button id="razorpayBtn" style="
                    padding: 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 16px;
                    transition: transform 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    💳 Pay Online (Razorpay)
                </button>
                <button id="codBtn" style="
                    padding: 16px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 16px;
                    transition: transform 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    💵 Cash on Delivery (COD)
                </button>
                <button id="cancelPaymentBtn" style="
                    padding: 16px;
                    background: #e5e7eb;
                    color: #1f2937;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 16px;
                ">
                    Cancel
                </button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const razorpayBtn = modal.querySelector('#razorpayBtn');
        const codBtn = modal.querySelector('#codBtn');
        const cancelBtn = modal.querySelector('#cancelPaymentBtn');

        razorpayBtn.addEventListener('mouseover', () => razorpayBtn.style.transform = 'scale(1.02)');
        razorpayBtn.addEventListener('mouseout', () => razorpayBtn.style.transform = 'scale(1)');
        codBtn.addEventListener('mouseover', () => codBtn.style.transform = 'scale(1.02)');
        codBtn.addEventListener('mouseout', () => codBtn.style.transform = 'scale(1)');

        razorpayBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve('razorpay');
        });

        codBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve('cod');
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
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
            overflow-y: auto;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 25px rgba(0,0,0,0.15);
            margin: 20px auto;
        `;

        modal.innerHTML = `
            <h2 style="margin-bottom: 24px; font-size: 24px; font-weight: 600;">Delivery Address</h2>
            <form id="addressForm" style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Full Name</label>
                    <input type="text" id="customerName" placeholder="Enter your full name" required style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Phone Number</label>
                    <input type="tel" id="customerPhone" placeholder="10-digit phone number" pattern="[0-9]{10}" required style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Email (Optional)</label>
                    <input type="email" id="customerEmail" placeholder="your.email@example.com" style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: inherit;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Complete Address</label>
                    <textarea id="customerAddress" placeholder="Street address, apartment/suite, city, state, PIN code" required style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; min-height: 100px; font-family: inherit; resize: vertical;"></textarea>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 16px;">
                    <button type="button" id="cancelBtn" style="flex: 1; padding: 12px; background: #e5e7eb; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.2s;">Cancel</button>
                    <button type="submit" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: background 0.2s;">Continue</button>
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
                email: document.getElementById('customerEmail').value,
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
        // Step 1: Select payment method
        const paymentMethod = await showPaymentMethodModal();
        if (!paymentMethod) {
            console.log('Checkout cancelled by user');
            return null;
        }

        // Step 2: Collect address
        const address = await showAddressModal();
        if (!address) {
            console.log('Address collection cancelled by user');
            return null;
        }

        // Step 3: Calculate total with delivery charge
        const total = subtotal + tax + DELIVERY_CHARGE;

        // Step 4: Generate tracking number
        const trackingNumber = generateTrackingNumber();

        // Step 5: Prepare order data
        const orderData = {
            tracking_number: trackingNumber,
            customer_name: address.name,
            customer_address: address.address,
            total_amount: total,
            delivery_charge: DELIVERY_CHARGE,
            payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
            order_status: 'placed',
            payment_method: paymentMethod,
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.discount_price,
                unit: item.unit
            }))
        };

        // Step 6: Handle payment based on method
        if (paymentMethod === 'razorpay') {
            const razorpayReady = await initRazorpay();
            if (!razorpayReady) {
                alert('Payment gateway not available. Please try again.');
                return null;
            }

            const paymentResult = await openRazorpayCheckout({
                amount: total,
                orderId: trackingNumber,
                description: `Order #${trackingNumber}`,
                customerName: address.name,
                phone: address.phone,
                email: address.email
            });

            if (paymentResult.success) {
                orderData.payment_status = 'paid';
                orderData.payment_id = paymentResult.paymentId;
            } else {
                return null;
            }
        } else if (paymentMethod === 'cod') {
            orderData.payment_status = 'pending';
            orderData.payment_method = 'cod';
        }

        // Step 7: Save order to Supabase
        const savedOrder = await saveOrder(orderData);
        if (savedOrder) {
            return {
                success: true,
                trackingNumber,
                total,
                orderData,
                paymentMethod
            };
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
export function showOrderConfirmation(trackingNumber, total, paymentMethod) {
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

    const paymentStatusText = paymentMethod === 'cod' 
        ? 'Your order will be confirmed upon payment at delivery.' 
        : 'Payment successful! Your order is confirmed.';

    modal.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2 style="margin-bottom: 16px; font-size: 24px; font-weight: 600;">Order Confirmed!</h2>
        <p style="color: #6b7280; margin-bottom: 24px;">${paymentStatusText}</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 8px 0; color: #6b7280;">Tracking Number</p>
            <p style="font-size: 20px; font-weight: 600; color: #10b981; margin: 8px 0;">${trackingNumber}</p>
            <p style="margin: 8px 0; color: #6b7280;">Total Amount: ₹${total.toFixed(2)}</p>
            <p style="margin: 8px 0; color: #6b7280; font-size: 12px;">
                Payment Method: <strong>${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong>
            </p>
        </div>
        <p style="color: #6b7280; margin-bottom: 24px; font-size: 14px;">Save your tracking number to track your order. You'll be redirected to the tracking page.</p>
        <button id="trackOrderBtn" style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 16px; transition: background 0.2s;">Track Order</button>
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
