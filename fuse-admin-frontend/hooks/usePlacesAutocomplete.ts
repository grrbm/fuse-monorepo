import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

type UsePlacesAutocompleteArgs = {
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void
  componentRestrictions?: google.maps.places.ComponentRestrictions
}

type AutocompleteState = {
  isReady: boolean
  error: string | null
}

export function usePlacesAutocomplete({
  onPlaceSelected,
  componentRestrictions,
}: UsePlacesAutocompleteArgs = {}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const loaderRef = useRef<Loader | null>(null)
  const [state, setState] = useState<AutocompleteState>({ isReady: false, error: null })

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (!inputRef.current) {
        setState({ isReady: false, error: 'Address input not ready yet' })
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        setState({ isReady: false, error: 'Google Maps API key is missing' })
        return
      }

      if (!loaderRef.current) {
        loaderRef.current = new Loader({
          apiKey,
          libraries: ['places'],
        })
      }

      try {
        const google = await loaderRef.current.load()
        if (!isMounted || !inputRef.current) return

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['address_components', 'formatted_address', 'geometry'],
          componentRestrictions,
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (onPlaceSelected) {
            onPlaceSelected(place)
          }
        })

        autocompleteRef.current = autocomplete
        setState({ isReady: true, error: null })
      } catch (error) {
        console.error('Failed to load Google Places API', error)
        setState({ isReady: false, error: 'Failed to load Google Places API' })
      }
    }

    initialize()

    return () => {
      isMounted = false
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [componentRestrictions, onPlaceSelected])

  return {
    inputRef,
    isReady: state.isReady,
    error: state.error,
  }
}
