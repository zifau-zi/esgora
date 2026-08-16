const CITIES = [
  'Surabaya',
  'Malang',
  'Bandung',
  'Yogyakarta',
  'Jakarta',
  'Semarang',
  'Medan',
  'Makassar',
  'Denpasar',
  'Balikpapan',
]

// Duplikasi daftar agar animasi marquee seamless (translateX -50% = satu set penuh).
const LOOP = [...CITIES, ...CITIES]

export default function CityMarquee({ activeCity, onSelect }) {
  return (
    <div className="city-marquee">
      <div className="city-marquee-track">
        {LOOP.map((city, i) => (
          <button
            key={`${city}-${i}`}
            type="button"
            onClick={() => onSelect?.(city)}
            className={`city-pill mr-3${city === activeCity ? ' city-pill--active' : ''}`}
            aria-pressed={city === activeCity}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  )
}
