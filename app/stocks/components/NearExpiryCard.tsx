"use client";

/**
 * Near Expiry Card Component
 * Displays products that are near expiry
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NearExpiryProduct } from "@/types";
import { Calendar, AlertTriangle } from "lucide-react";

interface NearExpiryCardProps {
  products: NearExpiryProduct[];
}

export function NearExpiryCard({ products }: NearExpiryCardProps) {
  const criticalProducts = products.filter((p) => p.daysUntilExpiry <= 7);
  const warningProducts = products.filter((p) => p.daysUntilExpiry > 7 && p.daysUntilExpiry <= 30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Near Expiry Products
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products near expiry
          </div>
        ) : (
          <div className="space-y-4">
            {criticalProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h4 className="font-semibold text-destructive">Critical (Expiring in 7 days or less)</h4>
                </div>
                <div className="space-y-2">
                  {criticalProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-destructive rounded-lg bg-destructive/5"
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Expires: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {product.daysUntilExpiry} {product.daysUntilExpiry === 1 ? "day" : "days"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {warningProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <h4 className="font-semibold text-orange-500">Warning (Expiring in 8-30 days)</h4>
                </div>
                <div className="space-y-2">
                  {warningProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Expires: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {product.daysUntilExpiry} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {products.length > 30 && (
              <div className="text-sm text-muted-foreground">
                Showing {criticalProducts.length + warningProducts.length} of {products.length} products near expiry
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
