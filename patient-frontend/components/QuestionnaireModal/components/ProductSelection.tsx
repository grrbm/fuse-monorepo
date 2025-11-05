import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { Product } from "../types";

interface ProductSelectionProps {
    products: Product[];
    selectedProducts: Record<string, number>;
    onChange: (productId: string, quantity: number) => void;
}

export const ProductSelection: React.FC<ProductSelectionProps> = ({
    products,
    selectedProducts,
    onChange,
}) => {
    if (!products || products.length === 0) {
        return null;
    }

    const total = Object.entries(selectedProducts).reduce((sum, [productId, quantity]) => {
        if (quantity <= 0) return sum;
        const product = products.find((item) => item.id === productId);
        return sum + (product ? (product.price ?? 0) * quantity : 0);
    }, 0);

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Select Your Products</h2>
                <p className="text-gray-600">
                    Choose the NAD+ products you'd like to order
                </p>
            </div>

            <div className="space-y-4">
                {products.map((product) => {
                    const quantity = selectedProducts[product.id] || 0;
                    const totalPrice = (product.price ?? 0) * quantity;

                    return (
                        <Card key={product.id} className="p-4">
                            <CardBody className="p-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{product.name}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                                        <p className="text-sm text-gray-500">
                                            <span className="font-medium">Sig:</span> {product.placeholderSig}
                                        </p>
                                        <p className="text-lg font-bold text-primary">${product.price}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            isDisabled={quantity <= 0}
                                            onPress={() => onChange(product.id, Math.max(0, quantity - 1))}
                                        >
                                            <Icon icon="lucide:minus" />
                                        </Button>

                                        <div className="min-w-[60px] text-center">
                                            <span className="text-lg font-semibold">{quantity}</span>
                                            {quantity > 0 && (
                                                <p className="text-sm text-primary font-medium">
                                                    ${totalPrice.toFixed(2)}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onPress={() => onChange(product.id, quantity + 1)}
                                        >
                                            <Icon icon="lucide:plus" />
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>

            <Card className="bg-primary-50 border border-primary-200">
                <CardBody className="p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
