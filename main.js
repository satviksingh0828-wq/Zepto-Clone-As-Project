import './style.css'
import { Model as MockModel } from './model/model';
import { fetchProducts } from './services/supabaseService';
import { openTrackingPage } from './services/trackingService';
import { ContainerView } from './view/containerView';

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    let products = await fetchProducts();
    if (products.length === 0) {
        console.warn('Using mock data as fallback');
        products = MockModel;
    }
    const container = new ContainerView(products);
    container.init();

    // Add Track Order button to header
    const headerActions = document.querySelector('.header-actions');
    const trackBtn = document.createElement('button');
    trackBtn.className = 'theme-toggle'; // Reuse style
    trackBtn.innerHTML = '🚚';
    trackBtn.title = 'Track Order';
    trackBtn.style.fontSize = '20px';
    trackBtn.addEventListener('click', () => openTrackingPage());
    headerActions.insertBefore(trackBtn, headerActions.firstChild);
});

// Add loading state
document.body.style.opacity = '0';
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }, 2000);
});

