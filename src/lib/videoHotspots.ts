export type HotspotType = 'product_card' | 'link_button' | 'discount_coupon' | 'lead_form';
export type HotspotPosition = 'bottom-center' | 'bottom-right' | 'top-right' | 'center';

export interface VideoHotspotItem {
  id: string;
  type: HotspotType;
  title: string;
  description?: string;
  price?: string;
  buttonText: string;
  url: string;
  couponCode?: string;
  imageUrl?: string;
  startTime: number;
  duration: number;
  position: HotspotPosition;
  badge?: string;
  accentColor?: string;
}

export const SAMPLE_HOTSPOTS: VideoHotspotItem[] = [
  {
    id: 'hotspot-prod-1',
    type: 'product_card',
    title: 'EditFlow Pro Creator Kit',
    description: 'Lifetime neural video rendering and 4K multi-platform export bundle',
    price: '$49',
    buttonText: 'Get 40% Off',
    url: 'https://editflow.ai/pricing',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
    startTime: 4.5,
    duration: 6.0,
    position: 'bottom-center',
    badge: 'FLASH SALE',
    accentColor: '#8b5cf6'
  },
  {
    id: 'hotspot-coupon-2',
    type: 'discount_coupon',
    title: 'Creator VIP Coupon Code',
    description: 'Use code VIRAL2026 at checkout for instant discount',
    buttonText: 'Copy Code & Open',
    url: 'https://editflow.ai',
    couponCode: 'VIRAL2026',
    startTime: 14.0,
    duration: 5.5,
    position: 'bottom-right',
    badge: 'EXCLUSIVE',
    accentColor: '#10b981'
  }
];

export function getActiveHotspots(hotspots: VideoHotspotItem[], currentTime: number): VideoHotspotItem[] {
  if (!hotspots || hotspots.length === 0) return [];
  return hotspots.filter(
    h => currentTime >= h.startTime && currentTime <= h.startTime + h.duration
  );
}
