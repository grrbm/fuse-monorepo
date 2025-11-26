import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_OPTIONS } from "@fuse/enums"

interface Product {
    id: string
    name: string
    description: string
    price: number
    pharmacyWholesaleCost?: number | null
    placeholderSig: string
    activeIngredients: string[]
    category?: string
    categories?: string[]
    isActive: boolean
    imageUrl?: string
}

interface ProductHeaderProps {
    product: Product
}

export function ProductHeader({ product }: ProductHeaderProps) {
    const categories = Array.isArray(product.categories) && product.categories.length > 0
        ? product.categories
        : product.category
            ? [product.category]
            : []

    const wholesaleCost = typeof product.pharmacyWholesaleCost === 'number'
        ? product.pharmacyWholesaleCost
        : product.price

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
                        {categories.length > 0 && (
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="font-medium text-muted-foreground">Categories:</span>
                                <div className="inline-flex flex-wrap gap-2">
                                    {categories.map((category) => {
                                        const label = CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category
                                        return (
                                            <span key={category} className="inline-flex items-center rounded-full bg-[#E0F2F1] text-[#196459] px-2.5 py-0.5 text-xs font-semibold">
                                                {label}
                                        </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        {product.placeholderSig && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-muted-foreground">Placeholder Sig:</span>
                                <span className="text-foreground">{product.placeholderSig}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground">Wholesale Cost:</span>
                            <span className="text-foreground">${wholesaleCost.toFixed(2)}</span>
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

