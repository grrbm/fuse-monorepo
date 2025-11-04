import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Product {
    id: string
    name: string
    description: string
    price: number
    dosage: string
    activeIngredients: string[]
    category?: string
    isActive: boolean
}

interface ProductHeaderProps {
    product: Product
}

export function ProductHeader({ product }: ProductHeaderProps) {
    return (
        <div className="mb-6 pb-6 border-b border-border/40">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
                        <Badge variant={product.isActive ? "default" : "secondary"} className="ml-2">
                            {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    {product.description && (
                        <p className="text-muted-foreground text-base leading-relaxed mb-4">{product.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4">
                        {product.category && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-muted-foreground">Category:</span>
                                <span className="text-foreground">{product.category}</span>
                            </div>
                        )}
                        {product.dosage && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-muted-foreground">Dosage:</span>
                                <span className="text-foreground">{product.dosage}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground">Wholesale Cost:</span>
                            <span className="text-foreground">${product.price.toFixed(2)}</span>
                        </div>
                        {product.activeIngredients && product.activeIngredients.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-muted-foreground">Active Ingredients:</span>
                                <span className="text-foreground">{product.activeIngredients.join(", ")}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

