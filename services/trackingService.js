// Tracking Service - Handle order tracking and status display
import { fetchOrderByTracking } from './supabaseService.js';

/**
 * Show tracking page modal
 */
export function showTrackingPage(initialTrackingNumber = null) {
    const overlay = document.createElement('div');
    overlay.id = 'trackingOverlay';
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
        max-width: 600px;
        width: 100%;
        box-shadow: 0 20px 25px rgba(0,0,0,0.15);
    `;

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="font-size: 24px; font-weight: 600; margin: 0;">Track Your Order</h2>
            <button id="closeTracking" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">&times;</button>
        </div>

        <div style="margin-bottom: 24px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Enter Tracking Number</label>
            <div style="display: flex; gap: 8px;">
                <input type="text" id="trackingInput" placeholder="10-digit tracking number" maxlength="10" value="${initialTrackingNumber || ''}" style="flex: 1; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                <button id="searchBtn" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Search</button>
            </div>
        </div>

        <div id="trackingResult" style="display: none;">
            <!-- Order details will be inserted here -->
        </div>

        <div id="noResult" style="display: none; text-align: center; padding: 32px;">
            <p style="color: #6b7280; font-size: 16px;">No order found with this tracking number.</p>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeBtn = modal.querySelector('#closeTracking');
    const searchBtn = modal.querySelector('#searchBtn');
    const trackingInput = modal.querySelector('#trackingInput');

    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });

    searchBtn.addEventListener('click', async () => {
        const trackingNumber = trackingInput.value.trim();
        if (!trackingNumber) {
            alert('Please enter a tracking number');
            return;
        }
        await displayOrderStatus(trackingNumber, modal);
    });

    trackingInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const trackingNumber = trackingInput.value.trim();
            if (trackingNumber) {
                await displayOrderStatus(trackingNumber, modal);
            }
        }
    });

    // If initial tracking number provided, fetch it automatically
    if (initialTrackingNumber) {
        setTimeout(async () => {
            await displayOrderStatus(initialTrackingNumber, modal);
        }, 300);
    }
}

/**
 * Display order status
 */
async function displayOrderStatus(trackingNumber, modal) {
    const resultDiv = modal.querySelector('#trackingResult');
    const noResultDiv = modal.querySelector('#noResult');

    // Show loading state
    resultDiv.style.display = 'none';
    noResultDiv.style.display = 'none';
    noResultDiv.innerHTML = '<p style="color: #6b7280;">Loading...</p>';
    noResultDiv.style.display = 'block';

    try {
        const order = await fetchOrderByTracking(trackingNumber);

        if (!order) {
            noResultDiv.innerHTML = '<p style="color: #6b7280; font-size: 16px;">No order found with this tracking number.</p>';
            noResultDiv.style.display = 'block';
            resultDiv.style.display = 'none';
            return;
        }

        // Display order details
        const statusSteps = [
            { status: 'placed', label: 'Order Placed', icon: '📦' },
            { status: 'processing', label: 'Processing', icon: '⚙️' },
            { status: 'shipped', label: 'Shipped', icon: '🚚' },
            { status: 'delivered', label: 'Delivered', icon: '✅' }
        ];

        const currentStatusIndex = statusSteps.findIndex(s => s.status === order.order_status);

        let statusHTML = '<div style="margin-bottom: 24px;">';
        statusHTML += '<h3 style="margin-bottom: 16px; font-weight: 600;">Order Status</h3>';
        statusHTML += '<div style="display: flex; justify-content: space-between; position: relative;">';

        statusSteps.forEach((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            statusHTML += `
                <div style="display: flex; flex-direction: column; align-items: center; flex: 1; position: relative;">
                    <div style="
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        background: ${isCompleted ? '#10b981' : '#e5e7eb'};
                        color: ${isCompleted ? 'white' : '#6b7280'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        margin-bottom: 8px;
                        border: 2px solid ${isCurrent ? '#10b981' : 'transparent'};
                    ">${step.icon}</div>
                    <p style="font-size: 12px; text-align: center; color: ${isCompleted ? '#10b981' : '#6b7280'}; font-weight: ${isCurrent ? '600' : '400'};">${step.label}</p>
                </div>
            `;
        });

        statusHTML += '</div></div>';

        // Order details
        statusHTML += `
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <h3 style="margin-top: 0; margin-bottom: 12px; font-weight: 600;">Order Details</h3>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Tracking Number:</strong> ${order.tracking_number}</p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Customer:</strong> ${order.customer_name}</p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Address:</strong> ${order.customer_address}</p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Total Amount:</strong> ₹${order.total_amount.toFixed(2)}</p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Payment Status:</strong> <span style="color: ${order.payment_status === 'paid' ? '#10b981' : '#f59e0b'}; font-weight: 600;">${order.payment_status.toUpperCase()}</span></p>
                <p style="margin: 8px 0; color: #6b7280;"><strong>Payment Method:</strong> <span style="font-weight: 600;">${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></p>
            </div>
        `;

        // Items
        if (order.items && order.items.length > 0) {
            statusHTML += '<h3 style="margin-bottom: 12px; font-weight: 600;">Items</h3>';
            statusHTML += '<div style="background: #f9fafb; padding: 16px; border-radius: 8px;">';
            order.items.forEach(item => {
                statusHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                        <span>${item.name} (${item.unit}) × ${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });
            statusHTML += '</div>';
        }

        resultDiv.innerHTML = statusHTML;
        resultDiv.style.display = 'block';
        noResultDiv.style.display = 'none';

    } catch (error) {
        console.error('Error fetching order:', error);
        noResultDiv.innerHTML = '<p style="color: #ef4444; font-size: 16px;">Error loading order details. Please try again.</p>';
        noResultDiv.style.display = 'block';
        resultDiv.style.display = 'none';
    }
}

/**
 * Save tracking number to local storage
 */
export function saveTrackingNumber(trackingNumber) {
    const trackingNumbers = JSON.parse(localStorage.getItem('cartify-tracking-numbers') || '[]');
    if (!trackingNumbers.includes(trackingNumber)) {
        trackingNumbers.unshift(trackingNumber);
        // Keep only last 10 tracking numbers
        trackingNumbers.splice(10);
        localStorage.setItem('cartify-tracking-numbers', JSON.stringify(trackingNumbers));
    }
}

/**
 * Get saved tracking numbers from local storage
 */
export function getSavedTrackingNumbers() {
    return JSON.parse(localStorage.getItem('cartify-tracking-numbers') || '[]');
}

/**
 * Open tracking page with saved or provided tracking number
 */
export function openTrackingPage(trackingNumber = null) {
    if (trackingNumber) {
        saveTrackingNumber(trackingNumber);
    }
    showTrackingPage(trackingNumber);
}
