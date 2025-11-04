import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2, MapPin, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington DC' }
]

interface Pharmacy {
  id: string
  name: string
  slug: string
  supportedStates: string[]
}

interface PharmacyProduct {
  id: string | number
  sku: string | number
  name: string
  strength?: string
  nameWithStrength?: string
  dispense?: string
  label?: string
}

interface PharmacyAssignment {
  id: string
  pharmacyId: string
  state: string
  pharmacyProductId?: string
  pharmacyProductName?: string
  pharmacyWholesaleCost?: number
  pharmacy: Pharmacy
}

interface PharmacyStateManagerProps {
  productId: string
}

export function PharmacyStateManager({ productId }: PharmacyStateManagerProps) {
  const { token } = useAuth()
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [assignments, setAssignments] = useState<PharmacyAssignment[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pharmacyProducts, setPharmacyProducts] = useState<PharmacyProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedPharmacyProduct, setSelectedPharmacyProduct] = useState<PharmacyProduct | null>(null)
  const [productSearchQuery, setProductSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [productId, token])

  const fetchData = async () => {
    if (!token) return

    try {
      setLoading(true)
      // Fetch pharmacies and assignments in parallel
      const [pharmaciesRes, assignmentsRes] = await Promise.all([
        fetch(`${baseUrl}/pharmacies`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/products/${productId}/pharmacy-assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (pharmaciesRes.ok) {
        const data = await pharmaciesRes.json()
        setPharmacies(data.data || [])
      }

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json()
        setAssignments(data.data || [])
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load pharmacy data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch pharmacy products when pharmacy and states are selected
  useEffect(() => {
    if (!selectedPharmacy || selectedStates.length === 0 || !token) {
      setPharmacyProducts([])
      return
    }

    const fetchPharmacyProducts = async () => {
      const pharmacy = pharmacies.find(p => p.id === selectedPharmacy)
      if (!pharmacy) return

      setLoadingProducts(true)
      try {
        const statesQuery = selectedStates.join(',')
        const response = await fetch(
          `${baseUrl}/pharmacies/${pharmacy.slug}/products?states=${statesQuery}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (response.ok) {
          const data = await response.json()
          setPharmacyProducts(data.data || [])
        } else {
          console.error('Failed to fetch pharmacy products')
          setPharmacyProducts([])
        }
      } catch (err) {
        console.error('Error fetching pharmacy products:', err)
        setPharmacyProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchPharmacyProducts()
  }, [selectedPharmacy, selectedStates, token, pharmacies, baseUrl])

  const assignedStates = assignments.map(a => a.state)
  const availableStates = US_STATES.filter(s => !assignedStates.includes(s.code))
  const availableStatesForSelectedPharmacy = selectedPharmacy
    ? availableStates.filter(s => {
      const pharmacy = pharmacies.find(p => p.id === selectedPharmacy)
      return pharmacy?.supportedStates.includes(s.code)
    })
    : []

  // Filter pharmacy products by search query
  const filteredPharmacyProducts = pharmacyProducts.filter(product =>
    product.nameWithStrength?.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.sku.toString().includes(productSearchQuery)
  )

  const handleAddAssignment = async () => {
    if (!token || !selectedPharmacy || selectedStates.length === 0) return

    try {
      setSaving(true)
      setError(null)

      const payload: any = {
        pharmacyId: selectedPharmacy,
        states: selectedStates,
      }

      // Include pharmacy product info if selected
      if (selectedPharmacyProduct) {
        payload.pharmacyProductId = selectedPharmacyProduct.sku.toString()
        payload.pharmacyProductName = selectedPharmacyProduct.nameWithStrength || selectedPharmacyProduct.name
      }

      const response = await fetch(`${baseUrl}/products/${productId}/pharmacy-assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign pharmacy")
      }

      // Reset form and refresh
      setSelectedStates([])
      setSelectedPharmacy("")
      setSelectedPharmacyProduct(null)
      setPharmacyProducts([])
      setProductSearchQuery("")
      setShowAddForm(false)
      await fetchData()
    } catch (err: any) {
      console.error("Error adding assignment:", err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCustomPrice = async (assignmentId: string, customPrice: number) => {
    if (!token) return

    try {
      const response = await fetch(`${baseUrl}/pharmacy-assignments/${assignmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pharmacyWholesaleCost: customPrice }),
      })

      if (!response.ok) {
        throw new Error("Failed to update custom price")
      }

      await fetchData() // Refresh to show the updated price
    } catch (err) {
      console.error("Error updating custom price:", err)
      setError("Failed to update custom price")
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!token || !confirm("Remove this pharmacy assignment?")) return

    try {
      const response = await fetch(`${baseUrl}/pharmacy-assignments/${assignmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to remove assignment")
      }

      await fetchData()
    } catch (err) {
      console.error("Error removing assignment:", err)
      setError("Failed to remove assignment")
    }
  }

  const handleRemoveAllPharmacyAssignments = async (pharmacyId: string, pharmacyName: string) => {
    if (!token || !confirm(`Remove all ${pharmacyName} coverage? This will delete all state assignments for this pharmacy.`)) return

    try {
      const response = await fetch(`${baseUrl}/products/${productId}/pharmacies/${pharmacyId}/assignments`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to remove pharmacy coverage")
      }

      await fetchData()
    } catch (err) {
      console.error("Error removing pharmacy coverage:", err)
      setError("Failed to remove pharmacy coverage")
    }
  }

  // Group assignments by pharmacy
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const pharmacyId = assignment.pharmacyId
    if (!acc[pharmacyId]) {
      acc[pharmacyId] = {
        pharmacy: assignment.pharmacy,
        states: []
      }
    }
    acc[pharmacyId].states.push(assignment.state)
    acc[pharmacyId].states.sort()
    return acc
  }, {} as Record<string, { pharmacy: Pharmacy; states: string[] }>)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pharmacy & State Coverage
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Coverage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Add Assignment Form */}
        {showAddForm && (
          <div className="p-4 border border-border rounded-lg space-y-4 bg-muted/30">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Pharmacy</label>
              <select
                value={selectedPharmacy}
                onChange={(e) => {
                  setSelectedPharmacy(e.target.value)
                  setSelectedStates([]) // Reset states when pharmacy changes
                }}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Choose a pharmacy...</option>
                {pharmacies.map((pharmacy) => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name} ({pharmacy.supportedStates.length} states)
                  </option>
                ))}
              </select>
            </div>

            {selectedPharmacy && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select States (available for this pharmacy)
                </label>
                <div className="max-h-48 overflow-y-auto border border-border rounded-md p-2 bg-background">
                  {availableStatesForSelectedPharmacy.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-2">
                      All states supported by this pharmacy are already assigned.
                    </p>
                  ) : (
                    <>
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:bg-muted p-2 rounded mb-2 border-b border-border">
                        <input
                          type="checkbox"
                          checked={selectedStates.length === availableStatesForSelectedPharmacy.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStates(availableStatesForSelectedPharmacy.map(s => s.code))
                            } else {
                              setSelectedStates([])
                            }
                          }}
                          className="rounded"
                        />
                        <span>Select All ({availableStatesForSelectedPharmacy.length} states)</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableStatesForSelectedPharmacy.map((state) => (
                          <label key={state.code} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded">
                            <input
                              type="checkbox"
                              checked={selectedStates.includes(state.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStates([...selectedStates, state.code])
                                } else {
                                  setSelectedStates(selectedStates.filter(s => s !== state.code))
                                }
                              }}
                              className="rounded"
                            />
                            <span>{state.code}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Pharmacy Product Selector */}
            {selectedPharmacy && selectedStates.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Pharmacy Product (Optional)
                </label>
                {loadingProducts ? (
                  <div className="flex items-center justify-center p-4 border border-border rounded-md bg-background">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">Loading products...</span>
                  </div>
                ) : (
                  <>
                    <Input
                      type="text"
                      placeholder="Search products by name or SKU..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-64 overflow-y-auto border border-border rounded-md bg-background">
                      {filteredPharmacyProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          {productSearchQuery ? "No products found matching your search." : "No products available."}
                        </p>
                      ) : (
                        <div className="divide-y divide-border">
                          {filteredPharmacyProducts.map((product) => (
                            <label
                              key={product.id}
                              className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedPharmacyProduct?.id === product.id ? 'bg-muted' : ''
                                }`}
                            >
                              <input
                                type="radio"
                                name="pharmacyProduct"
                                checked={selectedPharmacyProduct?.id === product.id}
                                onChange={() => setSelectedPharmacyProduct(product)}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">
                                  {product.nameWithStrength || product.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  SKU: {product.sku}
                                  {product.dispense && ` • ${product.dispense}`}
                                </div>
                                {product.label && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {product.label}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedPharmacyProduct && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setSelectedPharmacyProduct(null)}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddAssignment}
                disabled={!selectedPharmacy || selectedStates.length === 0 || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Pharmacy"
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Current Assignments */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Current Coverage</h3>
          {Object.keys(groupedAssignments).length === 0 ? (
            <div className="text-center p-8 border border-dashed border-border rounded-lg">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No pharmacy coverage assigned yet. Add coverage to make this product available in specific states.
              </p>
            </div>
          ) : (
            Object.values(groupedAssignments).map(({ pharmacy, states }) => {
              const firstAssignment = assignments.find(a => a.pharmacyId === pharmacy.id)
              return (
                <div key={pharmacy.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{pharmacy.name}</h4>
                      <p className="text-sm text-muted-foreground">{states.length} states covered</p>
                      <div className="mt-2 text-sm space-y-1">
                        {/* Show pharmacy product info if selected */}
                        {firstAssignment?.pharmacyProductName && (
                          <div>
                            <span className="text-muted-foreground">Pharmacy Product: </span>
                            <span className="font-medium">{firstAssignment.pharmacyProductName}</span>
                            {firstAssignment.pharmacyProductId && (
                              <span className="text-muted-foreground ml-2">(SKU: {firstAssignment.pharmacyProductId})</span>
                            )}
                          </div>
                        )}
                        
                        {/* Pricing section - always show */}
                        {firstAssignment && (
                          firstAssignment.pharmacyWholesaleCost ? (
                            <div>
                              <span className="text-muted-foreground">Wholesale Cost: </span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                ${Number(firstAssignment.pharmacyWholesaleCost).toFixed(2)}
                              </span>
                              <Badge variant="outline" className="ml-2 text-xs">From Pharmacy API</Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-muted-foreground text-sm">Custom Wholesale Price:</span>
                              <div className="flex items-center gap-1">
                                <span className="text-sm">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="w-24 h-8 text-sm"
                                  defaultValue={firstAssignment.pharmacyWholesaleCost || ""}
                                  onBlur={(e) => {
                                    const customPrice = parseFloat(e.target.value)
                                    if (!isNaN(customPrice) && customPrice > 0) {
                                      handleUpdateCustomPrice(firstAssignment.id, customPrice)
                                    }
                                  }}
                                />
                              </div>
                              <Badge variant="secondary" className="text-xs">Manual Entry</Badge>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAllPharmacyAssignments(pharmacy.id, pharmacy.name)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {states.map((state) => {
                      const assignment = assignments.find(a => a.pharmacyId === pharmacy.id && a.state === state)
                      return (
                        <Badge
                          key={state}
                          variant="secondary"
                          className="group relative pr-8"
                        >
                          {state}
                          <button
                            onClick={() => assignment && handleRemoveAssignment(assignment.id)}
                            className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

