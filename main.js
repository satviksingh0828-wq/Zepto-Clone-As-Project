import './style.css'
import { fetchProducts } from './services/supabaseService';
import { openTrackingPage } from './services/trackingService';
import { ContainerView } from './view/containerView';

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const products = await fetchProducts();
        
        if (products.length === 0) {
            console.error('No products found. Please ensure Supabase is configured correctly.');
            document.getElementById('productsGrid').innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p style="font-size: 18px; color: #ef4444;">⚠️ Unable to load products</p>
                    <p style="color: #6b7280; margin-top: 8px;">Please check your Supabase configuration.</p>
                </div>
            `;
            return;
        }
        
        const container = new ContainerView(products);
        container.init();

        // Add Track Order button to header
        const headerActions = document.querySelector('.header-actions');
        const trackBtn = document.createElement('button');
        trackBtn.className = 'theme-toggle';
        trackBtn.innerHTML = '🚚';
        trackBtn.title = 'Track Order';
        trackBtn.style.fontSize = '20px';
        trackBtn.addEventListener('click', () => openTrackingPage());
        headerActions.insertBefore(trackBtn, headerActions.firstChild);
    } catch (error) {
        console.error('Error initializing app:', error);
        document.getElementById('productsGrid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="font-size: 18px; color: #ef4444;">⚠️ Error loading application</p>
                <p style="color: #6b7280; margin-top: 8px;">Please refresh the page and try again.</p>
            </div>
        `;
    }
});

// Add loading state
document.body.style.opacity = '0';
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 2000);
});
