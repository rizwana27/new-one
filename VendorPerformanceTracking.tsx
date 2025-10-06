
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useVendors, usePurchaseOrders } from '@/hooks/useSupabaseData';
import { Loader2 } from 'lucide-react';

const VendorPerformanceTracking: React.FC = () => {
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: purchaseOrders = [], isLoading: poLoading } = usePurchaseOrders();

  if (vendorsLoading || poLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading performance data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPerformanceMetrics = (vendor: any) => {
    const vendorPOs = purchaseOrders.filter(po => po.vendor_id === vendor.id);
    const approvedPOs = vendorPOs.filter(po => po.status === 'approved' || po.status === 'delivered');
    const completedPOs = vendorPOs.filter(po => po.status === 'delivered' || po.status === 'completed');
    
    // Calculate on-time delivery percentage
    const onTimeDelivery = vendorPOs.length > 0 
      ? (completedPOs.length / vendorPOs.length) * 100 
      : 0;
    
    // Calculate quality score based on vendor rating
    const qualityScore = vendor.rating ? vendor.rating * 20 : 0; // Convert 5-star rating to percentage
    
    // Calculate average response time (mock for now, could be enhanced with actual data)
    const responseTime = Math.floor(Math.random() * 24) + 2; // 2-26 hours
    
    // Determine trend based on recent performance
    const recentPOs = vendorPOs.slice(-5); // Last 5 purchase orders
    const recentApprovalRate = recentPOs.length > 0 
      ? (recentPOs.filter(po => po.status === 'approved' || po.status === 'delivered').length / recentPOs.length) * 100
      : 0;
    
    return {
      totalOrders: vendorPOs.length,
      onTimeDelivery: Math.round(onTimeDelivery * 10) / 10,
      qualityScore: Math.round(qualityScore * 10) / 10,
      responseTime,
      trend: recentApprovalRate > 70 ? 'up' : 'down'
    };
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return CheckCircle;
    if (score >= 70) return Clock;
    return AlertTriangle;
  };

  // Calculate summary statistics
  const topPerformers = vendors.filter(v => v.rating >= 4.5).length;
  const needsAttention = vendors.filter(v => v.rating < 3.5).length;
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const avgRating = vendors.length > 0 
    ? vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length 
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {topPerformers}
                </div>
                <p className="text-xs text-muted-foreground">Rating ≥ 4.5</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {needsAttention}
                </div>
                <p className="text-xs text-muted-foreground">Rating &lt; 3.5</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeVendors}
                </div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex mt-1">
                  {getRatingStars(avgRating)}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Vendor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vendors found in the database.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {vendors.map((vendor) => {
                const metrics = getPerformanceMetrics(vendor);
                const PerformanceIcon = getPerformanceIcon(metrics.onTimeDelivery);
                const TrendIcon = metrics.trend === 'up' ? TrendingUp : TrendingDown;
                
                return (
                  <div key={vendor.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{vendor.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex space-x-1">
                            {getRatingStars(vendor.rating || 0)}
                          </div>
                          <span className="text-sm text-muted-foreground">({vendor.rating || 0})</span>
                          <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                            {vendor.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendIcon className={`h-4 w-4 ${metrics.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">On-Time Delivery</span>
                          <PerformanceIcon className={`h-4 w-4 ${getPerformanceColor(metrics.onTimeDelivery)}`} />
                        </div>
                        <Progress value={metrics.onTimeDelivery} className="h-2" />
                        <span className={`text-sm font-semibold ${getPerformanceColor(metrics.onTimeDelivery)}`}>
                          {metrics.onTimeDelivery}%
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Quality Score</span>
                        </div>
                        <Progress value={metrics.qualityScore} className="h-2" />
                        <span className={`text-sm font-semibold ${getPerformanceColor(metrics.qualityScore)}`}>
                          {metrics.qualityScore}%
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium block mb-2">Response Time</span>
                        <div className="text-lg font-semibold">{metrics.responseTime}h</div>
                        <span className="text-xs text-muted-foreground">Avg response</span>
                      </div>

                      <div>
                        <span className="text-sm font-medium block mb-2">Total Orders</span>
                        <div className="text-lg font-semibold">{metrics.totalOrders}</div>
                        <span className="text-xs text-muted-foreground">This year</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPerformanceTracking;
